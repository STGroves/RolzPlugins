import PluginLoader from "https://stgroves.github.io/RolzPlugins/PluginLoader.js";

let Plugins = PluginLoader.init([
  {type: "Plugins/DockMinimiser", initialFunc: "DockMinimiser"}
]);
console.log("Run!");