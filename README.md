# Mad Beans PWA — Documentación de Implementación

## 📁 Estructura del Proyecto

```
myPWA/
├── index.html          ← App principal (pantalla de sesiones)
├── splash.html         ← Splash screen animado con pixel art
├── offline.html        ← Página fallback sin conexión
├── ssr-demo.html       ← Demo interactivo CSR vs SSR + Lighthouse guide
├── sw.js               ← Service Worker con 3 estrategias de caché
├── manifest.json       ← Web App Manifest (PWA config)
├── app.js              ← Lógica de registro del SW y datos dinámicos
└── icons/
    ├── icon-192.png    ← Ícono PWA (reemplazar con PNG real)
    └── icon-512.png    ← Ícono PWA maskable (reemplazar con PNG real)
```

---

## ✅ Funcionalidades Implementadas

### 1. Splash Screen (`splash.html`)
- Pixel art de coffee bean hecho 100% en CSS (grid 10×10)
- Barra de progreso animada con shimmer
- Pasos de carga simulados con transición suave
- Auto-redirige a `index.html` al terminar
- Meta tags `<link rel="apple-touch-icon">` para iOS
- `<link rel="apple-touch-startup-image">` por breakpoint

### 2. Funcionalidad Offline (`sw.js`)
Tres estrategias implementadas:

| Estrategia | Recursos | Comportamiento |
|---|---|---|
| **Network First** | HTML | Intenta red → caché → offline.html |
| **Cache First** | JS, CSS, fonts, imágenes | Caché → red → guarda → placeholder SVG |
| **Stale-While-Revalidate** | Resto | Sirve caché, actualiza en background |

El SW también incluye:
- `install`: precachea el App Shell
- `activate`: limpia caches viejos
- Banner de "offline" en `index.html` via `navigator.onLine`
- Badge de estado del SW en esquina inferior derecha

### 3. CSR vs SSR (`ssr-demo.html`)
- Tabla comparativa de métricas (FCP, TTI, SEO, offline...)
- Demo SSR: contenido pre-renderizado visible sin JS
- Demo CSR: bloque vacío que JS rellena con fetch simulado + skeleton loader
- Scores animados de Lighthouse con IntersectionObserver
- Guía paso a paso para probar offline y correr Lighthouse

### 4. Testing
- Instrucciones en `ssr-demo.html` sección "CÓMO PROBAR"
- `offline.html` con auto-retry cuando vuelve la conexión
- SW status badge visible en `index.html`

---

## 🚀 Cómo correrlo

```bash
# Opción 1: npx serve
npx serve . -p 3000

# Opción 2: Python
python3 -m http.server 3000

# Opción 3: VS Code Live Server
# Click derecho en index.html → Open with Live Server
```

Abrir: `http://localhost:3000/splash.html`

---

## 🔧 Producción — Iconos PNG

Los archivos en `/icons/` son SVG placeholder. Para producción:

```bash
# Instalar generador de assets PWA
npm install -g pwa-asset-generator

# Generar todos los tamaños + splash screens de Apple
pwa-asset-generator logo.png ./icons \
  --index index.html \
  --manifest manifest.json
```

---

## ⚡ Lighthouse Tips

Para score máximo:
- Servir en HTTPS (o localhost)
- Verificar que `manifest.json` tenga `start_url` accesible
- Iconos PNG reales (no SVG)
- Correr en modo incógnito