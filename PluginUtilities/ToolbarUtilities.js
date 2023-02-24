function createToolbar(id, css, parentElement = null) {
  parentElement = parentElement || document.body;
  
  let toolbar = document.createElement("div");

  try {
    if (!!document.getElementById(id))
      throw "An element with that ID already exists!";
    
    toolbar.id = id;
    
    if (!!css)
      toolbar.classList.add(css);
    
    toolbar.classList.add("tool-bar");
    
    parentElement.appendChild(toolbar);
  }

  catch(e) {
    console.error(e);
  }
}

function createButton(toolbar, hint, icon, idx) {

}

export default {
  createToolbar
}