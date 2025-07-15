const grid = document.getElementById("nft-grid");

// Simule une liste de NFTs avec IPFS hashes et types (audio/zip)
const fakeNFTs = Array.from({ length: 24 }, (_, i) => {
  const isAudio = Math.random() < 0.5;
  const hash = `QmFakeHash${i.toString().padStart(2, "0")}`;
  const filename = isAudio ? `track${i}.mp3` : `archive${i}.zip`;
  return {
    ipfsHash: hash,
    type: isAudio ? "audio" : "zip",
    filename,
  };
});

// Génère une couleur aléatoire abstraite
function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.random() * 40;
  const l = 40 + Math.random() * 20;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function createTile(nft) {
  const div = document.createElement("div");
  div.className = "square";
  div.style.background = randomColor();
  div.title = `Télécharger ${nft.filename}`;

  // Téléchargement via IPFS gateway
  const link = document.createElement("a");
  link.href = `https://ipfs.io/ipfs/${nft.ipfsHash}?filename=${nft.filename}`;
  link.download = nft.filename;
  link.appendChild(div);

  return link;
}

// Affiche tous les carrés
fakeNFTs.forEach(nft => {
  const tile = createTile(nft);
  grid.appendChild(tile);
});
