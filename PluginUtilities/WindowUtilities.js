function createPromptPage(opts) {
  const button = document.createElement("a");
  button.classList.add("tbl-tab-btn");
  button.id = opts.id;
  button.innerHTML = opts.label;
  button.onclick = () => {activate_tab_opt(opts.id)};
  
  const header = opts.baseElement.querySelector(".prompt-section-header");
  header.insertBefore(button, header.childNodes[opts.index]);

  const pageDiv = document.createElement("div");
  pageDiv.id = `tbl-mtab-opt-${opts.id}`;
  pageDiv.classList.add("tbl-mtab-opt");
  pageDiv.style.display = "none";

  opts.baseElement.querySelector("#dialog-options").appendChild(pageDiv);

  pageDiv.innerHTML = "Hello!";
}