const tezosCollections = [
  //{ name: "Tezos A", address: "KT1XXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
  //{ name: "Tezos B", address: "KT1YYYYYYYYYYYYYYYYYYYYYYYYYY" }
];

const multiversxCollections = [
  { name: "Street", id: "STREET-b10df3" },
  { name: "Yggdrasil2023", id: "YGGDRSL23-075ceb" }
];

const allCollections = [
  ...tezosCollections.map(c => ({ ...c, type: "tezos" })),
  ...multiversxCollections.map(c => ({ ...c, type: "multiversx" }))
];

async function fetchTezosNFTs(contract) {
  const url = `https://api.tzkt.io/v1/tokens?contract=${contract}&token.metadata.artifactUri.null=false&limit=1000`;
  const response = await fetch(url);
  return response.json();
}

async function fetchMultiversxNFTs(collectionId) {
  const url = `https://api.multiversx.com/nfts?collection=${collectionId}&size=1000`;
  const response = await fetch(url);
  return response.json();
}

function clearGallery() {
  document.getElementById("gallery").innerHTML = "";
}

function renderNFTImage(url, alt) {
  const gallery = document.getElementById("gallery");
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  const img = document.createElement("img");
  img.src = url;
  img.alt = alt;
  a.appendChild(img);
  gallery.appendChild(a);
}

async function displayNFTs(collection) {
  // Ne pas effacer ici !
  if (collection.type === "tezos") {
    try {
      const tokens = await fetchTezosNFTs(collection.address);
      tokens.forEach(token => {
        const uri = token.metadata?.displayUri || token.metadata?.artifactUri;
        if (uri) {
          const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          renderNFTImage(url, token.metadata?.name || "NFT");
        }
      });
    } catch (e) {
      console.error("Erreur Tezos", e);
    }
  } else if (collection.type === "multiversx") {
    try {
      const tokens = await fetchMultiversxNFTs(collection.id);
      tokens.forEach(token => {
        const url = token.media?.[0]?.url;
        if (url) renderNFTImage(url, token.name || "NFT");
      });
    } catch (e) {
      console.error("Erreur MultiversX", e);
    }
  }
}

async function displayAllNFTs() {
  clearGallery();
  for (const c of allCollections) {
    await displayNFTs(c);
  }
}

function setupFilterMenu() {
  const select = document.getElementById("collectionFilter");
  allCollections.forEach((c, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = c.name;
    select.appendChild(option);
  });

  select.addEventListener("change", async () => {
    const value = select.value;
    clearGallery();
    if (value === "all") {
      await displayAllNFTs();
    } else {
      await displayNFTs(allCollections[parseInt(value)]);
    }
  });
}

async function initGallery() {
  setupFilterMenu();
  await displayAllNFTs();
}

initGallery();
