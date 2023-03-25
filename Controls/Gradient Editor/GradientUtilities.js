function componentToHex(c) {
	const hex = c.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return `#${componentToHex(Number(r))}${componentToHex(Number(g))}${componentToHex(Number(b))}`;
}

function setCSSVariable(variable, value) {
	const root = document.querySelector(':root');
	
	root.style.setProperty(variable, value);
}

export default {
  rgbToHex,
  setCSSVariable
}