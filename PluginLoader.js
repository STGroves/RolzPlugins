function init(plugins) {
  let loaded = [];
  const elem = document.getElementsByTagName("body")[0];
  document.onMessage = (data) => {
    this.dispatchEvent(new CustomEvent("message", data));
  }

  this.load = function(path) {
    try {
      let foundPlugin = loaded.find(x => x.plugin === path.toLowerCase());
      
      if (!!foundPlugin) {
        if (foundPlugin.status === "Loading")
          throw `${path} is already loading!`;
        else if (foundPlugin.status === "Loaded")
          throw `${path} has already been loaded!`;
        else
          throw 'Unknown Status';
      }

      let scriptElem = document.createElement("script");
      scriptElem.type = "module";
      scriptElem.src = `https://stgroves.github.io/RolzPlugins/${path}.js`;
      scriptElem.onload = async () => {
        try {
          let script = await import(`https://stgroves.github.io/RolzPlugins/${path}.js`);
          script.default();
          loaded.find(x => x.plugin === path.toLowerCase()).status = "Loaded";
        } catch(e) {
          loaded.splice(loaded.findIndex(x => x.plugin === path.toLowerCase()), 1);
          console.error(e);
        }
      }
      elem.insertBefore(scriptElem, elem.lastChild);

      loaded.push({plugin: path.toLowerCase(), status: "Loading"});
    } catch (e) {
      console.error(e);
    }
  }

  this.contains = function(name) {
    return loaded.includes(name.toLowerCase());
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