## 🚀 How to Run

### Option 1 — Full SSR/CSR Server (recommended)

Includes the `/ssr`, `/csr`, and `/api/sessions` routes in addition to serving all static files.

```bash
# From the project root
node server.js
```

| URL | Description |
|---|---|
| `http://localhost:3001/` | Main app (redirects to splash) |
| `http://localhost:3001/ssr` | SSR demo — HTML built on the server |
| `http://localhost:3001/csr` | CSR demo — empty shell filled by JS |
| `http://localhost:3001/api/sessions` | JSON API (used by the CSR page) |

> **Note:** The Service Worker and offline functionality only work on `localhost` or HTTPS. Do not open via `file://`.

---

### Option 2 — Simple Static Server

If you only want to test the PWA without the SSR/CSR demo:

```bash
# With npx serve
npx serve . -p 3000

# With Python
python3 -m http.server 3000
```

Open: `http://localhost:3000/splash.html`

---

### Option 3 — VS Code Live Server

1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Manually navigate to `splash.html` to see the splash screen

---

### Install as PWA (Add to Home Screen)

**Android / Chrome:**
1. Open the app in Chrome
2. Tap the `⋮` menu → **Add to Home Screen**
3. Or wait for the automatic install banner

**iOS / Safari:**
1. Open the app in Safari
2. Tap the share button `⬆`
3. Select **Add to Home Screen**

**Desktop / Chrome:**
1. Look for the `⊕` icon in the address bar
2. Click → **Install**

---

### Testing Offline Functionality

1. Open the app in the browser (`localhost:3001` or `localhost:3000`)
2. Wait for the Service Worker to register (green badge in the bottom-right corner)
3. Open DevTools → **Application** → **Service Workers** → confirm it is active
4. In DevTools → **Network** → enable **Offline**
5. Reload the page — it should still work from cache
6. Navigate to `offline.html` to see the fallback page

---

### Requirements

- Node.js `v18+` (for `server.js`)
- Modern browser with Service Worker support (Chrome, Edge, Firefox, Safari 16+)
- HTTPS or `localhost` connection to activate the SW

## 🧗 Challenges & Solutions

### 1. Service Worker scope and caching conflicts
**Challenge:** During development, old cached versions of the app kept loading even after making changes to `index.html` and `app.js`. The browser was serving stale files from the cache, making it impossible to see updates.

**Solution:** Implemented a versioned cache key (`CACHE_NAME = 'mad-beans-v1'`) and added cleanup logic in the `activate` event of the SW to delete all caches that don't match the current version. This ensures that every time the SW updates, old caches are wiped automatically.

```js
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
```

---

### 2. Splash screen not triggering on iOS
**Challenge:** The `manifest.json` splash screen worked on Android Chrome, but on Safari/iOS the splash screen was not appearing when the app was added to the home screen.

**Solution:** iOS ignores the `manifest.json` splash screen spec and requires explicit `<link rel="apple-touch-startup-image">` tags with exact pixel dimensions per device breakpoint. Added these tags manually to `splash.html` and `index.html` using media queries targeting each iPhone screen size.

---

### 3. Understanding the real difference between CSR and SSR
**Challenge:** At first, both CSR and SSR looked the same in the browser — the content appeared on screen either way. It was hard to demonstrate *why* they're different in a meaningful, visual way.

**Solution:** Built `ssr-demo.html` with two side-by-side panels: the SSR panel pre-renders all data in the HTML itself (visible in View Source), while the CSR panel shows a skeleton loader first, then fetches data via JavaScript. This makes the timing difference tangible. Also added `server.js` with a `/ssr` route (Node.js builds the full HTML on the server) and a `/csr` route (sends an empty shell that `fetch()` populates), making the architectural difference concrete and testable.

---

### 4. PWA install prompt inconsistency across browsers
**Challenge:** The "Add to Home Screen" prompt behaves differently in every browser. Chrome on Android fires the `beforeinstallprompt` event, but Firefox and Safari have their own flows (or none at all).

**Solution:** Added a manual install button in `index.html` that listens for `beforeinstallprompt` and stores the event for later. If the browser doesn't support it (Safari), the button is hidden and replaced with a tooltip explaining the manual install steps for that browser.

---

### 5. Vercel deployment and service worker HTTPS requirement
**Challenge:** Service workers only work on HTTPS or `localhost`. During development with a plain `file://` path, the SW failed to register entirely.

**Solution:** Used `npx serve` locally (which serves over HTTP on localhost, which is whitelisted for SW) and deployed to Vercel for HTTPS in production. Added a check in `app.js` to only register the SW when the protocol is `https:` or the host is `localhost`, avoiding silent failures.

```js
if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('/sw.js');
}
```