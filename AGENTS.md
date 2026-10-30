# AGENTS.md — Instructions projet rmx_website

Ce fichier est le contexte de référence pour tout agent (IA ou humain) travaillant sur ce dépôt.
**Le lire en entier avant toute action.** Il reflète les décisions prises avec le propriétaire
(auteur = owner). Ne pas contredire les décisions marquées [FIGÉ].
Dernière mise à jour : v2 du site (terminal AS/400 monopage, 2026-10-30).

## 1. Nature du projet

Site personnel de **R_M_X** (0rmx0) : site statique d'art numérique, thématiques
lostwave / anarchisme / NFT. Depuis la v2, le site est une **interface terminal façon
AS/400 monopage** (navigation 100 % clavier). Esthétique : messages cachés (base64),
audios déclenchés au clic / sur ENTRÉE, glitchs, page BLACKHOLE (crash fictif persisté),
**images stéganographiées dans les spectrogrammes des fichiers `.wav`**
(`audio/image.wav`, `audio/pp.wav` — vérifié, ce sont des spectrogrammes à la Aphex Twin).

Langue de travail : **français** (avec le owner). Code et commentaires : français accepté.

Philosophie : œuvre à couches de découverte successives. Le lostwave = récupérer ce que
le temps a effacé. Le NFT est utilisé pour la **décentralisation du contenu, PAS pour la
propriété** (le paradoxe avec « La propriété, c'est le vol ! » est assumé : les NFT
servent de containers de contenu décentralisés / CDN communautaire).

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

## 3. Objectif principal [FIGÉ]

Déployer le site de façon **décentralisée, immuable mais modifiable** :
- Immuabilité = contenu gravé onchain / permaweb, aucune dépendance à un serveur du owner.
- Modifiable = pattern **append-only** : chaque version est immuable, un pointeur onchain
  désigne la version courante ; l'historique complet est conservé pour toujours (archéologie
  du site, esprit lostwave).
- Test de validation de toute décision d'architecture : **« Si le serveur du owner et
  GitHub explosent ce soir, le site vit-il ? »** → doit toujours être OUI.

## 4. Architecture décidée — « Variante A » [FIGÉ]

**La structure du site vit dans un smart contract Tezos ; le HTML est un renderer générique
muet qui lit le contrat et rend les données.** Modifier le site = une transaction, jamais
un redéploiement des miroirs.

Répartition des rôles :
| Couche | Technologie | Rôle |
|---|---|---|
| Structure (menu, pages, blocs, messages cachés) | **Contrat Tezos** (SmartPy) | source de vérité, append-only |
| Contenu lourd (audio, images) | **Arweave** (via arkb) | stocké une fois, pour toujours, octet-par-octet |
| Galeries NFT | Tezos (FA2, existant) + MultiversX (existant) | contenu déjà décentralisé |
| Front-ends / miroirs (jetables) | GitHub Pages, gateways Arweave/IPFS, `0rmx0.tez`, `0rmx0.brave` | aucune n'est source de vérité |
| Serveur perso du owner | **jamais référencé dans le contrat** ; éventuel nœud contributeur (gateway/IPFS/Tezos) uniquement | jamais une dépendance |

Chaînes choisies : **Tezos** (structure + NFT lostwave existants, quasi gratuit, Ghostnet
pour tester) et **MultiversX** (galerie existante, chaîne bien connue du owner). Arweave retenu pour
les gros fichiers (~3-6 € une fois pour ~32 Mo). Domaines : `0rmx0.brave` (existant,
Unstoppable — ne se résout pas dans un navigateur standard sans extension), `0rmx0.tez`
(Tezos Domains, à acheter), miroir public GitHub Pages. Le owner ne veut PAS dépendre de
son serveur ; participation au réseau éventuelle, pas de pinning critique.

## 5. Le contrat `SiteStructure` (Tezos / SmartPy)

Storage :
- `owner : address` (entry point `transfer_owner` pour la pérennité/léguer l'admin)
- `menu : list<{label, page}>` — l'ordre de la liste = l'ordre des boutons
- `pages : map<page_key, {title, blocks: list<block>}>`
- `history : list<snapshot>` — **append-only, jamais modifié**
- `current_version : nat`

Entry points (tous protégés par `sp.verify(sp.sender == self.data.owner)` sauf lectures) :
- `set_menu(menu)` — réordonner/renommer les boutons
- `add_to_menu(label, page)` / `remove_from_menu(page)`
- `set_page(key, page)` — ajouter/modifier une page
- `remove_page(key)` — option dure ; voir règle des 3 niveaux de mémoire
- `publish_snapshot()` — fige l'état courant dans `history`
- `transfer_owner(addr)`

**Ajout/suppression de pages : compatible par design.** Trois niveaux de mémoire
(décision du owner) : le **menu** dit ce qui est visible, le **storage** dit ce qui existe,
l'**history** dit ce qui a existé. Supprimer une page = par défaut la retirer du menu
seulement (option douce) ; elle reste dans le storage et les snapshots. Une page peut être
publiée sans être au menu = page cachée (easter egg, cohérent avec l'esthétique).

## 6. Ontologie des blocs [FIGÉ en Phase 0 — docs/blocks.md]

**Phase 0 figée dans `docs/blocks.md` (v1, 12 types)** — ce fichier est la référence exacte
(champs, `lossless`, sources `arweave:`/`ipfs:`/`local:`/`http…`, champ `hidden`). Résumé :
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

## 7. Renderer `js/runtime.js` (vanilla JS, remplacera à terme `terminal.js`)

La v2 actuelle (`js/terminal.js`, données en dur dans `MENU`/`PAGES`) en est la
préfiguration vivante : c'est la référence de rendu (menu, pages, liens numérotés,
audios, glitch, blackhole).

- `readStructure(contract)` : RPC public Tezos, **gratuit, sans wallet**, fallbacks RPC multiples
- `renderMenu(menu)`, `renderPage(pageKey)` : routing **hash** (`index.html#lostwave`,
  plus de fichiers multiples) → un seul fichier HTML servi partout
- `loadAsset(source)` : cascade gateways (Arweave `arweave.net` → `ar-io.dev` → IPFS
  `ipfs.io`/`dweb.link` → miroir GitHub)
- **Mode dégradé** : `snapshot.json` embarqué au build → le site marche même si Tezos
  est injoignable
- Réutilise les patterns de `js/terminal.js` (tzkt, api.multiversx.com, ipfs→http)

## 8. Pipeline (CLI Node)

`site build` (valide blocks.json contre l'ontologie, snapshot.json, minifie) →
`site upload` (arkb → Arweave, renvoie tx-id) → `site publish` (via `admin.html` +
wallet Beacon/Temple : set_menu/set_page/publish_snapshot) → `site mirror` (GitHub Pages).
`admin.html` : UI drag-and-drop pour réordonner le menu, éditer blocs, publier snapshot.
Jamais référencée dans le site public.

**Règle d'or : le manifeste/contrat ne doit JAMAIS référencer une URL appartenant au
serveur du owner (ni son IP ni termrx.ovh).**

## 9. Plan d'action (ordre des phases)

- **Phase 0** : figer l'ontologie → `docs/blocks.md` [FAIT — PR #4, figé v1]
- **Phase 1** : nettoyage du site — la v2 terminal a livré le site monopage (PR #8, #9) ;
  reste : vidéos Anarchisme en `video-embed`, compression des images lourdes (§2) [partiel]
- **Phase 2** : contrat `contracts/site_structure.py` + tests simulation SmartPy [à faire]
- **Phase 3** : `js/runtime.js` — reconstruire le site actuel à l'identique depuis un
  JSON en dur (preuve du pattern avant déploiement) [à faire — `terminal.js` en est la
  préfiguration]
- **Phase 4** : pipeline CLI [à faire]
- **Phase 5** : `admin.html` (Beacon) [à faire]
- **Phase 6** : Ghostnet (testnet gratuit) → puis mainnet (~1-2 XTZ frais, ~5 AR,
  `.tez`, < 10 € au total) — nécessite les clés du owner, pas de l'agent
- **Phase 7** : optionnel — pinning IPFS redondant, serveur en nœud contributeur

Livraison : une branche `vibe/*` + PR par phase. L'agent peut livrer Phases 0-5 testées
en simulation ; les transactions mainnet (Phase 6) appartiennent au owner.
Note : la PR #5 (pivot « site statique sur serveur perso », abandon du web3) a été
**fermée sans merge** → l'architecture Variante A (§4) tient.

## 10. Critères de succès

1. Réordonner le menu = une transaction, aucun fichier modifié, tous les miroirs à jour.
2. `history` contient chaque configuration passée, vérifiable par quiconque.
3. GitHub Pages coupé → le site vit toujours.
4. Serveur du owner coupé → aucun impact.
5. Un tiers avec seulement l'adresse du contrat reconstruit le site complet.
6. Les `.wav` sur Arweave sont identiques octet-par-octet (spectrogrammes intacts).

## 11. Règles de travail pour l'agent

- Site statique, vanilla JS, zéro framework, zéro build lourd — garder cette nudité
  (c'est un choix esthétique assumé, « HTML brut lo-fi »).
- Toute la logique de la v2 est dans `js/terminal.js` : menu dans `MENU`, pages dans
  `PAGES`. Ajouter une page = une entrée dans `PAGES` + une entrée dans `MENU`.
- Ne pas ajouter de dépendances sans accord du owner.
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
