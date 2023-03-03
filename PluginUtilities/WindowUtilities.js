function createPromptPage(opts) {
  const button = document.createElement("a");
  button.classList.add("tbl-tab-btn");
  button.id = `tbl-tbtn-${opts.id}`;
  button.innerHTML = opts.label;
  button.onclick = () => {activate_tab_opt(opts.id)};
  
  const header = opts.baseElement.querySelector(".prompt-section-header");
  const dialogOptions = opts.baseElement.querySelector("#dialog-options");

  opts.index = opts.index || -1;

  header.insertBefore(button, header.childNodes[opts.index]);

  const pageDiv = document.createElement("div");
  pageDiv.id = `tbl-mtab-opt-${opts.id}`;
  pageDiv.classList.add("tbl-mtab-opt");
  pageDiv.style.display = "none";

  opts.baseElement.querySelector("#dialog-options").appendChild(pageDiv);

  dialogOptions.appendChild(pageDiv);

  return pageDiv;
}

export default {
  createPromptPage
}