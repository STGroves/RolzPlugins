import HTMLUtilities from "./HTMLUtilities.js";

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

function createPromptSection(title) {
  const headerDiv = document.createElement("div");
  headerDiv.innerText = title;
  headerDiv.classList.add("promp-section-header");
  
  const sectionDiv = document.createElement("div");
  sectionDiv.classList.add("promp-section");

  return {section: headerDiv, sectionContent: sectionDiv};
}

function createPromptCheckbox(label, value, callback) {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.innerHTML = `<label>${label}</label>
  <input type="checkbox" style="flex: 0;" value=${value}>`;

  wrapperDiv.classList.add("flex-input");

  const input = wrapperDiv.lastElementChild;
  input.onchange = () => {callback(input.value)};

  return wrapperDiv;
}

function createPromptColourInput(label, value, callback) {
  if (!HTMLUtilities.styleExists(undefined, ".colourInput")) {
    HTMLUtilities.createOrUpdateStyle(undefined,`.colourInput {
      height: inherit;
    }`);
  };

  const wrapperDiv = document.createElement("div");
  wrapperDiv.innerHTML = `<label>${label}</label>
  <input type="color" class="colourInput" value="${value}"/>`;

  wrapperDiv.classList.add("flex-input");

  const input = wrapperDiv.lastElementChild;
  input.onchange = () => {callback(label, input.value)};

  return wrapperDiv;
}

export default {
  createPromptPage,
  createPromptSection,
  createPromptCheckbox,
  createPromptColourInput
}