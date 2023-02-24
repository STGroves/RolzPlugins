import Utilities from "./Utilities.js";

function createToolbar(id, cssClass, parentElement = null) {
  parentElement = parentElement || document.head;

  try {
    if (!id)
      throw "id cannot be empty!";

    if (!Utilities.isString(id))
      throw "id must be a string!";
    
    if (!!css && !Utilities.isString(cssClass))
      throw "cssClass must be a string!";

    if (!Utilities.isElement(parentElement))
      throw "parentElement must be an instance of Element!";

    if (!!document.getElementById(id))
      throw "An element with that ID already exists!";
    
    let toolbar = document.createElement("div");

    toolbar.id = id;
    
    if (!!cssClass)
      toolbar.classList.add(cssClass);
    
    toolbar.classList.add("tool-bar");
    
    parentElement.appendChild(toolbar);
  } catch(e) {
    console.error(e);
  }
}

function createButton(toolbarID, buttonID, hint, icon, callback, idx = -1) {
  try {
    if (!toolbarID)
      throw "toolbarID cannot be empty!";

    if (!buttonID)
      throw "buttonID cannot be empty!";

    if (!hint)
      throw "hint cannot be empty!";

    if (!icon)
      throw "icon cannot be empty!";

    if (!Utilities.isString(icon))
      throw "icon must be a string!";

    if (!Utilities.isString("hint"))
      throw "hint must be a string!";

    if (!Utilities.isString(toolbarID))
      throw "toolbarID must be a string!";

    if (!Utilities.isString(buttonID))
      throw "buttonID must be a string!";

    if (!Utilities.isNumber(idx))
      throw "idx must be a number!";

    if (!Utilities.isFunction(callback))
      throw "callback must be a function!";

    let toolbar = document.getElementById(toolbarID);
    
    if (!toolbar || (toolbarID !== "table-toolbar" && !toolbar.classList.contains("tool-bar")))
      throw "Element is not a toolbar!";
    
    if (!!document.getElementById(buttonID))
      throw "An element with that ID already exists!";

    let menuBtn = document.createElement("button");
    
    menuBtn.id = buttonID;
    menuBtn.ariaLabel = hint;
    menuBtn.classList.add("hint--bottom");
    menuBtn.onclick = callback;
    
    if (icon.length === 1) {
      menuBtn.innerHTML = " " + icon + " ";
    } else {
      let btnIcon = document.createElement("i");

      btnIcon.classList.add("fa", "fa-"+icon);

      menuBtn.appendChild(btnIcon);
    }

    if (idx > -1) {
      toolbar.insertBefore(menuBtn, toolbar.children[idx]);
    } else {
      toolbar.appendChild(menuBtn);
    }

    if (toolbarID === "selection-bar")
      toolbar.style.width = "auto";

  } catch(e) {
    console.error(e);
  }
}

export default {
  createToolbar,
  createButton
}