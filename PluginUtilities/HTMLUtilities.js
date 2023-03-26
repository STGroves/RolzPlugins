import Utilities from "./Utilities.js";
import GradientEditor from "../Controls/Gradient Editor/GradientEditor.js"
import PluginLoader from "../PluginLoader.js"

function createSlider(opts) {
  const sliderRange = document.createElement("input");

  let isSnapping = false;
  
  let updateTrack = function(element, progressColour, trackColour) {
    const width = element.offsetWidth;
    const adjWidth = width - 16;
    const delta = element.max - element.min;
    
    if (isSnapping)
      element.value = Math.round(element.value / 45) * 45;
    
    const stepPercent = (element.value - element.min) / delta;
    const actualWidth = (adjWidth * stepPercent) + (16 / 2);
    const widthPercent = actualWidth / width;
    const percent = widthPercent * 100;
    
    const currentStyle = window.getComputedStyle(element).backgroundImage;

    if (currentStyle.startsWith("-webkit"))
      element.style.backgroundImage = 
        '-webkit-gradient(linear, left top, right top, ' +
        'color-stop(' + percent + '%, ' + progressColour + '), ' +
        'color-stop(' + percent + '%, ' + trackColour + '))';
    else
      element.style.backgroundImage =
        '-moz-linear-gradient(left center, ' + progressColour +
        ' 0%, ' + progressColour + ' ' + percent + '%, ' + trackColour +' ' + percent +
        '%, ' + trackColour + ' 100%)';
  };
  
  sliderRange.id = opts.id;
  sliderRange.type = "range";
  sliderRange.min = opts.min;
  sliderRange.max = opts.max;
  sliderRange.value = opts.value;
  sliderRange.ariaLabel = opts.value;
  
  sliderRange.oninput = () => {
    updateTrack(sliderRange, "#aaf1aa", "transparent");
    sliderRange.ariaLabel = sliderRange.value;
    opts.callback(sliderRange.value);
  };
  sliderRange.onkeydown = (event) => {
    isSnapping = event.shiftKey;
  };
  sliderRange.onkeyup = (event) => {
    isSnapping = event.shiftKey;
  };
  sliderRange.onmousedown = () => {
    updateTrack(sliderRange, "#aaf1aa", "transparent");
  };
  sliderRange.onmousemove = (event) => {
    updateTrack(sliderRange, event.buttons == 0 ? "#80D480" : "#aaf1aa", "transparent");
  };
  sliderRange.onmouseleave = () => {
    updateTrack(sliderRange, "lightgreen", "transparent");
  };

  if (!document.getElementById(DEFAULT_ID) || !document.getElementById(DEFAULT_ID).innerHTML.search(".PluginSlider"))
    createOrUpdateStyle(DEFAULT_ID,`.PluginSlider {
      -webkit-appearance: none;
      -moz-appearance: none;
      border-radius: 8px;
      height: 8px;
      border: black solid 1px;
      width: 100%;
      margin: 0;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    .PluginSlider:focus {
      outline: none;
    }
    .PluginSlider::-webkit-slider-thumb {
      -webkit-appearance: none !important;
      background-color: lightgreen;
      height: 16px;
      width: 16px;
      border-radius: 50%;
    }
    .PluginSlider::-webkit-slider-thumb:hover {
      background-color: #80d480;
    }
    .PluginSlider::-webkit-slider-thumb:active {
      background-color: #aaf1aa;
    }`);
    
  let val = (opts.value - opts.min) / (opts.max - opts.min);
  let percent = val * 100;
  
  createOrUpdateStyle(DEFAULT_ID,`#${opts.id} {
    background-image: -webkit-gradient(linear,
      left top, 
      right top, 
      color-stop(${percent}%, lightgreen),
      color-stop(${percent}%, transparent));
  
    background-image: -moz-linear-gradient(left center,
      lightgreen 0%, lightgreen ${percent}%,
      transparent ${percent}%, transparent 100%);
  }`, sliderRange);

  sliderRange.classList.add("hint--bottom", "PluginSlider");
  
  if (!!opts.parentElement)
    opts.parentElement.assignChild(sliderRange);
  
  return sliderRange;
}

function createGradientEditor(opts) {
  const editor = new GradientEditor(opts);

  if (!!opts.loadData)
    editor.load(opts.loadData);

  if (!document.querySelector("[href='https://stgroves.github.io/RolzPlugins/Controls/Gradient%20Editor/GradientEditorCSS.css']")) {
    const cssLink = document.createElement("link");
    cssLink.href = "https://stgroves.github.io/RolzPlugins/Controls/Gradient%20Editor/GradientEditorCSS.css";
    cssLink.rel = "stylesheet";

    document.head.append(cssLink);
  }
  
  if (!styleExists(PluginLoader.DEFAULT_CSS_ID, "#prompt-window input[type=number]"))
    createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, "#prompt-window input[type=number]", `    background: black;
      padding: 8px;
      color: lightgreen;
      font-weight: bold;
      width: 100%;
      border: 2px solid rgba(255,255,200,0.3);
      margin-bottom: 8px;
      box-shadow: none;`
    );

  if (!styleExists(PluginLoader.DEFAULT_CSS_ID, ".handleWrapperInput"))
    createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, ".handleWrapperInput", `
    padding-left: 0 !important;
    padding-right: 0 !important;
    `);

  return editor;
}

function createSelection(opts) {
  let oldValue;

  const selection = document.createElement("select");

  for (const [key, value] of Object.entries(opts.options)) {
    const option = document.createElement("option");

    option.value = key;
    option.innerText = value;

    selection.appendChild(option);
  }

  selection.value = opts.defaultValue;
  oldValue = selection.value;
  
  selection.addEventListener("change", (event) => {
    if (!!opts.options[oldValue])
      selection.dispatchEvent(new CustomEvent("hidden", {detail: oldValue}));
    
    if (!!opts.options[event.target.value])
      selection.dispatchEvent(new CustomEvent("visible", {detail: event.target.value}));
    
    oldValue = event.target.value;
  });

  return selection;
}

function styleExists(ID, className) {
  ID = ID || DEFAULT_ID;

  const style = document.getElementById(ID);

  return (style && style.innerHTML.search(`${className} {`) > -1);
}

function createOrUpdateStyle(ID, className, cssInner, parentElement = null) {
  parentElement = parentElement || document.body;
  ID = ID || PluginLoader.DEFAULT_CSS_ID;

  try {
    if (!Utilities.isElement(parentElement))
      throw "parentElement must be an Element!"

    const newData = `${className} {${cssInner}}`;
    
    let style;

    if (!document.getElementById(ID)) {
      style = document.createElement("style");
      style.id = ID;
      style.innerHTML += newData;
      parentElement.appendChild(style);
    } else {
      style = document.getElementById(ID);

      if (styleExists(ID, className))
        style.innerHTML.replace(new RegExp(`^ *${className} {0,1}{[^\{\}]+}`), newData);
      
      else
        style.innerHTML += "\n" + newData;
    }
  } catch(e) {
    console.error(e);
  }
}

export default {
  createSlider,
  createGradientEditor,
  createSelection,
  createOrUpdateStyle,
  styleExists
}