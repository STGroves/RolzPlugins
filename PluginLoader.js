function init(plugins) {
  let loaded = [];
  const elem = document.getElementsByTagName("body")[0];
  document.onMessage = (msg) => {
    if (msg.type === "keep-alive-return")
      return;

    const {type, ...data} = msg;

    document.dispatchEvent(new CustomEvent(type, {detail: data}));
  }

  this.load = function(path) {
    try {
      const lowerPath = path.toLowerCase();
      const foundPlugin = loaded.find(x => x.plugin === lowerPath);
      
      if (!!foundPlugin) {
        if (foundPlugin.status === "Loading")
          throw `${path} is already loading!`;
        else if (foundPlugin.status === "Loaded")
          throw `${path} has already been loaded!`;
        else
          throw 'Unknown Status';
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

  this.addCallbackListener = function(plugin, callback, executeIfAlreadyLoaded = false) {
    loaded.find(x => x.plugin === plugin.toLowerCase()).callback.push(callback);

    if (executeIfAlreadyLoaded)
      callback();
  }

  this.contains = function(plugin) {
    return loaded.findIndex(x => x.plugin === plugin.toLowerCase()) > -1;
  }

  this.getStatus = function(plugin) {
    return loaded.find(x => x.plugin === plugin.toLowerCase()).status;
  }

  plugins.forEach(value => {
    this.load(value);
  });

  return this;
}

export default {
  init
}