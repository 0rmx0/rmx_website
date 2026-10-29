/* v2 — interface terminal façon AS/400, navigation 100 % clavier */
(function () {
  'use strict';

  var term = document.getElementById('terminal');
  var buffer = '';
  var booted = false;
  var view = 'boot';
  var menuIndex = 0;
  var pageIndex = 0;

  var LOGO = [
    '██████╗            ███╗   ███╗           ██╗  ██╗',
    '██╔══██╗           ████╗ ████║           ╚██╗██╔╝',
    '██████╔╝           ██╔████╔██║            ╚███╔╝ ',
    '██╔══██╗           ██║╚██╔╝██║            ██╔██╗ ',
    '██║  ██║           ██║ ╚═╝ ██║           ██╔╝ ██╗',
    '╚═╝  ╚═╝           ╚═╝     ╚═╝           ╚═╝  ╚═╝'
  ];

  var MENU = [
    { key: '1', label: 'ACCUEIL',     page: 'accueil' },
    { key: '2', label: 'LOSTWAVE',    page: 'lostwave' },
    { key: '3', label: 'GALERIE',     page: 'galerie' },
    { key: '4', label: 'ANARCHISME',  page: 'anarchisme' },
    { key: '5', label: 'OUTILS',      page: 'outils' }
  ];

  var PAGES = {
    accueil: {
      title: 'ACCUEIL',
      lines: [
        'R_M_X — site personnel de 0rmx0.',
        '',
        'SnVzdGUgdW4gaHVtYWluIHF1aSBmYWl0IHNlIHF1J2lsIHBldXQgcG91ciBhdm9pciBlbnZpZSBkZSBjZSBsZXZlciBjaGFxdWUgam91ci4='
      ],
      audio: { src: '../audio/image.wav', type: 'audio/wav', spectrogram: true }
    },
    lostwave: {
      title: 'LOSTWAVE',
      lines: [
        'Collection NFT sur Tezos.',
        'Contrat : KT1CpFdy2sDbCBfLv3L6EHpcTfjG8rnXMHPo',
        '',
        '[1] Voir la grille de tuiles NFT (charge via tzkt.io)',
        'w4l0cmFuZ2UgU2Vuc2F0aW9u'
      ],
      audio: { src: '../audio/etrangesensation.mp3', type: 'audio/mpeg', spectrogram: false },
      nftGrid: true
    },
    galerie: {
      title: 'GALERIE',
      lines: [
        'Collections MultiversX : STREET-b10df3, YGGDRSL23-075ceb.',
        '',
        '[1] Toutes les collections',
        '[2] Street',
        '[3] Yggdrasil2023',
        '',
        'bGliZXJ0w6ksIGTDqW1vY3JhdGllLCBwYXJ0YWdlLg=='
      ],
      audio: { src: '../audio/pp.wav', type: 'audio/wav', spectrogram: true },
      gallery: true
    },
    anarchisme: {
      title: 'ANARCHISME',
      lines: [
        '« Ni Dieu ni maître » — 4 vidéos (hébergement externe, v1).',
        'Les fichiers locaux ne sont pas embarqués ; voir la page v1 pour les lire.',
        '',
        'TGEgcHJvcHJpw6l0w6ksIGMnZXN0IGxlIHZvbCAh'
      ],
      audio: { src: '../audio/ANARCHISME.mp3', type: 'audio/mpeg', spectrogram: false }
    },
    outils: {
      title: 'OUTILS',
      help: '[1-9] ouvrir un lien   [ENTRÉE] audio caché   [ÉCHAP] retour au menu',
      lines: [
        '1. OBenchmark',
        '────────────────────────────────────────',
        'Outil de benchmark open-source multiplateforme écrit en Rust.',
        'Mesure les performances CPU (multi-cœur, calculs entiers/flottants,',
        'tri, compression, cryptographie), mémoire (lecture/écriture',
        'cache/non-cache, latence, multi-thread) et disque (lecture/écriture',
        'séquentielle, IOPS aléatoires). Score normalisé, interface graphique',
        'Slint et export JSON des résultats.',
        'Tags : Rust | Benchmark | Performance | CPU | Memory | Disk | Open-Source',
        '[1] Télécharger → https://github.com/0rmx0/obenchmark/releases',
        '[2] Code source → https://github.com/0rmx0/obenchmark',
        '[3] Icône       → ../img/obenchmark.png',
        '',
        '2. DirTransfert',
        '────────────────────────────────────────',
        'Outil de transfert d’un répertoire complet (et ses sous-répertoires)',
        'entre deux PC, décentralisé : aucun serveur tiers, le transfert se',
        'fait en direct via TCP entre les machines. Conçu pour plusieurs',
        'milliers de fichiers et plusieurs dizaines de Go. Interface graphique',
        '(Slint) et CLI disponibles. Windows, Linux et macOS.',
        'Fonctionnalités : protocole TCP maison avec intégrité SHA-256,',
        'chiffrement ChaCha20-Poly1305 de bout en bout, code de jumelage pour',
        'authentification, reprise automatique sur interruption, barre de',
        'progression en temps réel, ouverture automatique du pare-feu et',
        'redirection UPnP.',
        'Tags : Rust | Transfert | Décentralisé | Chiffrement | TCP | Multiplateforme | UPnP | Open-Source',
        '[4] Télécharger → https://github.com/0rmx0/dirtransfert/releases',
        '[5] Code source → https://github.com/0rmx0/dirtransfert',
        '[6] Icône       → ../img/dirtransfert.png',
        '',
        '3. Frais Réels',
        '────────────────────────────────────────',
        'Calculateur web pour la déclaration des frais réels en France.',
        'Calcule précisément les frais professionnels déductibles (transport,',
        'repas, télétravail, formation, etc.) et compare avec l’abattement',
        'forfaitaire de 10%. Gère automatiquement les règles officielles des',
        'tickets restaurant et des indemnités kilométriques.',
        'Fonctionnalités : calcul transport (voiture/moto/TC/vélo), gestion des',
        'repas (classiques, tickets restaurant, mixte), autres frais',
        'professionnels, remboursements employeur, mutuelle santé, export des',
        'résultats (TXT/JSON/CSV), barème officiel mis à jour automatiquement.',
        'Tags : JavaScript | Web | Calculateur | Impôts | Frais Réels | Déclaration | Open-Source',
        '[7] Accéder     → https://0rmx0.github.io/frais-reels/',
        '[8] Code source → https://github.com/0rmx0/frais-reels',
        '[9] Icône       → ../img/frais-reels.png',
        '',
        'bGEgamV1bmVzc2UgZW1tZXJkZSBsZSBmcm9udCBuYXRpb25hbA=='
      ],
      links: [
        { label: 'OBenchmark — Télécharger', url: 'https://github.com/0rmx0/obenchmark/releases' },
        { label: 'OBenchmark — Code source', url: 'https://github.com/0rmx0/obenchmark' },
        { label: 'OBenchmark — Icône', url: '../img/obenchmark.png' },
        { label: 'DirTransfert — Télécharger', url: 'https://github.com/0rmx0/dirtransfert/releases' },
        { label: 'DirTransfert — Code source', url: 'https://github.com/0rmx0/dirtransfert' },
        { label: 'DirTransfert — Icône', url: '../img/dirtransfert.png' },
        { label: 'Frais Réels — Accéder', url: 'https://0rmx0.github.io/frais-reels/' },
        { label: 'Frais Réels — Code source', url: 'https://github.com/0rmx0/frais-reels' },
        { label: 'Frais Réels — Icône', url: '../img/frais-reels.png' }
      ],
      audio: { src: '../audio/image.wav', type: 'audio/wav', spectrogram: true }
    }
  };

  var MULTIVERSX = [
    { name: 'Street', id: 'STREET-b10df3' },
    { name: 'Yggdrasil2023', id: 'YGGDRSL23-075ceb' }
  ];

  var TEZOS_CONTRACT = 'KT1CpFdy2sDbCBfLv3L6EHpcTfjG8rnXMHPo';

  var audio = new Audio();
  audio.loop = true;

  function write(text) {
    buffer += text + '\n';
    render();
  }

  function writeLines(lines) {
    for (var i = 0; i < lines.length; i++) write(lines[i]);
  }

  function render() {
    var out = buffer;
    if (view === 'boot') {
      out += '\nR_M_X\n\nPRESS ENTER';
    } else if (view === 'menu') {
      out += '\nSELECTIONNEZ UNE OPTION :\n\n';
      for (var i = 0; i < MENU.length; i++) {
        var m = MENU[i];
        out += (i === menuIndex ? '>' : ' ') + ' [' + m.key + '] ' + m.label + '\n';
      }
      out += '\n[↑/↓] naviguer   [ENTRÉE] valider   [ÉCHAP] accueil\n';
    } else if (view === 'page') {
      // le curseur clignotant CSS sert de prompt
    }
    term.textContent = out;
    term.scrollTop = term.scrollHeight;
  }

  function boot() {
    writeLines(LOGO);
    view = 'boot';
    render();
  }

  function showMenu() {
    view = 'menu';
    menuIndex = 0;
    buffer = '';
    render();
  }

  var lastPage = 'accueil';

  function showPage(pageKey) {
    var page = PAGES[pageKey];
    if (!page) {
      buffer += '\nPAGE INCONNUE : ' + pageKey + '\n';
      view = 'menu';
      render();
      return;
    }
    lastPage = pageKey;
    view = 'page';
    pageIndex = 0;
    buffer = '';
    write('=== ' + page.title + ' ===');
    write('');
    writeLines(page.lines);
    write('');
    write(page.help || '[1..9] actions de la page   [ÉCHAP] retour au menu');
    if (page.audio) {
      audio.src = page.audio.src;
    }
    render();
    if (page.nftGrid) loadNftGrid();
    if (page.gallery) loadGallery(-1);
  }

  function playAudio() {
    audio.play().catch(function (err) {
      write('');
      write('LECTURE BLOQUÉE PAR LE NAVIGATEUR : ' + err.message);
    });
  }

  function ipfsToHttp(uri) {
    return uri.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
  }

  function randomColor() {
    var h = Math.floor(Math.random() * 360);
    var s = 60 + Math.random() * 40;
    var l = 40 + Math.random() * 20;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
  }

  function loadNftGrid() {
    write('');
    write('Chargement des NFT (tzkt.io)...');
    render();
    var url = 'https://api.tzkt.io/v1/tokens?contract=' + TEZOS_CONTRACT + '&limit=1000';
    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var count = 0;
        data.forEach(function (token) {
          var meta = token.metadata || {};
          var uri = meta.artifactUri || meta.displayUri || meta.thumbnailUri;
          if (!uri || uri.indexOf('ipfs://') !== 0) return;
          var link = ipfsToHttp(uri);
          write('  - ' + (meta.name || token.tokenId) + ' : ' + link);
          count++;
        });
        write('');
        write(count + ' NFT chargée(s). [ENTRÉE] = écouter l\'audio caché.');
        render();
      })
      .catch(function (err) {
        write('Erreur chargement NFT : ' + err.message);
        render();
      });
  }

  function loadGallery(which) {
    write('');
    write('Chargement de la galerie (api.multiversx.com)...');
    render();
    var collections = which === -1 ? MULTIVERSX : [MULTIVERSX[which]];
    var chain = Promise.resolve();
    collections.forEach(function (c) {
      chain = chain.then(function () {
        return fetch('https://api.multiversx.com/nfts?collection=' + c.id + '&size=1000')
          .then(function (res) { return res.json(); })
          .then(function (tokens) {
            write('');
            write('[' + c.name + '] ' + tokens.length + ' œuvre(s) :');
            tokens.forEach(function (token) {
              var url = token.media && token.media[0] && token.media[0].url;
              if (url) write('  - ' + (token.name || token.identifier) + ' : ' + url);
            });
            render();
          })
          .catch(function (err) {
            write('Erreur ' + c.name + ' : ' + err.message);
            render();
          });
      });
    });
    chain.then(function () {
      write('');
      write('Galerie chargée. [ENTRÉE] = écouter l\'audio caché.');
      render();
    });
  }

  function handleMenuKey(e) {
    if (e.key === 'ArrowUp') {
      menuIndex = (menuIndex - 1 + MENU.length) % MENU.length;
      render();
    } else if (e.key === 'ArrowDown') {
      menuIndex = (menuIndex + 1) % MENU.length;
      render();
    } else if (e.key === 'Enter') {
      showPage(MENU[menuIndex].page);
    } else if (e.key === 'Escape') {
      showMenu();
    } else {
      var found = -1;
      for (var i = 0; i < MENU.length; i++) {
        if (MENU[i].key === e.key) { found = i; break; }
      }
      if (found >= 0) showPage(MENU[found].page);
    }
  }

  function handlePageKey(e) {
    var page = PAGES[lastPage];
    if (e.key === 'Escape') {
      showMenu();
    } else if (e.key === 'Enter') {
      if (page && page.audio) playAudio();
    } else if (/^[1-9]$/.test(e.key)) {
      var n = parseInt(e.key, 10);
      if (page && page.gallery && n >= 1 && n <= MULTIVERSX.length) {
        loadGallery(n - 1);
      } else if (page && page.nftGrid && n === 1) {
        loadNftGrid();
      } else if (page && page.links && n <= page.links.length) {
        var link = page.links[n - 1];
        write('');
        write('Ouverture : ' + link.label + ' → ' + link.url);
        render();
        window.open(link.url, '_blank');
      }
    }
  }

  document.addEventListener('keydown', function (e) {
    if (view === 'boot') {
      if (e.key === 'Enter') {
        booted = true;
        showMenu();
      }
      e.preventDefault();
      return;
    }
    if (view === 'menu') {
      handleMenuKey(e);
      e.preventDefault();
      return;
    }
    if (view === 'page') {
      handlePageKey(e);
      if (e.key === 'Escape' || e.key === 'Enter' || /^[1-9]$/.test(e.key)) e.preventDefault();
    }
  });

  term.addEventListener('click', function () {
    term.focus();
    if (view === 'page') playAudioOnce();
  });

  var audioPlayed = false;
  function playAudioOnce() {
    var page = PAGES[lastPage];
    if (page && page.audio && !audioPlayed) {
      audioPlayed = true;
      playAudio();
    }
  }

  boot();
  term.focus();
})();
