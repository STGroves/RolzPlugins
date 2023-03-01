function init(plugins) {
  let loaded = [];
  const elem = document.getElementsByTagName("body")[0];

  this.load = function(opts) {
    try {
      if (loaded.includes(opts.type.toLowerCase()))
        throw `${opts.type} has already been loaded!`;

      let scriptElem = document.createElement("script");
      scriptElem.type = "module";
      scriptElem.src = `https://stgroves.github.io/RolzPlugins/${opts.type}.js`;
      elem.insertBefore(scriptElem, elem.lastChild);

      if (!opts.initialFunc || (!!opts.initialFunc && new Function(`${opts.initialFunc}()`)))
        loaded.push(opts.type.toLowerCase());
    } catch (e) {
      console.error(e);
    }
  }

  this.contains = function(name) {
    return loaded.includes(name.toLowerCase());
  }

  plugins.forEach(value => {
    load(value);
  });

  return this;
}

export default {
  init
}