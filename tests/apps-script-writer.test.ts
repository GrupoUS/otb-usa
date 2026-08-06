import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

interface WriterExports {
	HEADERS_: string[];
	sanitizeForSheet_(value: unknown): string;
	storeLead_(sheet: SheetMock, payload: Record<string, string>): {
		existing: boolean;
	};
	validatePayload_(payload: Record<string, unknown>): Record<string, string>;
}

class RangeMock {
	constructor(
		private sheet: SheetMock,
		private row: number,
		private column: number,
		private numRows: number,
		private numColumns: number,
	) {}

	getValues() {
		return Array.from({ length: this.numRows }, (_unused, rowOffset) =>
			Array.from({ length: this.numColumns }, (_empty, columnOffset) =>
				this.sheet.rows[this.row - 1 + rowOffset]?.[
					this.column - 1 + columnOffset
				] ?? "",
			),
		);
	}

	setNumberFormat(_format: string) {
		return this;
	}

	setValues(values: string[][]) {
		for (let rowOffset = 0; rowOffset < values.length; rowOffset += 1) {
			const targetRow = this.row - 1 + rowOffset;
			this.sheet.rows[targetRow] ??= [];
			for (
				let columnOffset = 0;
				columnOffset < values[rowOffset].length;
				columnOffset += 1
			) {
				this.sheet.rows[targetRow][this.column - 1 + columnOffset] =
					values[rowOffset][columnOffset];
			}
		}
		return this;
	}

	createTextFinder(query: string) {
		let matchEntireCell = false;
		const range = this;
		return {
			matchEntireCell(value: boolean) {
				matchEntireCell = value;
				return this;
			},
			findNext() {
				for (const row of range.getValues()) {
					for (const cell of row) {
						const value = String(cell);
						if (matchEntireCell ? value === query : value.includes(query)) {
							return { value };
						}
					}
				}
				return null;
			},
		};
	}
}

class SheetMock {
	rows: string[][] = [];

	getLastRow() {
		return this.rows.length;
	}

	getLastColumn() {
		return Math.max(0, ...this.rows.map((row) => row.length));
	}

	getRange(row: number, column: number, numRows = 1, numColumns = 1) {
		return new RangeMock(this, row, column, numRows, numColumns);
	}
}

const code = readFileSync(
	new URL(
		"../integrations/google-apps-script/otb-leads/Code.js",
		import.meta.url,
	),
	"utf8",
);
const moduleBox: { exports: Partial<WriterExports> } = { exports: {} };
new Function("module", code)(moduleBox);
const writer = moduleBox.exports as WriterExports;

function validWriterPayload(
	overrides: Record<string, unknown> = {},
): Record<string, unknown> {
	return {
		secret: "not-returned-by-validation",
		lead_id: "0191b262-7cc4-4f68-bcd0-8e964da87231",
		recebido_em_utc: "2026-08-06T15:00:00.000Z",
		nome_completo: "Ana Maria",
		email: "ana@example.com",
		whatsapp: "+5562999998888",
		cta_origem: "hero",
		pagina: "/",
		utm_source: "google",
		utm_medium: "cpc",
		utm_campaign: "otb",
		utm_content: "hero",
		utm_term: "mba boston",
		consentimento: "SIM",
		consentido_em_utc: "2026-08-06T15:00:00.000Z",
		consentimento_versao: "otb-lead-v1",
		...overrides,
	};
}

describe("Apps Script writer helpers", () => {
	it("neutralizes formula prefixes and strips control characters", () => {
		expect(writer.sanitizeForSheet_("=IMPORTXML(\"x\")")).toBe(
			"'=IMPORTXML(\"x\")",
		);
		expect(writer.sanitizeForSheet_(" \t+SUM(1,2)\u0000")).toBe(
			"' +SUM(1,2)",
		);
		expect(writer.sanitizeForSheet_("@command\u007f")).toBe("'@command");
		expect(writer.sanitizeForSheet_("-1+2")).toBe("'-1+2");
	});

	it("initializes the exact header and stores one row per lead_id", () => {
		const sheet = new SheetMock();
		const payload = writer.validatePayload_(
			validWriterPayload({ nome_completo: "=SUM Ana Maria" }),
		);

		expect(writer.storeLead_(sheet, payload)).toEqual({ existing: false });
		expect(writer.storeLead_(sheet, payload)).toEqual({ existing: true });
		expect(sheet.rows).toHaveLength(2);
		expect(sheet.rows[0]).toEqual(writer.HEADERS_);
		expect(sheet.rows[1][0]).toBe(payload.lead_id);
		expect(sheet.rows[1][2]).toBe("'=SUM Ana Maria");
	});

	const invalidWriterCases: Array<[string, Record<string, unknown>]> = [
		["invalid CTA", { cta_origem: "partner" }],
		["invalid phone", { whatsapp: "62999998888" }],
		["false consent", { consentimento: "NAO" }],
		["unexpected field", { extra: "x" }],
	];

	it.each(invalidWriterCases)(
		"rejects %s",
		(_label: string, changes: Record<string, unknown>) => {
			expect(() => writer.validatePayload_(validWriterPayload(changes))).toThrow();
		},
	);
});
