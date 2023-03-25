function isString(obj) {
  return typeof(obj) === 'string' || obj instanceof String;
}

function isNumber(obj) {
  return typeof(obj) === 'number' || obj instanceof Number;
}

function isFunction(obj) {
  return typeof(obj) === 'function' || obj instanceof Function;
}

function isElement(obj) {
  return obj instanceof Element;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function isEmptyArray(arr) {
  return arr.length === 0;
}

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

export default {
  isString,
  isNumber,
  isFunction,
  isElement,
  isEmptyObject,
  isEmptyArray,
  toTitleCase
}