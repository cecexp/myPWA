  // app.js

  // 1. Registro del Service Worker
  if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
              .then(reg => console.log('SW listo! Scope:', reg.scope))
              .catch(err => console.error('SW falló:', err));
      });
  }

  // 2. Simulación de carga de datos (API)
  // En una app real, aquí harías un fetch('https://api.tusnoticias.com')
  setTimeout(() => {
      const skeleton = document.getElementById('skeleton');
      const content = document.getElementById('content');

      // Datos falsos recibidos
      const noticias = [
          { title: "Nueva Arquitectura PWA", body: "El App Shell permite cargas instantáneas separando la UI de los datos.", img: "https://via.placeholder.com/400x200/2563EB/ffffff?text=PWA" },
          { title: "Modo Offline Activo", body: "Gracias al Service Worker, esta aplicación funciona sin conexión a internet.", img: "https://via.placeholder.com/400x200/10B981/ffffff?text=Offline" }
      ];

      // Generar HTML
      let html = '';
      noticias.forEach(noticia => {
          html += `
              <article class="card fade-in">
                  <img src="${noticia.img}" alt="imagen" class="card-img">
                  <h2>${noticia.title}</h2>
                  <p>${noticia.body}</p>
              </article>
          `;
      });

      // Transición: Ocultar Skeleton -> Mostrar Contenido
      skeleton.style.display = 'none';
      content.innerHTML = html;
      content.classList.remove('hidden');

  }, 2000); // Retraso de 2 segundos para ver el efecto skeleton