// app.js — Mad Beans PWA

// ─────────────────────────────────────────────
// 1. SERVICE WORKER REGISTRATION
//    Checks browser support before registering
// ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW ready! Scope:', reg.scope))
        .catch(err => console.error('SW failed:', err));
    });
  }
  
  // ─────────────────────────────────────────────
  // 2. DYNAMIC DATA LOAD (API simulation)
  //    In a real app: fetch('https://api.madbeans.com/sessions')
  //    Simulates fetching active session count from server
  // ─────────────────────────────────────────────
  setTimeout(() => {
  
    // --- Fake data received from server ---
    const serverData = {
      activeSessions: 3 + Math.floor(Math.random() * 8),
      version: 'v0.1.0 BETA',
      serverStatus: 'ONLINE',
    };
  
    // --- Update UI with dynamic data ---
    const countEl      = document.getElementById('active-count');
    const sessionsTag  = document.getElementById('sessions-tag');
  
    if (countEl) {
      countEl.textContent = serverData.activeSessions;
    }
  
    if (sessionsTag) {
      const n = serverData.activeSessions;
      sessionsTag.textContent = `${n} ACTIVE SESSION${n !== 1 ? 'S' : ''}`;
    }
  
    console.log('Mad Beans: dynamic data loaded', serverData);
  
  }, 1400); // 1.4s delay to simulate network request