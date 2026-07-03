const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const dataDir = process.env.DATA_DIR || path.join(root, "data");
const port = Number(process.env.PORT || 4174);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

fs.mkdirSync(dataDir, { recursive: true });

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/share/new" && req.method === "POST") {
      const token = crypto.randomBytes(18).toString("base64url");
      writeJson(res, { token });
      return;
    }
    if (url.pathname === "/api/health") {
      writeJson(res, { ok: true });
      return;
    }
    if (url.pathname === "/api/state") {
      await handleState(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    writeJson(res, { error: "server_error" }, 500);
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`支出伝票整理: http://127.0.0.1:${port}/`);
  console.log(`共有データ保存先: ${dataDir}`);
});

async function handleState(req, res, url) {
  const token = url.searchParams.get("share") || "";
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(token)) {
    writeJson(res, { error: "invalid_share" }, 400);
    return;
  }
  const file = path.join(dataDir, `${token}.json`);
  if (req.method === "GET") {
    if (!fs.existsSync(file)) {
      writeJson(res, { data: null, updatedAt: null });
      return;
    }
    writeJson(res, JSON.parse(fs.readFileSync(file, "utf8")));
    return;
  }
  if (req.method === "PUT") {
    const body = await readBody(req);
    const parsed = JSON.parse(body || "{}");
    fs.writeFileSync(file, JSON.stringify({ data: parsed.data, updatedAt: new Date().toISOString() }, null, 2));
    writeJson(res, { ok: true });
    return;
  }
  writeJson(res, { error: "method_not_allowed" }, 405);
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root) || filePath.startsWith(dataDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function writeJson(res, value, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        req.destroy();
        reject(new Error("body_too_large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
