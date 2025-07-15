const grid = document.getElementById("nft-grid");

const contractAddress = "tz1hccAaa3wocPEiCa8VELpzesgdXqg7NVKg";
const tzktApi = `https://api.tzkt.io/v1/tokens?contract=${contractAddress}&limit=1000`;

function ipfsToHttp(uri) {
  return uri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
}

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
  div.title = nft.name || "NFT";

  const link = document.createElement("a");
  link.href = nft.downloadUrl;
  link.download = nft.filename || "lostwave_nft";
  link.appendChild(div);

  return link;
}

async function fetchNFTs() {
  try {
    const res = await fetch(tzktApi);
    const data = await res.json();

    const validNFTs = data
      .map(token => {
        const meta = token.metadata || {};
        const uri = meta.artifactUri || meta.displayUri || meta.thumbnailUri;
        if (!uri || !uri.startsWith("ipfs://")) return null;

        const filename = meta.name?.replace(/\s+/g, "_") || token.tokenId + ".bin";
        return {
          name: meta.name,
          downloadUrl: ipfsToHttp(uri),
          filename,
        };
      })
      .filter(Boolean);

    validNFTs.forEach(nft => {
      const tile = createTile(nft);
      grid.appendChild(tile);
    });

  } catch (err) {
    console.error("Erreur lors du chargement des NFTs :", err);
    grid.innerHTML = "<p>Erreur lors du chargement des NFTs.</p>";
  }
}

fetchNFTs();
