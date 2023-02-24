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

export default {
  isString,
  isNumber,
  isFunction,
  isElement
}