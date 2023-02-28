const arr = ["OldChat", "OldLedger", "RoomLogo", "TokenResizer", "TokenRotation"];

function load() {
  const elem = document.getElementsByTagName("body")[0];
  arr.forEach((x) => {
    let A = document.createElement("script");
    A.type = "module";
    A.onload = function() {};
    A.src = `https://stgroves.github.io/RolzPlugins/Plugins/${x}.js`;
    elem.insertBefore(A, elem.lastChild);
  });
}

load();