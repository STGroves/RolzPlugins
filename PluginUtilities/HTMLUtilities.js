import Utilities from "./Utilities.js";

const ID = "PluginCSS";

function createSlider(opts) {
  let sliderRange = document.createElement("input");

  let updateTrack = function(element, progressColour, trackColour) {
    const width = element.offsetWidth;
    const adjWidth = width - 16;
    const delta = element.max - element.min;
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
    sliderRange.ariaLabel = sliderRange.value;
    updateTrack(sliderRange, "#aaf1aa", "transparent")
  };
  sliderRange.onmousedown = () => {updateTrack(sliderRange, "#aaf1aa", "transparent")};
  sliderRange.onmousemove = (event) => {
    updateTrack(sliderRange, event.buttons == 0 ? "#80D480" : "#aaf1aa", "transparent")
  };
  sliderRange.onmouseleave = () => {updateTrack(sliderRange, "lightgreen", "transparent")};

  if (!document.getElementById(ID) || !document.getElementById(ID).innerHTML.search(".PluginSlider"))
    createOrUpdateStyle("PluginDefault",`.PluginSlider {
      -webkit-appearance: none;
      -moz-appearance: none;
      border-radius: 8px;
      height: 8px;
      border: black solid 1px;
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
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
  
  createOrUpdateStyle("PluginDefault",`#${opts.id} {
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

function createOrUpdateStyle(ID, cssString, parentElement = null) {
  parentElement = parentElement || document.body;

  try {
    if (!Utilities.isElement(parentElement))
      throw "parentElement must be an Element!"

    let style;

    if (!document.getElementById(ID)) {
      style = document.createElement("style");
      style.id = ID;
      parentElement.appendChild(style);
    } else {
      style = document.getElementById(ID);
    }

    style.innerHTML += cssString;
  } catch(e) {
    console.error(e);
  }
}

export default {
  createSlider,
  createOrUpdateStyle
}