var HEADERS_ = Object.freeze([
	"lead_id",
	"recebido_em_utc",
	"nome_completo",
	"email",
	"whatsapp",
	"cta_origem",
	"pagina",
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
	"consentimento",
	"consentido_em_utc",
	"consentimento_versao",
]);

var REQUEST_KEYS_ = Object.freeze(["secret"].concat(HEADERS_));
var CTA_ORIGINS_ = Object.freeze([
	"header_desktop",
	"hero",
	"investimento",
	"cta_final",
	"footer",
	"flutuante_desktop",
	"sticky_mobile",
	"aplicacao",
	"boston",
]);
var CONSENT_VERSION_ = "otb-lead-v1";
var SHEET_ID_ = "1Nt12dz3uplG4Lj66nGsGSL-owP7bTO8YmFBpkjoGZfU";
var SHEET_NAME_ = "Página1";
var SECRET_PROPERTY_ = "LEADS_WEBAPP_SECRET";
var MAX_REQUEST_BYTES_ = 32768;

function json_(payload) {
	return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
		ContentService.MimeType.JSON,
	);
}

function fail_() {
	return json_({ ok: false });
}

function hasExactKeys_(value, expectedKeys) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	var actual = Object.keys(value).sort();
	var expected = expectedKeys.slice().sort();
	if (actual.length !== expected.length) return false;
	for (var index = 0; index < expected.length; index += 1) {
		if (actual[index] !== expected[index]) return false;
	}
	return true;
}

function isIsoTimestamp_(value) {
	return (
		typeof value === "string" &&
		/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
		!Number.isNaN(Date.parse(value))
	);
}

function isBoundedString_(value, minimum, maximum) {
	return (
		typeof value === "string" &&
		value.length >= minimum &&
		value.length <= maximum
	);
}

function validatePayload_(payload) {
	if (!hasExactKeys_(payload, REQUEST_KEYS_)) {
		throw new Error("invalid_request");
	}

	var row = {};
	for (var index = 0; index < HEADERS_.length; index += 1) {
		var header = HEADERS_[index];
		if (typeof payload[header] !== "string") {
			throw new Error("invalid_request");
		}
		row[header] = payload[header];
	}

	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.lead_id)) {
		throw new Error("invalid_request");
	}
	if (
		!isIsoTimestamp_(row.recebido_em_utc) ||
		!isIsoTimestamp_(row.consentido_em_utc)
	) {
		throw new Error("invalid_request");
	}
	if (
		!isBoundedString_(row.nome_completo, 3, 120) ||
		row.nome_completo.trim().split(/\s+/).length < 2
	) {
		throw new Error("invalid_request");
	}
	// Optional since the inline application section — mirrors normalizeEmail in
	// src/lib/leads.ts. Empty is accepted and lands as a blank cell; malformed is
	// still rejected. The column itself never moves.
	if (typeof row.email !== "string") {
		throw new Error("invalid_request");
	}
	if (
		row.email !== "" &&
		(!isBoundedString_(row.email, 5, 254) ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email))
	) {
		throw new Error("invalid_request");
	}
	if (!/^\+\d{10,15}$/.test(row.whatsapp)) {
		throw new Error("invalid_request");
	}
	if (CTA_ORIGINS_.indexOf(row.cta_origem) === -1 || row.pagina !== "/") {
		throw new Error("invalid_request");
	}

	var utmKeys = [
		"utm_source",
		"utm_medium",
		"utm_campaign",
		"utm_content",
		"utm_term",
	];
	for (var utmIndex = 0; utmIndex < utmKeys.length; utmIndex += 1) {
		if (row[utmKeys[utmIndex]].length > 100) {
			throw new Error("invalid_request");
		}
	}
	if (
		row.consentimento !== "SIM" ||
		row.consentimento_versao !== CONSENT_VERSION_
	) {
		throw new Error("invalid_request");
	}
	return row;
}

function sanitizeForSheet_(value) {
	var text = String(value == null ? "" : value).replace(
		/[\u0000-\u001f\u007f]/g,
		"",
	);
	if (/^\s*[=+\-@]/.test(text)) return "'" + text;
	return text;
}

function assertHeader_(sheet) {
	if (sheet.getLastRow() === 0) {
		var headerRange = sheet.getRange(1, 1, 1, HEADERS_.length);
		headerRange.setNumberFormat("@");
		headerRange.setValues([HEADERS_.slice()]);
		return;
	}
	if (sheet.getLastColumn() !== HEADERS_.length) {
		throw new Error("schema_mismatch");
	}
	var current = sheet.getRange(1, 1, 1, HEADERS_.length).getValues()[0];
	for (var index = 0; index < HEADERS_.length; index += 1) {
		if (String(current[index]) !== HEADERS_[index]) {
			throw new Error("schema_mismatch");
		}
	}
}

function hasLead_(sheet, leadId) {
	var lastRow = sheet.getLastRow();
	if (lastRow < 2) return false;
	return Boolean(
		sheet
			.getRange(2, 1, lastRow - 1, 1)
			.createTextFinder(leadId)
			.matchEntireCell(true)
			.findNext(),
	);
}

function storeLead_(sheet, payload) {
	assertHeader_(sheet);
	if (hasLead_(sheet, payload.lead_id)) return { existing: true };

	var row = HEADERS_.map(function (header) {
		return sanitizeForSheet_(payload[header]);
	});
	var target = sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS_.length);
	target.setNumberFormat("@");
	target.setValues([row]);
	return { existing: false };
}

function doPost(e) {
	try {
		if (
			!e ||
			!e.postData ||
			typeof e.postData.contents !== "string" ||
			String(e.postData.type || "").toLowerCase().indexOf("application/json") !== 0
		) {
			return fail_();
		}

		var raw = e.postData.contents;
		if (Utilities.newBlob(raw).getBytes().length > MAX_REQUEST_BYTES_) {
			return fail_();
		}
		var payload = JSON.parse(raw);
		if (!hasExactKeys_(payload, REQUEST_KEYS_)) return fail_();

		var expectedSecret =
			PropertiesService.getScriptProperties().getProperty(SECRET_PROPERTY_);
		if (
			!expectedSecret ||
			typeof payload.secret !== "string" ||
			payload.secret !== expectedSecret
		) {
			return fail_();
		}

		var validated = validatePayload_(payload);
		var spreadsheet = SpreadsheetApp.openById(SHEET_ID_);
		var sheet = spreadsheet.getSheetByName(SHEET_NAME_);
		if (!sheet) return fail_();

		var lock = LockService.getScriptLock();
		if (!lock.tryLock(5000)) return fail_();
		try {
			storeLead_(sheet, validated);
		} finally {
			lock.releaseLock();
		}
		return json_({ ok: true, leadId: validated.lead_id });
	} catch (_error) {
		return fail_();
	}
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		HEADERS_: HEADERS_,
		sanitizeForSheet_: sanitizeForSheet_,
		storeLead_: storeLead_,
		validatePayload_: validatePayload_,
	};
}
