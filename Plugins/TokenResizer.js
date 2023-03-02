import HTMLUtilities from "../PluginUtilities/HTMLUtilities.js";

export default function () {
  const defaultSizes = ["1", "1_5", "2", "3", "4"];
  let customSizes = [];

  const style = document.getElementById("map-dynamic-style");

  document.addEventListener("message", updateCSS);
  DM.map_pane[0].addEventListener("wheel", loadCSS);

  if (!DM.data.plugins.contains("PluginUtilities/TableUIUtilities"))
    DM.data.plugins.load("PluginUtilities/TableUIUtilities");

  DM.data.plugins.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
    TableUI.pane.addHandler("onOpen", 'tbl_prop_edit', addResizeInput);
  })

  HTMLUtilities.createOrUpdateStyle("TokenResizerCSS", `.NoOutline:focus {
    outline: 0;
  }`);

  loadCSS();

  function loadCSS() {
    for (const [_, value] of Object.entries(DM.data.token)) {
      if (value.sz === undefined || value.sz === "")
        continue;

      const strVal = String(value.sz).replace(".", "_");

      if (defaultSizes.includes(strVal) || customSizes.includes(strVal))
        continue;
      
      addClass(strVal);
    }
  }

  function updateCSS(data) {
    if (!data.mapdata || !data.mapdata.csz)
      return;

    delete data.mapdata.csz;

    const strVal = String(value.sz).replace(".", "_");

    if (customSizes.includes(strVal))
      return;
      
    addClass(strVal);
  }

  function addClass(size) {
    const sizeNum = Number(size.replace("_", "."));
    style.innerHTML += `.token-${size}x { width: ${sizeNum * DM.tile_size }px; height: ${sizeNum * DM.tile_size}px; }
    .token-${size}x .glyph { font-size: ${sizeNum * DM.tile_size / 1.3}px; }`;
  }

  function addResizeInput(elementBase) {
    const child = elementBase.querySelector("select[onchange=\"save_token({ 'sz' : $(this).val() });\"]")
    const parent = child.parentElement;

    const inpBox = document.createElement("input");
    inpBox.classList.add("input", "NoOutline");
    inpBox.type = "number";

    const size = token.sz || "1";
    inpBox.value = Number(size.replace("_", "."));
    
    inpBox.onchange = () => {
      const actualValue = String(inpBox.value).replace(".","_");
      save_token({sz: actualValue, csz: true});
    }

    parent.replaceChild(inpBox, child);
  }
}