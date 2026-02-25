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
  //    In a real app: fetch('https://api.madbeans.com/leaderboard')
  //    Shows skeleton while loading, then swaps to real content
  // ─────────────────────────────────────────────
  setTimeout(() => {
  
    const skeleton = document.getElementById('lb-sk');
    const content  = document.getElementById('lb-list');
  
    // --- Fake data received from server ---
    const leaderboard = [
      { rank: 1, name: "XOCHITL_FUEGO", score: 18420 },
      { rank: 2, name: "RAMEN_MASTER",  score: 15900 },
      { rank: 3, name: "CHEF_DIABLO",   score: 14310 },
      { rank: 4, name: "TAQUERO_PRO",   score: 12780 },
      { rank: 5, name: "CUBBEK_BOSS",   score: 10550 },
    ];
  
    const MEDALS  = ['🥇', '🥈', '🥉'];
    const RANK_CL = ['g',  's',  'b' ];
    const ROW_CL  = ['r1', 'r2', 'r3'];
  
    // --- Generate HTML ---
    let html = '';
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
  
    sorted.forEach((player, i) => {
      const medal = i < 3
        ? `<span class="lb-rk ${RANK_CL[i]}">${MEDALS[i]}</span>`
        : `<span class="lb-rk n">${i + 1}</span>`;
  
      const scoreClass = i === 0 ? 'lb-sc top' : 'lb-sc';
  
      html += `
        <div class="lb-row ${ROW_CL[i] || ''}">
          ${medal}
          <span class="lb-nm">${player.name}</span>
          <span class="${scoreClass}">${player.score.toLocaleString()}</span>
        </div>
      `;
    });
  
    // Update total chefs counter
    document.getElementById('total').textContent = sorted.length;
  
    // --- Transition: hide skeleton → show content ---
    skeleton.style.display = 'none';
    content.innerHTML = html;
    content.style.display = 'block';
  
  }, 1400); // 1.4s delay to show skeleton loading effect