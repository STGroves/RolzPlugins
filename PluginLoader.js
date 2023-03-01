function init(plugins) {
  let loaded = [];
  const elem = document.getElementsByTagName("body")[0];

  this.load = function(path) {
    try {
      if (loaded.includes(path.toLowerCase()))
        throw `${path} has already been loaded!`;

      let scriptElem = document.createElement("script");
      scriptElem.type = "module";
      scriptElem.src = `https://stgroves.github.io/RolzPlugins/${path}.js`;
      scriptElem.onload = () => {
        try {
          new Function("DockMinimiser()")();
        } catch(e) {
          console.error(e)
        }
      }
      elem.insertBefore(scriptElem, elem.lastChild);

      loaded.push(path.toLowerCase());
    } catch (e) {
      console.error(e);
    }
  }

  this.contains = function(name) {
    return loaded.includes(name.toLowerCase());
  }

  plugins.forEach(value => {
    this.load(value);
  });

  return this;
}

export default {
  init
}