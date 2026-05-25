#!/usr/bin/env node
/**
 * CDP Tool — Unified Chrome DevTools Protocol client for browser-based debugging.
 * Runs on the host side (Windows / macOS / Linux). On Windows from WSL, route via PowerShell.
 *
 * Usage:
 *   node cdp-tool.js <command> [args...]
 *
 * Commands:
 *   navigate <url> [waitMs]         Navigate to URL and wait
 *   screenshot <output-path>        Capture PNG screenshot
 *   analyze                         Return page metrics (dead anchors, empty buttons, etc.)
 *   eval <expression>               Evaluate JS expression and return result
 *   info                            Return current URL + title
 *   cookies                         Export cookies for the configured domain(s) as JSON
 *
 * Page selection:
 *   By default, finds a page whose URL matches the host of project.stagingUrl
 *   from .claude/config.json. Override with $CDP_URL_MATCH env var.
 *
 * Cookie domains:
 *   Defaults to project.stagingUrl + project.productionUrl from config.json.
 *   Override with $CDP_COOKIE_URLS (comma-separated).
 */

const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function writeStdout(value) {
  process.stdout.write(`${value}\n`);
}

function writeStderr(value) {
  process.stderr.write(`${value}\n`);
}

function exitWithError(message) {
  writeStderr(message);
  process.exit(1);
}

function loadConfig() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const configPath = path.join(projectDir, ".claude", "config.json");
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (_) {}
  return {};
}

const CONFIG = loadConfig();
const PROJECT = CONFIG.project || {};

function getUrlMatch() {
  if (process.env.CDP_URL_MATCH) return process.env.CDP_URL_MATCH;
  try {
    const u = (PROJECT.stagingUrl || "").trim();
    if (u) return new URL(u).hostname || u;
  } catch (_) {}
  return "";
}

function getCookieUrls() {
  if (process.env.CDP_COOKIE_URLS) {
    return process.env.CDP_COOKIE_URLS.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const urls = [];
  if (PROJECT.stagingUrl) urls.push(PROJECT.stagingUrl);
  if (PROJECT.productionUrl) urls.push(PROJECT.productionUrl);
  return urls;
}

const URL_MATCH = getUrlMatch();
const COOKIE_URLS = getCookieUrls();

const CDP_PORT = process.env.CDP_PORT || 9222;
const COMMAND = process.argv[2];
const ARG1 = process.argv[3];
const ARG2 = process.argv[4];

// --- WebSocket helpers ---

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString("base64");
    const req = http.request({
      hostname: url.hostname,
      port: url.port || CDP_PORT,
      path: url.pathname,
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
        "Sec-WebSocket-Key": key,
        "Sec-WebSocket-Version": "13",
      },
    });
    req.on("upgrade", (_, socket) => resolve(socket));
    req.on("error", reject);
    req.end();
  });
}

function sendWS(socket, msg) {
  const payload = Buffer.from(JSON.stringify(msg));
  const mask = crypto.randomBytes(4);
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(6);
    header[0] = 0x81;
    header[1] = 0x80 | payload.length;
    mask.copy(header, 2);
  } else if (payload.length < 65536) {
    header = Buffer.alloc(8);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
    mask.copy(header, 4);
  } else {
    header = Buffer.alloc(14);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
    mask.copy(header, 10);
  }
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];
  socket.write(Buffer.concat([header, masked]));
}

function receiveWS(socket, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const chunks = [];
    let resolved = false;
    const onData = (chunk) => {
      if (resolved) return;
      chunks.push(chunk);
      const buf = Buffer.concat(chunks);
      if (buf.length < 2) return;
      let len = buf[1] & 0x7f,
        offset = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2);
        offset = 4;
      } else if (len === 127) {
        if (buf.length < 10) return;
        len = Number(buf.readBigUInt64BE(2));
        offset = 10;
      }
      if (buf.length >= offset + len) {
        resolved = true;
        socket.removeListener("data", onData);
        try {
          resolve(JSON.parse(buf.slice(offset, offset + len).toString()));
        } catch {
          resolve(buf.slice(offset, offset + len).toString());
        }
      }
    };
    socket.on("data", onData);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.removeListener("data", onData);
        resolve({ error: "timeout" });
      }
    }, timeoutMs);
  });
}

async function sendAndReceive(socket, msg) {
  sendWS(socket, msg);
  return receiveWS(socket);
}

// --- CDP helpers ---

async function getPageTarget() {
  const list = await new Promise((resolve, reject) => {
    http
      .get(`http://localhost:${CDP_PORT}/json/list`, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(JSON.parse(d)));
      })
      .on("error", reject);
  });
  return list.find((t) => {
    if (t.type !== "page") return false;
    const url = t.url || "";
    if (url.startsWith("chrome-extension://") || url.startsWith("chrome://") || url.startsWith("devtools://")) return false;
    if (!URL_MATCH) return true;
    return url.includes(URL_MATCH);
  });
}

// --- Commands ---

async function cmdNavigate(url) {
  const page = await getPageTarget();
  if (!page) {
    exitWithError(`No matching page found in CDP (match: '${URL_MATCH || "any"}')`);
  }
  const socket = await wsConnect(page.webSocketDebuggerUrl);
  await sendAndReceive(socket, { id: 1, method: "Page.navigate", params: { url } });
  const waitMs = Number.parseInt(ARG2, 10) || 5000;
  await new Promise((r) => setTimeout(r, waitMs));
  const evalUrl = await sendAndReceive(socket, {
    id: 2,
    method: "Runtime.evaluate",
    params: { expression: "location.href" },
  });
  const evalTitle = await sendAndReceive(socket, {
    id: 3,
    method: "Runtime.evaluate",
    params: { expression: "document.title" },
  });
  writeStdout(`URL: ${evalUrl?.result?.result?.value || "unknown"}`);
  writeStdout(`Title: ${evalTitle?.result?.result?.value || "unknown"}`);
  socket.end();
}

async function cmdScreenshot(outputPath) {
  const page = await getPageTarget();
  if (!page) {
    exitWithError(`No matching page found in CDP (match: '${URL_MATCH || "any"}')`);
  }
  const socket = await wsConnect(page.webSocketDebuggerUrl);
  const result = await sendAndReceive(socket, {
    id: 1,
    method: "Page.captureScreenshot",
    params: { format: "png" },
  });
  if (result?.result?.data) {
    fs.writeFileSync(outputPath, Buffer.from(result.result.data, "base64"));
    writeStdout(`Screenshot saved: ${outputPath}`);
  } else {
    writeStderr("Screenshot failed");
  }
  socket.end();
}

async function cmdAnalyze() {
  const page = await getPageTarget();
  if (!page) {
    exitWithError(`No matching page found in CDP (match: '${URL_MATCH || "any"}')`);
  }
  const socket = await wsConnect(page.webSocketDebuggerUrl);
  const r = await sendAndReceive(socket, {
    id: 1,
    method: "Runtime.evaluate",
    params: {
      expression: `JSON.stringify({
      url: location.href,
      title: document.title,
      deadAnchors: document.querySelectorAll('a[href="#"]').length,
      emptyButtons: Array.from(document.querySelectorAll('button')).filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
      totalButtons: document.querySelectorAll('button').length,
      imagesNoAlt: document.querySelectorAll('img:not([alt])').length,
      reactErrors: document.querySelector('#react-error-overlay')?.textContent || 'none',
      visibleErrors: document.querySelectorAll('[class*="error"], [class*="Error"]').length,
      loadingSpinners: document.querySelectorAll('[class*="spinner"], [class*="Spinner"], [class*="loading"], [class*="skeleton"], [class*="Skeleton"]').length,
      totalLinks: document.querySelectorAll('a').length,
      totalInputs: document.querySelectorAll('input, select, textarea').length,
    }, null, 2)`,
    },
  });
  writeStdout(r?.result?.result?.value || "Analysis failed");
  socket.end();
}

async function cmdEval(expression) {
  const page = await getPageTarget();
  if (!page) {
    exitWithError(`No matching page found in CDP (match: '${URL_MATCH || "any"}')`);
  }
  const socket = await wsConnect(page.webSocketDebuggerUrl);
  const r = await sendAndReceive(socket, {
    id: 1,
    method: "Runtime.evaluate",
    params: { expression },
  });
  writeStdout(r?.result?.result?.value ?? JSON.stringify(r?.result?.result));
  socket.end();
}

async function cmdInfo() {
  const page = await getPageTarget();
  if (!page) {
    exitWithError(`No matching page found in CDP (match: '${URL_MATCH || "any"}')`);
  }
  writeStdout(`URL: ${page.url}`);
  writeStdout(`Title: ${page.title}`);
}

async function cmdCookies() {
  const page = await getPageTarget();
  if (!page) {
    exitWithError(`No matching page found in CDP (match: '${URL_MATCH || "any"}')`);
  }
  const socket = await wsConnect(page.webSocketDebuggerUrl);
  await sendAndReceive(socket, { id: 1, method: "Network.enable" });
  const r = await sendAndReceive(socket, {
    id: 2,
    method: "Network.getCookies",
    params: {
      urls: COOKIE_URLS,
    },
  });
  const cookies = r?.result?.cookies || [];
  writeStdout(JSON.stringify(cookies, null, 2));
  socket.end();
}

// --- Main ---

async function main() {
  if (!COMMAND) {
    writeStdout("Usage: node cdp-tool.js <command> [args]");
    writeStdout(
      "Commands: navigate <url> [waitMs], screenshot <path>, analyze, eval <expr>, info, cookies"
    );
    process.exit(0);
  }

  switch (COMMAND) {
    case "navigate":
      await cmdNavigate(ARG1);
      break;
    case "screenshot":
      await cmdScreenshot(ARG1 || "C:\\Users\\Mauri\\screenshot.png");
      break;
    case "analyze":
      await cmdAnalyze();
      break;
    case "eval":
      await cmdEval(ARG1);
      break;
    case "info":
      await cmdInfo();
      break;
    case "cookies":
      await cmdCookies();
      break;
    default:
      exitWithError(`Unknown command: ${COMMAND}`);
  }
}

main().catch((e) => {
  exitWithError(e.message);
});
setTimeout(() => process.exit(0), 15000); // safety timeout
