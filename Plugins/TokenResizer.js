export default function () {
  const defaultSizes = ["1", "1_5", "2", "3", "4"];
  let customSizes = [];

  let style = document.getElementById("map-dynamic-style");

  document.addEventListener("message", updateCSS);
  DM.map_pane[0].addEventListener("wheel", loadCSS);

  if (!DM.data.plugins.contains("PluginUtilities/TableUIUtilities"))
    DM.data.plugins.load("PluginUtilities/TableUIUtilities");

  console.log(TableUI.pane);
  console.log(TableUI.pane.onOpen);

  if (!TableUI.pane.onOpen.hasOwnProperty('tbl_prop_edit') || !TableUI.pane.onOpen['tbl_prop_edit'].includes(addResizeInput))
    TableUI.pane.addHandler("onOpen", 'tbl_prop_edit', addResizeInput);

  loadCSS();

  function loadCSS() {
    for (const [_, value] of Object.entries(DM.data.token)) {
      if (value.sz === undefined)
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
    let sizeNum = Number(size.replace("_", "."));
    style.innerHTML += `.token-${size}x { width: ${sizeNum * DM.tile_size }px; height: ${sizeNum * DM.tile_size}px; }
    .token-${size}x .glyph { font-size: ${sizeNum * DM.tile_size / 1.3}px; }`;
  }

  function addResizeInput(elementBase) {
    const child = elementBase.querySelector("select[onchange=\"save_token({ 'sz' : $(this).val() });\"]")
    const parent = child.parentElement;

    const inpBox = document.createElement("input");
    inpBox.classList.add("input");
    inpBox.type = "number";
    inpBox.onchange = () => {
      const actualValue = String(inpBox.value).replace(".","_");
      save_token({sz: actualValue});
    }

    parent.replaceChild(inpBox, child);
  }
}