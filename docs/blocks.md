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
**Le fichier doit rester sans perte (wav) : les spectrogrammes contiennent des images.**
```json
{ "type": "audio-spectro", "source": "arweave:<tx-id>", "trigger": "heading-click", "loop": true }
```
Champs : `source` (requis), `trigger` (requis, seul `"heading-click"` supporté en v1),
`loop` (optionnel, bool, défaut `true`).

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
              audio-spectro (image.wav)]
lostwave   : [heading, nft-grid (tezos KT1Cp…), audio-spectro (etrangesensation.mp3),
              hidden-text (base64 "Étrange Sensation" — à corriger en Phase 1)]
nftgallery : [heading, nft-gallery (multiversx, STREET-b10df3 + YGGDRSL23-075ceb),
              audio-spectro (pp.wav), hidden-text (base64 corrigé)]
anarchisme : [heading, 4 × video-embed (décision owner v1),
              audio-spectro (ANARCHISME.mp3 — spectrogramme à vérifier en Phase 1),
              hidden-text ("La propriété, c'est le vol !")]
```

## Checklist de validation (pour le contrat et le build)

Pour chaque bloc, le build doit vérifier :
1. `type` ∈ les 12 types ci-dessus ;
2. champs requis présents et bien typés ;
3. `source` au format autorisé (`arweave:` / `ipfs:` / `local:` / `http` selon le type) ;
4. `video-frame` : source < 20 Mo (règle de sizing) ;
5. `audio-spectro` : source sans perte (wav/flac) — refuser mp3/ogg.

---

*Figé en v1 le jour de la Phase 0. Toute évolution = v2 + mise à jour du renderer.*
