/**
 * Mad Beans — SSR Server (Node.js)
 * Demonstrates Server-Side Rendering vs Client-Side Rendering
 *
 * Run: node server.js
 * Then open: http://localhost:3001/ssr   ← HTML rendered on the server
 *            http://localhost:3001/csr   ← Shell only, JS fills content
 *            http://localhost:3001/      ← Redirects to splash.html (static)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 3001;

// ─── Simulated data (in a real app this would come from a DB) ────────────────
function getSessionData() {
  return {
    activeSessions: Math.floor(Math.random() * 8) + 1,
    players: ["BeanMaster", "ChefChaos", "SpiceQueen", "GrillBot"],
    serverTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
    version: "v0.1.0 BETA",
  };
}

// ─── SSR: full HTML built on the server before sending ──────────────────────
function renderSSRPage(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mad Beans — SSR Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0c1a;
      color: #e0e0e0;
      font-family: 'Courier New', monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .badge {
      background: #00e5ff22;
      border: 1px solid #00e5ff;
      color: #00e5ff;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.7rem;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
    }
    h1 { font-size: 2rem; color: #00e5ff; margin-bottom: 0.5rem; }
    .subtitle { color: #888; font-size: 0.85rem; margin-bottom: 2rem; }
    .card {
      background: #111327;
      border: 1px solid #1e2240;
      border-radius: 8px;
      padding: 1.5rem 2rem;
      width: 100%;
      max-width: 480px;
      margin-bottom: 1rem;
    }
    .card h2 { color: #ffd700; font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 1rem; }
    .stat { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #1e2240; }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: #888; font-size: 0.85rem; }
    .stat-value { color: #00e5ff; font-weight: bold; font-size: 0.85rem; }
    .player-list { list-style: none; }
    .player-list li { padding: 0.35rem 0; color: #e0e0e0; font-size: 0.85rem; }
    .player-list li::before { content: "▸ "; color: #00e5ff; }
    .explanation {
      background: #0d1f12;
      border: 1px solid #00ff8844;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      max-width: 480px;
      width: 100%;
      margin-bottom: 1.5rem;
    }
    .explanation h3 { color: #00ff88; font-size: 0.75rem; letter-spacing: 2px; margin-bottom: 0.75rem; }
    .explanation p { color: #aaa; font-size: 0.82rem; line-height: 1.6; }
    .explanation code { color: #ffd700; background: #1a1a2e; padding: 0.1rem 0.3rem; border-radius: 3px; }
    .nav { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .nav a {
      color: #00e5ff;
      text-decoration: none;
      font-size: 0.8rem;
      border: 1px solid #00e5ff44;
      padding: 0.4rem 1rem;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .nav a:hover { background: #00e5ff22; }
    .timestamp { color: #555; font-size: 0.75rem; margin-top: 1.5rem; }
  </style>
</head>
<body>

  <div class="badge">⚡ SERVER-SIDE RENDERING</div>
  <h1>MAD BEANS</h1>
  <p class="subtitle">This page was fully rendered on the server at request time</p>

  <div class="explanation">
    <h3>◆ HOW SSR WORKS HERE</h3>
    <p>
      When you loaded this URL, <code>server.js</code> ran <code>getSessionData()</code>,
      built the complete HTML string, and sent it over the network — fully formed.
      No JavaScript needed to show this content. The browser painted it instantly.
    </p>
  </div>

  <div class="card">
    <h2>▸ SERVER DATA (rendered at ${data.serverTime})</h2>
    <div class="stat">
      <span class="stat-label">Active Sessions</span>
      <span class="stat-value">${data.activeSessions}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Version</span>
      <span class="stat-value">${data.version}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Render Method</span>
      <span class="stat-value">SSR — Node.js</span>
    </div>
  </div>

  <div class="card">
    <h2>▸ PLAYERS ONLINE</h2>
    <ul class="player-list">
      ${data.players.map((p) => `<li>${p}</li>`).join("\n      ")}
    </ul>
  </div>

  <div class="nav">
    <a href="/csr">← View CSR version</a>
    <a href="/">← Back to app</a>
  </div>

  <p class="timestamp">Page source includes all data — view source to confirm (Ctrl+U)</p>

</body>
</html>`;
}

// ─── CSR: server sends an empty shell, JS fetches and fills the data ─────────
function renderCSRShell() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mad Beans — CSR Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0c1a;
      color: #e0e0e0;
      font-family: 'Courier New', monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .badge {
      background: #ff6b0022;
      border: 1px solid #ff6b00;
      color: #ff6b00;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.7rem;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
    }
    h1 { font-size: 2rem; color: #00e5ff; margin-bottom: 0.5rem; }
    .subtitle { color: #888; font-size: 0.85rem; margin-bottom: 2rem; }
    .card {
      background: #111327;
      border: 1px solid #1e2240;
      border-radius: 8px;
      padding: 1.5rem 2rem;
      width: 100%;
      max-width: 480px;
      margin-bottom: 1rem;
    }
    .card h2 { color: #ffd700; font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 1rem; }
    .skeleton {
      height: 14px;
      background: linear-gradient(90deg, #1e2240 25%, #2a3060 50%, #1e2240 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 3px;
      margin-bottom: 0.6rem;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .stat { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #1e2240; }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: #888; font-size: 0.85rem; }
    .stat-value { color: #ff6b00; font-weight: bold; font-size: 0.85rem; }
    .player-list { list-style: none; }
    .player-list li { padding: 0.35rem 0; color: #e0e0e0; font-size: 0.85rem; }
    .player-list li::before { content: "▸ "; color: #ff6b00; }
    .explanation {
      background: #1a0d05;
      border: 1px solid #ff6b0044;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      max-width: 480px;
      width: 100%;
      margin-bottom: 1.5rem;
    }
    .explanation h3 { color: #ff6b00; font-size: 0.75rem; letter-spacing: 2px; margin-bottom: 0.75rem; }
    .explanation p { color: #aaa; font-size: 0.82rem; line-height: 1.6; }
    .explanation code { color: #ffd700; background: #1a1a2e; padding: 0.1rem 0.3rem; border-radius: 3px; }
    .nav { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .nav a {
      color: #00e5ff;
      text-decoration: none;
      font-size: 0.8rem;
      border: 1px solid #00e5ff44;
      padding: 0.4rem 1rem;
      border-radius: 4px;
    }
    .nav a:hover { background: #00e5ff22; }
  </style>
</head>
<body>

  <div class="badge">◆ CLIENT-SIDE RENDERING</div>
  <h1>MAD BEANS</h1>
  <p class="subtitle">This shell arrived empty — JavaScript is fetching the data now</p>

  <div class="explanation">
    <h3>◆ HOW CSR WORKS HERE</h3>
    <p>
      The server sent only this HTML shell — no data inside it.
      After the browser loaded the page, <code>fetch('/api/sessions')</code>
      ran and filled the cards below. View page source: you'll see empty
      <code>#content</code> divs, not the data you see on screen.
    </p>
  </div>

  <div class="card">
    <h2>▸ SESSION DATA (loaded by JS)</h2>
    <div id="stats-content">
      <div class="skeleton" style="width:80%"></div>
      <div class="skeleton" style="width:60%"></div>
      <div class="skeleton" style="width:70%"></div>
    </div>
  </div>

  <div class="card">
    <h2>▸ PLAYERS ONLINE</h2>
    <div id="players-content">
      <div class="skeleton" style="width:50%"></div>
      <div class="skeleton" style="width:55%"></div>
      <div class="skeleton" style="width:45%"></div>
    </div>
  </div>

  <div class="nav">
    <a href="/ssr">← View SSR version</a>
    <a href="/">← Back to app</a>
  </div>

  <script>
    // CSR: JS fetches data from the API endpoint after page load
    async function loadData() {
      await new Promise(r => setTimeout(r, 800)); // simulate network delay
      const res = await fetch('/api/sessions');
      const data = await res.json();

      document.getElementById('stats-content').innerHTML = \`
        <div class="stat"><span class="stat-label">Active Sessions</span><span class="stat-value">\${data.activeSessions}</span></div>
        <div class="stat"><span class="stat-label">Version</span><span class="stat-value">\${data.version}</span></div>
        <div class="stat"><span class="stat-label">Render Method</span><span class="stat-value">CSR — fetch() + JS</span></div>
        <div class="stat"><span class="stat-label">Data fetched at</span><span class="stat-value">\${data.serverTime}</span></div>
      \`;

      document.getElementById('players-content').innerHTML = \`
        <ul class="player-list">
          \${data.players.map(p => \`<li>\${p}</li>\`).join('')}
        </ul>
      \`;
    }
    loadData();
  </script>

</body>
</html>`;
}

// ─── Serve static files from current directory ───────────────────────────────
function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// ─── Main server ─────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = req.url;

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${url}`);

  // API endpoint — returns JSON data (used by the CSR page)
  if (url === "/api/sessions") {
    const data = getSessionData();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(data));
    return;
  }

  // SSR page — server builds the full HTML
  if (url === "/ssr") {
    const data = getSessionData();
    const html = renderSSRPage(data);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // CSR page — server sends empty shell, JS does the work
  if (url === "/csr") {
    const html = renderCSRShell();
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // Root → redirect to splash
  if (url === "/" || url === "") {
    res.writeHead(302, { Location: "/splash.html" });
    res.end();
    return;
  }

  // Static files — serve from current directory
  const staticBase = path.join(__dirname);
  const cleanPath = url.split("?")[0];
  const filePath = path.join(staticBase, cleanPath);

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";
  serveStatic(res, filePath, contentType);
});

server.listen(PORT, () => {
  console.log("─────────────────────────────────────────");
  console.log(`  MAD BEANS — SSR/CSR Demo Server`);
  console.log("─────────────────────────────────────────");
  console.log(`  http://localhost:${PORT}/          → App (splash)`);
  console.log(`  http://localhost:${PORT}/ssr        → SSR demo page`);
  console.log(`  http://localhost:${PORT}/csr        → CSR demo page`);
  console.log(`  http://localhost:${PORT}/api/sessions → JSON API`);
  console.log("─────────────────────────────────────────");
});