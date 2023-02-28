setInterval(() => {loadCSS();}, 500);

const sizes = ["1", "1_5", "2", "3", "4"];
let style = document.getElementById("map-dynamic-style");

function loadCSS() {
  for (const [_, value] of Object.entries(DM.data.token)) {
    if (!sizes.includes(value.sz) && style.innerHTML.search(".token-" + value.sz + "x") === -1)
      addClass(value.sz);
  }
}

function addClass(size) {
  let sizeNum = Number(size.replace("_", "."));
  style.innerHTML += `.token-${size}x { width: ${sizeNum * DM.tile_size }px; height: ${sizeNum * DM.tile_size}px; }
  .token-${size}x .glyph { font-size: ${sizeNum * DM.tile_size / 1.3}px; }`;
}