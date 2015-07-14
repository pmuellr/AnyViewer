// Licensed under the Apache License. See footer for details.

"use strict"

exports.i2a        = i2a
exports.clone      = clone
exports.dumpMap    = dumpMap
exports.htmlEscape = htmlEscape

//------------------------------------------------------------------------------
function i2a(iterator) {
  const array = []

  for (let value of iterator) {
    array.push(value)
  }

  return array
}

//------------------------------------------------------------------------------
function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

//------------------------------------------------------------------------------
function dumpMap(map) {
  let line = "Map{"

  map.forEach(function(val, key) {
    line += key + ", "
  })

  line += "}"

  console.log(line)
}

//------------------------------------------------------------------------------
function htmlEscape(string) {
  return string
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/\'/g, "&#39;")
    .replace(/\"/g, "&quot;")
}

//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
