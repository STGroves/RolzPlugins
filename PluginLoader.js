import PluginServerHandler from "./PluginServerHandler.js";

let loaded = [];
const elem = document.body.firstElementChild;

const DEFAULT_CSS_ID = "DefaultPluginCSS";

function load(path) {
  try {
    const lowerPath = path.toLowerCase();
    const foundPlugin = loaded.find(x => x.plugin === lowerPath);
    
    if (!!foundPlugin) {
      switch(foundPlugin.status) {
        case "Loading":
          throw `${path} is already loading!`;

        case "Loaded":
          throw `${path} has already been loaded!`;

        default:
          throw 'Unknown Status';
      }
    }

    const scriptElem = document.createElement("script");
    scriptElem.type = "module";
    scriptElem.src = `https://stgroves.github.io/RolzPlugins/${path}.js`;
    scriptElem.onload = async () => {
      try {
        const script = await import(`https://stgroves.github.io/RolzPlugins/${path}.js`);
        script.default();
        
        const foundPlugin = loaded.find(x => x.plugin === lowerPath);
        foundPlugin.status = "Loaded";
        foundPlugin.callback.forEach(x => x());
      } catch(e) {
        loaded.splice(loaded.findIndex(x => x.plugin === lowerPath), 1);
        console.error(e);
      }
    }
    elem.insertBefore(scriptElem, elem.lastChild);

    loaded.push({plugin: lowerPath, status: "Loading", callback: []});
  } catch (e) {
    console.error(e);
  }
}

function addCallbackListener(plugin, callback, executeIfAlreadyLoaded = false) {
  loaded.find(x => x.plugin === plugin.toLowerCase()).callback.push(callback);

  if (executeIfAlreadyLoaded)
    callback();
}

function contains(plugin) {
  return loaded.findIndex(x => x.plugin === plugin.toLowerCase()) > -1;
}

function getStatus(plugin) {
  return loaded.find(x => x.plugin === plugin.toLowerCase()).status;
}

function init(plugins, initServer = true) {
  if (initServer)
    PluginServerHandler.init();

  plugins.forEach(value => {
    load(value);
  });
}

export default {
  init,
  load,
  addCallbackListener,
  getStatus,
  contains,
  DEFAULT_CSS_ID
}