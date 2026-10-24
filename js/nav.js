// Charge et insère la navigation commune dans toutes les pages
fetch('includes/nav.html')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(html => {
    const navContainer = document.getElementById('navigation');
    if (navContainer) {
      navContainer.innerHTML = html;
    }
  })
  .catch(error => {
    console.error('Erreur de chargement de la navigation:', error);
    // Fallback : crée une navigation de base
    const navContainer = document.getElementById('navigation');
    if (navContainer) {
      navContainer.innerHTML = `
        <nav>
          <a href="index.html">Accueil</a>
          <a href="lostwave.html">Lostwave</a>
          <a href="nftgallery.html">Galerie</a>
          <a href="anarchisme.html">Anarchisme</a>
          <a href="outils.html">Outils</a>
        </nav>
      `;
    }
  });
