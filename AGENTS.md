# AGENTS.md — Instructions projet rmx_website

Ce fichier est le contexte de référence pour tout agent (IA ou humain) travaillant sur ce dépôt.
**Le lire en entier avant toute action.** Il reflète les décisions prises avec le propriétaire
(auteur = owner). Ne pas contredire les décisions marquées [FIGÉ].
Dernière mise à jour : v2 du site + abandon du volet décentralisé obligatoire
(décision owner, 2026-10-30) : site 100 % statique, 100 % client, aucun backend.

## 1. Nature du projet

Site personnel de **R_M_X** (0rmx0) : site statique d'art numérique, thématiques
lostwave / anarchisme / NFT. Depuis la v2, le site est une **interface terminal façon
AS/400 monopage** (navigation 100 % clavier). Esthétique : messages cachés (base64),
audios déclenchés au clic / sur ENTRÉE, glitchs, page BLACKHOLE (crash fictif persisté),
**images stéganographiées dans les spectrogrammes des fichiers `.wav`**
(`audio/image.wav`, `audio/pp.wav` — vérifié, ce sont des spectrogrammes à la Aphex Twin).

Langue de travail : **français** (avec le owner). Code et commentaires : français accepté.

Philosophie : œuvre à couches de découverte successives. Le lostwave = récupérer ce que
le temps a effacé. Le paradoxe NFT (« La propriété, c'est le vol ! ») reste une position
artistique ; les NFT ne sont plus une **infrastructure obligatoire**, juste du contenu
affiché (galeries en lecture seule d'APIs publiques, côté client).

## 2. État actuel du site (v2 terminal, analyse faite)

Un seul fichier servi : `index.html` + `css/terminal.css` + `js/terminal.js` (toute la
logique — menu, pages, liens, audios, glitchs — en IIFE vanilla). Police `fonts/HelpMe.woff2`.
Assets : `img/` (mask.jpg = image d'accueil cliquable, grain.png = texture de fond,
logo_rmx.png, icônes des outils), `audio/` (image.wav, pp.wav = spectrogrammes ;
etrangesensation.mp3, ANARCHISME.mp3 = musique), `docs/blocks.md`.

Menu (6 entrées, navigation 100 % clavier : [↑/↓] + ENTRÉE, ÉCHAP = retour) :
[1] `#%[]§` accueil · [2] LOSTWAVE · [3] GALERIE · [4] ANARCHISME · [5] OUTILS · [6] BLACKHOLE.
Liens numérotés ouvrables sur chaque page (`[n°] + ENTRÉE`). Audios en loop déclenchés
au clic ou sur ENTRÉE. OUTILS : ENTRÉE seul déclenche un glitch, erreur fatale à la 10e.
BLACKHOLE : fausse installation d'IA puis crash définitif persisté (localStorage).

NFT : lostwave = Tezos, contrat `KT1CpFdy2sDbCBfLv3L6EHpcTfjG8rnXMHPo` (via api.tzkt.io) ;
galerie = MultiversX, collections `STREET-b10df3`, `YGGDRSL23-075ceb` (via api.multiversx.com).

Bugs connus / points ouverts :
1. Page ANARCHISME : les 4 vidéos (plusieurs Go) ne sont **pas servies** en v2.
   **[DÉCISION OWNER]** v1 future : `video-embed` (hébergement externe type YouTube non
   listé / Peertube), évolution pinning/décentralisé plus tard. Ne pas recompresser sans
   vérifier d'éventuels éléments cachés dans l'audio.
2. `img/logo_rmx.png` = 1,3 Mo (inutilisé en v2) et `img/mask.jpg` = 3,8 Mo → à compresser.
3. `audio/ANARCHISME.mp3` = 23 Mo — **[DÉCISION OWNER, figée dans docs/blocks.md]** les mp3
   sont de la vraie musique, sans image spectrogramme → recompression libre.

Les anciens bugs de la v1 (base64 corrompus ×2, MIME des `.wav`, `arguments.callee`) sont
résolus par la v2.

**RÈGLE CRITIQUE — fichiers audio :** ne JAMAIS convertir/recompresser les `.wav`
`image.wav` / `pp.wav` (lossy = destruction des images spectrogramme). Le format wav 16-bit
est voulu.

Messages base64 actuels (décodés, contexte — ne pas « réparer » le principe) :
- accueil : « Juste un humain qui fait se qu'il peut pour avoir envie de ce lever chaque jour. »
- lostwave : « Étrange Sensation » (corrigé en v2)
- galerie : « liberté, démocratie, partage. » (corrigé en v2)
- anarchisme : « La propriété, c'est le vol ! »
- outils : « la jeunesse emmerde le front national »

## 3. Objectif principal [FIGÉ — révisé 2026-10-30]

Site **100 % statique, 100 % client** : aucun backend, aucun serveur à maintenir, rien à signer.
**[DÉCISION OWNER]** le volet « décentralisé obligatoire » (contrat onchain, permaweb, gravure) est
**abandonné**. Le site tourne uniquement côté client (vanilla JS) et est servi comme de
simples fichiers statiques (GitHub Pages, CNAME `rmx.ovh`).
Test de validation de toute décision d'architecture : **« le site a-t-il besoin d'autre
chose que des fichiers statiques et d'un navigateur ? »** → doit toujours être NON.

## 4. Architecture « Variante A » (contrat Tezos + Arweave) [ABANDONNÉE — décision owner 2026-10-30]

**Abandonnée** : la structure du site ne vivra PAS dans un smart contract. Plus de contrat
à écrire/déployer, plus d'Arweave obligatoire, plus de miroirs décentralisés exigés, plus de
wallet/clés. (La PR #5, fermée sans merge, allait dans ce sens ; la décision est désormais
actée ici.)
Conservé : les galeries NFT existantes restent affichées (lecture seule d'APIs publiques
tzkt.io / api.multiversx.com, côté client) — c'est du contenu, pas de l'infrastructure.
Domaines : `0rmx0.brave` / `0rmx0.tez` restent des pointeurs optionnels, jamais des
dépendances.

## 5. Contrat `SiteStructure` (Tezos / SmartPy) — [ABANDONNÉ]

Prévu puis abandonné (voir §4). Aucun contrat à écrire ni déployer, aucune entry point, aucun
snapshot onchain. Ne pas ressusciter sans décision explicite du owner.

## 6. Ontologie des blocs [doc de référence — docs/blocks.md]

**Figée dans `docs/blocks.md` (v1, 12 types)** — restée un document de référence pour décrire
l'ontologie du contenu (champs, `lossless`, champ `hidden`). Le contrat associé étant
abandonné (§4), ce n'est plus un schéma de smart contract, juste une grille de lecture.
Résumé :
- `heading` : `{text}`
- `text` : `{text}` (base64 supporté)
- `hidden-text` : `{encoding:"base64", text}` — messages cachés actuels
- `image` : `{source, alt, style}` — source = tx-id Arweave / CID
- `audio-spectro` : `{source, trigger:"heading-click", loop, lossless}` — les audios cachés.
  **[DÉCISION OWNER]** `lossless:true` = wav/flac portant une image spectrogramme (jamais
  recompresser) ; `lossless:false` (défaut) = vraie musique, mp3 accepté.
- `nft-grid` : `{chain, contract, render:"color-tiles"}` — lostwave
- `nft-gallery` : `{chain, collections:[...], filter:true}` — galerie
- `video-frame` : `{source, aspect:"16/9"}`
- `video-embed` : `{provider, video_id, aspect:"16/9"}` — YouTube/Peertube/URL externe.
  **[DÉCISION OWNER]** v1 du site : les vidéos de la page Anarchisme en `video-embed`
  (elles font plusieurs Go, trop lourdes pour Arweave/GitHub). Évolution possible plus
  tard : pinning IPFS ou autre hébergement décentralisé → le contrat étant la source de
  vérité, changer d'hébergeur = une transaction, pas une refonte.
- `game-embed` : `{source, engine:"rpgmaker", mode:"iframe"}` — **[À DÉFINIR PLUS TARD]**
  le jeu RPG Maker n'existe pas encore ; type prévu pour le jour où il existera.
- `project-list` : `{projects:[{name, description, url, status:"wip"|"done"|"abandonné"}]}`
  — liste des projets dev du owner. Visible ou caché : non tranché (patterns possibles :
  page au menu, page hors menu, page « cimetière » des projets abandonnés).
- `html-raw` : `{html}` — soupape de sécurité, confiance totale en l'owner

**Règle de sizing :** Arweave = assets < ~10-20 Mo. Au-delà (vidéos lourdes, bundles
de jeu) : pointeur vers hébergement externe via `video-embed`/`game-embed`, modifiable
par transaction.

Règle : ajouter un nouveau type de bloc = mettre à jour le renderer = republier les
miroirs (l'unique cas où les miroirs doivent être redéployés).

## 7. Le site = `js/terminal.js` (vanilla JS, 100 % client)

Plus de `js/runtime.js` prévu : il n'y a aucune source de vérité externe à lire.
`js/terminal.js` (données en dur dans `MENU`/`PAGES`) **est** le site : menu, pages, liens
numérotés, audios, glitch, blackhole, et appels API NFT en direct côté client
(tzkt.io, api.multiversx.com, ipfs→http).

## 8. Pipeline — [ABANDONNÉ]

Plus de CLI `site build/upload/publish/mirror`, plus d'arkb/Arweave, plus d'`admin.html`
(Beacon) : rien à publier onchain, rien à signer.
Déployer = pousser les fichiers statiques (branche `vibe/*` → PR → merge → GitHub Pages).

**Règle d'or conservée : le site ne doit JAMAIS dépendre d'une URL appartenant au serveur
du owner (ni son IP ni termrx.ovh).**

## 9. Plan d'action

- **Phase 0** : ontologie en doc → `docs/blocks.md` [FAIT — PR #4, conservé comme référence]
- **Ex-phases 2 à 7** (contrat Tezos, runtime onchain, CLI, admin.html, Ghostnet/mainnet,
  pinning) : [ABANDONNÉES — §4]
- **Travail courant** — finition du site statique v2 :
  1. vidéos de la page Anarchisme en embed externe (décision owner, §2)
  2. compression de `img/mask.jpg` (3,8 Mo) et `img/logo_rmx.png` (1,3 Mo)
  3. toute évolution = modifier `js/terminal.js` + les fichiers statiques, via PR `vibe/*`

Livraison : branche `vibe/*` + PR. Plus aucune transaction, plus aucune clé : l'agent
ne signe jamais.

## 10. Critères de succès

1. Le site fonctionne avec uniquement des fichiers statiques servis par GitHub Pages.
2. Aucun backend, aucune base de données, aucun wallet, aucune transaction : tout est
   exécuté côté client.
3. Ajouter une page = une entrée `PAGES` + une entrée `MENU` dans `js/terminal.js`, une PR.
4. Les `.wav` restent intacts octet-par-octet (spectrogrammes préservés).
5. Les couches cachées (base64, audios au clic, spectrogrammes) sont préservées.

## 11. Règles de travail pour l'agent

- Site statique, vanilla JS, zéro framework, zéro build lourd — garder cette nudité
  (c'est un choix esthétique assumé, « HTML brut lo-fi »).
- Toute la logique de la v2 est dans `js/terminal.js` : menu dans `MENU`, pages dans
  `PAGES`. Ajouter une page = une entrée dans `PAGES` + une entrée dans `MENU`.
- Ne pas ajouter de dépendances sans accord du owner.
- **Aucun backend** : ne jamais introduire de serveur, de base de données, d'API privée
  ou de signature. Le maximum doit tourner côté client (décision owner, §3).
- Ne pas révéler/casser les couches cachées (base64, audios au clic, spectrogrammes) :
  les préserver, éventuellement les enrichir d'indices (ex : commentaire HTML invitant
  à « regarder l'intérieur du son »).
- Les secrets (`termrx.ovh.txt` est gitignoré) : ne jamais les lire, citer, committer.
- Clés wallets : l'agent n'en a jamais ; tout ce qui signe passe par Beacon/Temple du owner.
- Before editing : `git status`, lire ce fichier, lire le code cible et les patterns proches.
- Commiter en français, messages courts, une unité de travail par commit.

## 12. Glossaire owner

- Les audios cachés = intentionnels, ne pas en faire des bugs.
- Les messages base64 = intentionnels (les 2 ex-corrompus sont corrigés en v2, liste §2).
- Le glitch d'OUTILS (ENTRÉE seul, fatal à la 10e tentative) et la page BLACKHOLE
  (crash persisté en localStorage) = intentionnels, ne pas « corriger ».
- « Décentralisé obligatoire » = abandonné (§3/§4) : ne pas réintroduire de contrat onchain,
  d'Arweave obligatoire ou de dépendance serveur sans décision explicite du owner.
