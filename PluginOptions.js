import PluginLoader from "https://stgroves.github.io/RolzPlugins/PluginLoader.js";

DM.data.plugins = PluginLoader.init([
  {type: "Plugins/DockMinimiser", initialFunc: "DockMinimiser"}
]);
console.log("Run!");