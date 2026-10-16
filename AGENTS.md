# AGENTS.md — Instructions projet rmx_website

Ce fichier est le contexte de référence pour tout agent (IA ou humain) travaillant sur ce dépôt.
**Le lire en entier avant toute action.** Il reflète les décisions prises avec le propriétaire
(auteur = owner). Ne pas contredire les décisions marquées [FIGÉ].

## 1. Nature du projet

Site personnel de **R_M_X** (0rmx0) : site statique d'art numérique, thèmes
lostwave / anarchisme / NFT. Esthétique : messages cachés (base64), audios cachés
(déclenchés au clic sur le `<h1>`), **images stéganographiées dans les spectrogrammes
des fichiers `.wav`** (`audio/image.wav`, `audio/pp.wav` — vérifié, ce sont des
spectrogrammes à la Aphex Twin).

Langue de travail : **français** (avec le owner). Code et commentaires : français accepté.

Philosophie : œuvre à couches de découverte successives. Le lostwave = récupérer ce que
le temps a effacé.

**[DÉCISION OWNER — pivot hébergement]** Le projet est **abandonné côté web3
décentralisé** : plus de smart contract, plus d'Arweave/IPFS, plus de miroirs. Le site
est un **site statique classique**, hébergé sur le **serveur perso du owner**. Les
quelques briques web3 déjà en place (galeries NFT Tezos et MultiversX) **restent telles
quelles en lecture seule**, mais **aucune nouvelle brique web3 ne sera ajoutée**.
L'ancien plan d'architecture décentralisée est archivé dans `docs/archive-architecture-web3.md`.

## 2. État actuel du site (analyse faite)

Pages : `index.html`, `lostwave.html` (NFT Tezos, contrat `KT1CpFdy2sDbCBfLv3L6EHpcTfjG8rnXMHPo`),
`nftgallery.html` (NFT MultiversX, collections `STREET-b10df3`, `YGGDRSL23-075ceb`),
`anarchisme.html`. CSS : `css/style.css`, police `fonts/HelpMe.woff2`. JS : `js/lostwave.js`,
`js/nftgallery.js`.

Bugs connus à corriger :
1. `anarchisme.html` référence 4 vidéos dans `video/` qui **n'existe pas** (revert git) → page cassée.
   **[DÉCISION OWNER]** Ces vidéos font plusieurs Go : v1 en `video-embed`
   (hébergement externe type YouTube non listé / Peertube), servies par le serveur perso du owner.
   Ne pas recompresser sans vérifier d'éventuels éléments cachés dans l'audio.
2. `lostwave.html` : base64 corrompu (`w4l0cmFuZ2U...` → devrait décoder « Étrange Sensation »).
3. `nftgallery.html` : base64 avec coquille (décodage : « libertÉ, dÑmocratie, partage »).
4. Les `.wav` sont déclarés `type="audio/mpeg"` → corriger en `audio/wav`.
5. `logo_rmx.png` = 1,3 Mo → à compresser.
6. `ANARCHISME.mp3` = 23 Mo ; **vérifier son spectrogramme avant tout traitement** (le mp3 lossy
   a pu détruire une éventuelle image cachée).
7. Script audio-clic dupliqué ×4 avec `arguments.callee` (obsolète).

**RÈGLE CRITIQUE — fichiers audio :** ne JAMAIS convertir/recompresser les `.wav`
(lossy = destruction des images spectrogramme). Le format wav 16-bit est voulu.
Le seul fix autorisé : le type MIME dans le HTML.

Messages base64 décodés (contexte, ne pas « réparer » le principe) :
- index : « Juste un humain qui fait se qu'il peut pour avoir envie de ce lever chaque jour. »
- anarchisme : « La propriété, c'est le vol ! »
- galerie : « liberté, démocratie, partage. » (coquille à corriger)
- lostwave : « Étrange Sensation » (corrompu, à corriger)

## 3. Objectif principal [FIGÉ]

**Un site web statique simple et autonome, servi par le serveur perso du owner** (déploiement
= copier les fichiers du dépôt dans un dossier servi par le serveur web du owner, par exemple
nginx/Apache ; aucun build requis). Le site doit fonctionner tel quel sur n'importe quel
hébergement statique (pas de dépendance à un service externe vital, pas de backend).

Conséquences de l'abandon du web3 :
- Les contenus (audio, images) vivent **dans le dépôt** et sont servis par le serveur perso.
- Les pages galeries NFT existantes (`lostwave.html`, `nftgallery.html`) restent telles quelles :
  elles lisent les NFT via les API publiques (tzkt, api.multiversx.com) en **lecture seule, sans
  wallet**. Elles ne doivent plus évoluer côté web3 — maintenance minimale seulement (si une API
  casse, réparer ou retirer la page, à la demande du owner).
- **Aucune nouvelle brique web3** (pas de contrat, pas de pinning IPFS/Arweave, pas de domaines
  blockchain `.tez`/`.brave`, pas de wallet/Beacon dans le code).

## 4. Architecture actuelle [FIGÉ]

Site statique multi-pages en HTML/CSS/JS vanilla :

| Couche | Technologie | Rôle |
|---|---|---|
| Pages | HTML statique (`index.html`, `lostwave.html`, `nftgallery.html`, `anarchisme.html`) | structure et contenu |
| Contenu lourd (audio, images) | fichiers du dépôt, servis par le serveur perso du owner | aucune dépendance externe vitale |
| Galeries NFT (existant, figé) | Tezos FA2 + MultiversX, lecture via API publiques (tzkt, api.multiversx.com), sans wallet | galerie perduewave + galerie MultiversX |
| JS | vanilla (`js/lostwave.js`, `js/nftgallery.js`) | logique des pages |

Domaines : le owner gère lui-même son domaine sur son serveur perso. Pas de domaine blockchain.

## 5. Hébergement / déploiement [DÉCISION OWNER]

Le site est hébergé sur le **serveur perso du owner** (`termrx.ovh`). Déploiement :
`git pull` (ou copie des fichiers) sur le serveur, dans le dossier servi par le serveur web.
Aucun pipeline, aucun build, aucun contrat à mettre à jour.

Les secrets (`termrx.ovh.txt` est gitignoré) : ne jamais les lire, citer, committer.
Clés wallets : l'agent n'en a jamais ; aucun code du site ne doit en demander.

## 6. Règles relatives aux NFT existants [FIGÉ]

- Les galeries NFT existantes restent en **lecture seule** (API publiques tzkt /
  api.multiversx.com, gratuit, sans wallet) — patterns déjà présents dans
  `js/nftgallery.js` et `js/lostwave.js`.
- Aucune écriture onchain, aucun wallet, aucune nouvelle collection, aucun nouveau
  champ web3 dans le code ou la doc.
- Si une API publique change/casse : réparation minimale ou retrait de la page, à la
  demande du owner.

## 7. Plan d'action

- **Phase 1** : nettoyage du site (bugs listés §2) [à faire]
- **Phase 2** : vidéos de la page Anarchisme en `video-embed` (hébergées/servies via le
  serveur perso du owner ou plateformes externes assumées, type YouTube non listé / Peertube) [à faire]
- L'ancien plan (contrat Tezos, renderer `js/runtime.js`, pipeline CLI, `admin.html`,
  Ghostnet/mainnet, pinning IPFS) est **abandonné** — voir l'archive
  `docs/archive-architecture-web3.md` si besoin de contexte historique.

Livraison : une branche `vibe/*` + PR par phase.

## 8. Critères de succès

1. Le site (hors galeries NFT) fonctionne **100 % hors-ligne** : ouvrir les fichiers
   localement ne casse rien (sauf les galeries NFT et embeds vidéo qui nécessitent le réseau).
2. Copier le dépôt sur le serveur perso suffit au déploiement.
3. Les `.wav` du dépôt restent identiques octet-par-octet (spectrogrammes intacts).
4. Les couches cachées (base64, audios au clic, spectrogrammes) sont préservées.

## 9. Règles de travail pour l'agent

- Site statique, vanilla JS, zéro framework, zéro build — garder cette nudité
  (c'est un choix esthétique assumé, « HTML brut lo-fi »).
- Ne pas ajouter de dépendances sans accord du owner.
- Ne pas révéler/casser les couches cachées (base64, audios au clic, spectrogrammes) :
  les préserver, éventuellement les enrichir d'indices (ex : commentaire HTML invitant
  à « regarder l'intérieur du son »).
- Les secrets (`termrx.ovh.txt` est gitignoré) : ne jamais les lire, citer, committer.
- Clés wallets : l'agent n'en a jamais ; tout ce qui signe passe par les wallets du owner.
- Before editing : `git status`, lire ce fichier, lire le code cible et les patterns proches.
- Commiter en français, messages courts, une unité de travail par commit.

## 10. Glossaire owner

- Les audios cachés = intentionnel, ne pas en faire des bugs.
- Les messages base64 = intentionnels, sauf les 2 corrompus listés §2.
- « Les briques web3 restent mais il n'y en aura pas de nouvelles » : les galeries NFT
  existantes sont maintenues en l'état, tout nouveau développement web3 est hors périmètre.
