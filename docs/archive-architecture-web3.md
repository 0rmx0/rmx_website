# ARCHIVE — Architecture web3 décentralisée (abandonnée)

> **[DÉCISION OWNER]** Ce plan est abandonné : le site est désormais un site statique
> hébergé sur le serveur perso du owner. Les galeries NFT existantes restent en lecture
> seule ; aucune nouvelle brique web3. Ce document est conservé pour référence historique
> uniquement — ne pas s'en servir pour de nouvelles décisions. Voir AGENTS.md à jour.

# AGENTS.md — Instructions projet rmx_website

Ce fichier est le contexte de référence pour tout agent (IA ou humain) travaillant sur ce dépôt.
**Le lire en entier avant toute action.** Il reflète les décisions prises avec le propriétaire
(auteur = owner). Ne pas contredire les décisions marquées [FIGÉ].

## 1. Nature du projet

Site personnel de **R_M_X** (0rmx0) : site statique d'art numérique, thématiques
lostwave / anarchisme / NFT. Esthétique : messages cachés (base64), audios cachés
(déclenchés au clic sur le `<h1>`), **images stéganographiées dans les spectrogrammes
des fichiers `.wav`** (`audio/image.wav`, `audio/pp.wav` — vérifié, ce sont des
spectrogrammes à la Aphex Twin).

Langue de travail : **français** (avec le owner). Code et commentaires : français accepté.

Philosophie : œuvre à couches de découverte successives. Le lostwave = récupérer ce que
le temps a effacé. Le NFT est utilisé pour la **décentralisation du contenu, PAS pour la
propriété** (le paradoxe avec « La propriété, c'est le vol ! » est assumé : les NFT
servent de containers de contenu décentralisés / CDN communautaire).

## 2. État actuel du site (analyse faite)

Pages : `index.html`, `lostwave.html` (NFT Tezos, contrat `KT1CpFdy2sDbCBfLv3L6EHpcTfjG8rnXMHPo`),
`nftgallery.html` (NFT MultiversX, collections `STREET-b10df3`, `YGGDRSL23-075ceb`),
`anarchisme.html`. CSS : `css/style.css`, police `fonts/HelpMe.woff2`. JS : `js/lostwave.js`,
`js/nftgallery.js`.

Bugs connus à corriger (Phase 1 du plan) :
1. `anarchisme.html` référence 4 vidéos dans `video/` qui **n'existe pas** (revert git) → page cassée.
   **[DÉCISION OWNER]** Ces vidéos font plusieurs Go : v1 en `video-embed` (hébergement
   externe type YouTube non listé / Peertube), évolution pinning/décentralisé plus tard.
   Ne pas recompresser sans vérifier d'éventuels éléments cachés dans l'audio.
2. `lostwave.html` : base64 corrompu (`w4l0cmFuZ2U...` → devrait décoder « Étrange Sensation »).
3. `nftgallery.html` : base64 avec coquille (décodage : « libertÉ, dÑmocratie, partage »).
4. Les `.wav` sont déclarés `type="audio/mpeg"` → corriger en `audio/wav`.
5. `logo_rmx.png` = 1,3 Mo → à compresser.
6. `ANARCHISME.mp3` = 23 Mo ; **vérifier son spectrogramme avant gravure** (le mp3 lossy
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

## 6. Ontologie des blocs [à figer en Phase 0 — docs/blocks.md]

Types de blocs prévus (le renderer ne sait rendre QUE ces types ; prévoir généreusement) :
- `heading` : `{text}`
- `text` : `{text}` (base64 supporté)
- `hidden-text` : `{encoding:"base64", text}` — messages cachés actuels
- `image` : `{source, alt, style}` — source = tx-id Arweave / CID
- `audio-spectro` : `{source, trigger:"heading-click"}` — les wav cachés
- `nft-grid` : `{chain, contract, render:"color-tiles"}` — lostwave
- `nft-gallery` : `{chain, collection, filter:true}` — galerie
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

## 7. Renderer `js/runtime.js` (vanilla JS, remplace nftgallery.js/lostwave.js)

- `readStructure(contract)` : RPC public Tezos, **gratuit, sans wallet**, fallbacks RPC multiples
- `renderMenu(menu)`, `renderPage(pageKey)` : routing **hash** (`index.html#lostwave`,
  plus de fichiers multiples) → un seul fichier HTML servi partout
- `loadAsset(source)` : cascade gateways (Arweave `arweave.net` → `ar-io.dev` → IPFS
  `ipfs.io`/`dweb.link` → miroir GitHub)
- **Mode dégradé** : `snapshot.json` embarqué au build → le site marche même si Tezos
  est injoignable
- Réutilise les patterns existants de `js/nftgallery.js` et `js/lostwave.js` (tzkt,
  api.multiversx.com, ipfs→http)

## 8. Pipeline (CLI Node)

`site build` (valide blocks.json contre l'ontologie, snapshot.json, minifie) →
`site upload` (arkb → Arweave, renvoie tx-id) → `site publish` (via `admin.html` +
wallet Beacon/Temple : set_menu/set_page/publish_snapshot) → `site mirror` (GitHub Pages).
`admin.html` : UI drag-and-drop pour réordonner le menu, éditer blocs, publier snapshot.
Jamais référencée dans le site public.

**Règle d'or : le manifeste/contrat ne doit JAMAIS référencer une URL appartenant au
serveur du owner (ni son IP ni termrx.ovh).**

## 9. Plan d'action (ordre des phases)

- **Phase 0** : figer l'ontologie → `docs/blocks.md` [à faire]
- **Phase 1** : nettoyage du site (bugs listés §2) [à faire]
- **Phase 2** : contrat `contracts/site_structure.py` + tests simulation SmartPy [à faire]
- **Phase 3** : `js/runtime.js` — reconstruire le site actuel à l'identique depuis un
  JSON en dur (preuve du pattern avant déploiement) [à faire]
- **Phase 4** : pipeline CLI [à faire]
- **Phase 5** : `admin.html` (Beacon) [à faire]
- **Phase 6** : Ghostnet (testnet gratuit) → puis mainnet (~1-2 XTZ frais, ~5 AR,
  `.tez`, < 10 € au total) — nécessite les clés du owner, pas de l'agent
- **Phase 7** : optionnel — pinning IPFS redondant, serveur en nœud contributeur

Livraison : une branche `vibe/*` + PR par phase. L'agent peut livrer Phases 0-5 testées
en simulation ; les transactions mainnet (Phase 6) appartiennent au owner.

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
- Ne pas ajouter de dépendances sans accord du owner.
- Ne pas révéler/casser les couches cachées (base64, audios au clic, spectrogrammes) :
  les préserver, éventuellement les enrichir d'indices (ex : commentaire HTML invitant
  à « regarder l'intérieur du son »).
- Les secrets (`termrx.ovh.txt` est gitignoré) : ne jamais les lire, citer, committer.
- Clés wallets : l'agent n'en a jamais ; tout ce qui signe passe par Beacon/Temple du owner.
- Before editing : `git status`, lire ce fichier, lire le code cible et les patterns proches.
- Commiter en français, messages courts, une unité de travail par commit.

## 12. Glossaire owner

- Les audios cachés = intentionnel, ne pas en faire des bugs.
- Les messages base64 = intentionnels, sauf les 2 corrompus listés §2.

---

# docs/blocks.md — Ontologie des blocs (Phase 0) [FIGÉ v1]

Ce document est le **contrat partagé** entre le smart contract `SiteStructure` (Tezos)
et le renderer `js/runtime.js`. Chaque bloc d'une page est une instance d'un type décrit
ici. Le renderer ne sait rendre QUE ces types ; le contrat ne doit valider QUE ces types.

Règle d'évolution : ajouter un type de bloc = mettre à jour le renderer = republier les
miroirs (l'unique cas de republication). Modifier les *champs* d'un type existant est
déconseillé après la première gravure mainnet ; préférer un nouveau type versionné
(ex : `text.v2`).

Source de vérité des décisions : `AGENTS.md` (§6). Ce document la fige en v1.

## Conventions communes

- `source` désigne partout un **identifiant de contenu décentralisé**, jamais une URL
  appartenant au serveur du owner (règle d'or AGENTS.md §8). Formats acceptés :
  - `arweave:<tx-id>` — asset Arweave (défaut pour les fichiers)
  - `ipfs:<cid>` — contenu IPFS
  - `local:<chemin>` — asset servi par le miroir lui-même (petits fichiers du dépôt)
  - `http<…>` — hébergement externe assumé (embeds uniquement : vidéo, jeu) ; modifiable
    par transaction, jamais une dépendance critique
- Tout bloc peut porter un champ optionnel `id` (string, unique par page) pour ciblage
  futur (ancre, style).
- `hidden` (bool, optionnel, défaut `false`) : bloc présent dans les données mais non
  rendu — couche supplémentaire pour les curieux qui lisent le contrat.

## Types de blocs (12)

### 1. `heading`
Titre de section.
```json
{ "type": "heading", "text": "Anarchisme" }
```
Champs : `text` (requis, string).

### 2. `text`
Paragraphe de texte visible.
```json
{ "type": "text", "text": "Bienvenue…" }
```
Champs : `text` (requis, string).

### 3. `hidden-text`
Message caché — l'esthétique base64 du site. Rendu en `<p>` discret (position fixe
bas de page, comme `#bottom-text` actuel). La valeur est stockée encodée ; le renderer
l'affiche telle quelle (ne pas décoder : le mystère est intentionnel).
```json
{ "type": "hidden-text", "encoding": "base64", "text": "TGEgcHJvcHJpw6l0w6ks…" }
```
Champs : `encoding` (requis, `"base64"`), `text` (requis, string encodé).

### 4. `image`
```json
{ "type": "image", "source": "local:img/logo_rmx.png", "alt": "Logo", "style": "hero" }
```
Champs : `source` (requis), `alt` (requis, accessibilité), `style` (optionnel — nom d'une
classe CSS du renderer : `hero`, `full`, `inline`).

### 5. `audio-spectro`
Audio caché déclenché au clic sur le `heading` de la page (comportement actuel du site).
**[PRÉCISION OWNER]** Deux familles d'audios, ne pas confondre :
- les `.wav` (`image.wav`, `pp.wav`) = contiennent des **images en spectrogramme** →
  jamais recompresser, format sans perte obligatoire (wav/flac) ;
- les `.mp3` (`etrangesensation.mp3`, `ANARCHISME.mp3`) = de la **vraie musique**, pas
  d'image cachée → mp3 acceptable, recompression libre.
```json
{ "type": "audio-spectro", "source": "arweave:<tx-id>", "trigger": "heading-click", "loop": true }
```
Champs : `source` (requis), `trigger` (requis, seul `"heading-click"` supporté en v1),
`loop` (optionnel, bool, défaut `true`), `lossless` (optionnel, bool — `true` si le fichier
porte une image spectrogramme ; défaut `false` pour la musique).

### 6. `nft-grid`
Grille de tuiles NFT (page Lostwave actuelle) : chaque token rendu comme carré coloré
cliquable ouvrant le média dans un nouvel onglet.
```json
{ "type": "nft-grid", "chain": "tezos", "contract": "KT1CpFdy2sDbCBfLv3L6EHpcTfjG8rnXMHPo", "render": "color-tiles" }
```
Champs : `chain` (requis, `"tezos"` — extensible), `contract` (requis), `render`
(optionnel, défaut `"color-tiles"`).

### 7. `nft-gallery`
Galerie d'images NFT avec filtre par collection (page Galerie actuelle).
```json
{ "type": "nft-gallery", "chain": "multiversx", "collections": ["STREET-b10df3", "YGGDRSL23-075ceb"], "filter": true }
```
Champs : `chain` (requis, `"tezos"` | `"multiversx"`), `collections` (requis, liste),
`filter` (optionnel, bool, défaut `true`).

### 8. `video-frame`
Vidéo auto-hébergée (fichier `<video>` natif).
```json
{ "type": "video-frame", "source": "arweave:<tx-id>", "aspect": "16/9" }
```
Champs : `source` (requis), `aspect` (optionnel, défaut `"16/9"`).
**Règle de sizing** : uniquement pour fichiers < ~20 Mo ; au-delà → `video-embed`.

### 9. `video-embed`
Vidéo hébergée à l'extérieur (iframe provider). **[DÉCISION OWNER]** v1 : les vidéos
de la page Anarchisme (plusieurs Go) passent par ce type.
```json
{ "type": "video-embed", "provider": "youtube", "video_id": "dQw4w9WgXcQ", "aspect": "16/9" }
```
Champs : `provider` (requis, `"youtube"` | `"peertube"`), `video_id` (requis),
`aspect` (optionnel, défaut `"16/9"`). Peertube : `video_id` = URL complète de la vidéo.

### 10. `game-embed`
Jeu navigateur (future sortie RPG Maker) en iframe. **[À DÉFINIR PLUS TARD]** — le jeu
n'existe pas encore ; type réservé pour le jour où il existera.
```json
{ "type": "game-embed", "source": "http…", "engine": "rpgmaker", "mode": "iframe" }
```
Champs : `source` (requis), `engine` (optionnel, informatif), `mode` (défaut `"iframe"`).

### 11. `project-list`
Liste des projets dev du owner. Visible ou caché : non tranché (AGENTS.md §6) — le
bloc fonctionne dans les deux cas (page au menu, page hors menu, ou page « cimetière »).
```json
{ "type": "project-list", "projects": [
  { "name": "rmx_website", "description": "Ce site", "url": "https://github.com/0rmx0/rmx_website", "status": "wip" }
] }
```
Champs : `projects` (requis, liste de `{name, description, url, status}`) ;
`status` ∈ `"wip"` | `"done"` | `"abandonné"`. Les projets abandonnés restent listés
(esprit lostwave : rien ne disparaît, les états changent).

### 12. `html-raw`
Soupape de sécurité : HTML arbitraire, confiance totale en l'owner. À n'utiliser que
lorsqu'aucun type ne convient — chaque usage est un futur type de bloc en puissance.
```json
{ "type": "html-raw", "html": "<marquee>…</marquee>" }
```
Champs : `html` (requis, string).

## Structure globale (rappel)

```
menu  : liste ordonnée { label, page }      → l'ordre = l'ordre des boutons
pages : map page_key → { title, blocks[] }  → chaque page = liste de blocs
```

Les pages hors menu existent (pattern caché, easter egg). Les niveaux de mémoire
(AGENTS.md §5) : menu = visible, storage = existe, history = a existé.

## Exemple : le site actuel décrit en blocs

```
index      : [heading "R_m_X", image logo, text (base64 du message d'accueil),
              audio-spectro (image.wav, lossless:true — image en spectrogramme)]
lostwave   : [heading, nft-grid (tezos KT1Cp…),
              audio-spectro (etrangesensation.mp3, lossless:false),
              hidden-text (base64 "Étrange Sensation" — à corriger en Phase 1)]
nftgallery : [heading, nft-gallery (multiversx, STREET-b10df3 + YGGDRSL23-075ceb),
              audio-spectro (pp.wav), hidden-text (base64 corrigé)]
anarchisme : [heading, 4 × video-embed (décision owner v1),
              audio-spectro (ANARCHISME.mp3, lossless:false — vraie musique),
              hidden-text ("La propriété, c'est le vol !")]
```

## Checklist de validation (pour le contrat et le build)

Pour chaque bloc, le build doit vérifier :
1. `type` ∈ les 12 types ci-dessus ;
2. champs requis présents et bien typés ;
3. `source` au format autorisé (`arweave:` / `ipfs:` / `local:` / `http` selon le type) ;
4. `video-frame` : source < 20 Mo (règle de sizing) ;
5. `audio-spectro` : si `lossless: true` → source wav/flac obligatoire (image
   spectrogramme à préserver) ; sinon (vraie musique) mp3 accepté.

---

*Figé en v1 le jour de la Phase 0. Toute évolution = v2 + mise à jour du renderer.*
