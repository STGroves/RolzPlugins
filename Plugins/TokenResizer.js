import HTMLUtilities from "../PluginUtilities/HTMLUtilities.js";
import PluginLoader from "../PluginLoader.js";

export default function () {
  const defaultSizes = ["1", "1_5", "2", "3", "4"];
  const customSizes = [];

  const style = document.getElementById("map-dynamic-style");

  document.addEventListener("client-tbl-mapdata", updateCSS);
  DM.map_pane[0].addEventListener("wheel", loadCSS);

  if (!PluginLoader.contains("PluginUtilities/TableUIUtilities"))
    PluginLoader.load("PluginUtilities/TableUIUtilities");

  PluginLoader.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
    TableUI.pane.addHandler("open", 'tbl_prop_edit', addResizeInput);
  })

  HTMLUtilities.createOrUpdateStyle("TokenResizerCSS", `  .NoOutline:focus {
    outline: 0;
  }
  .NoOutline {
      border: 0;
  }
  .NoOutline::-webkit-outer-spin-button, .NoOutline::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .InputWrapper {
    display: flex;
    border: 1px solid rgba(200,200,200,0.3);
    padding-right: 6px;
  }
  .Suffix {
    color: lightgreen;
    font-weight: bold;
    font-family: helvetica, Tahoma, Arial;
    min-width: 0 !important;
    flex: 0 !important;
    right: 50%;
    transform: TranslateX(-50%);
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
    if (!data.detail.mapdata || !data.detail.mapdata.csz)
      return;

    const strVal = String(data.detail.mapdata.sz).replace(".", "_");

    if (customSizes.includes(strVal))
      return;
    
    customSizes.push(strVal);

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

    const inpWrapper = document.createElement("div");
    inpWrapper.classList.add("InputWrapper");

    const inpLabel = document.createElement("label");
    inpLabel.innerHTML = "X";
    inpLabel.classList.add("Suffix");

    const inpBox = document.createElement("input");
    inpBox.classList.add("input", "NoOutline");
    inpBox.type = "number";

    const size = token.sz || "1";
    inpBox.value = Number(size.replace("_", "."));
    
    inpBox.onchange = () => {
      const actualValue = String(inpBox.value).replace(".","_");
      save_token({sz: actualValue, csz: defaultSizes.includes(actualValue)});
      loadCSS();
    }

    inpWrapper.append(inpBox, inpLabel);

    parent.replaceChild(inpWrapper, child);
  }
}