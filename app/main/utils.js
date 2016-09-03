'use strict'

exports.i2a = i2a
exports.clone = clone
exports.dumpMap = dumpMap
exports.htmlEscape = htmlEscape
exports.onlyCallOnce = onlyCallOnce

// -----------------------------------------------------------------------------
function onlyCallOnce (fn) {
  let called = false

  return function () {
    if (called) return null
    called = true

    return fn.apply(this, arguments)
  }
}

// -----------------------------------------------------------------------------
function i2a (iterator) {
  const array = []

  for (let value of iterator) {
    array.push(value)
  }

  return array
}

// -----------------------------------------------------------------------------
function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

// -----------------------------------------------------------------------------
function dumpMap (map) {
  let line = 'Map{'

  map.forEach(function (val, key) {
    line += key + ', '
  })

  line += '}'

  console.log(line)
}

// -----------------------------------------------------------------------------
function htmlEscape (string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
}
