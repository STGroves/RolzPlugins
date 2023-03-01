const elem = document.getElementsByTagName("body")[0];
let scriptElem = document.createElement("script");
scriptElem.type = "module";
scriptElem.src = `https://stgroves.github.io/RolzPlugins/PluginLoader.js`;
elem.insertBefore(scriptElem, elem.lastChild);

let Plugins = init([
  {type: "Plugins/DockMinimiser", initialFunc: DockMinimiser}
]);
console.log("Run!");