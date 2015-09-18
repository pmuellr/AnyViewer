// Licensed under the Apache License. See footer for details.

"use strict"

const fs   = require("fs")

//------------------------------------------------------------------------------
// const PluginName = path.basename(__dirname)

exports.toHTML     = toHTML
exports.extensions = "txt".split(" ")

//------------------------------------------------------------------------------
function toHTML(iVinyl, oVinyl, cb) {
  const source = fs.readFileSync(iVinyl.path, "utf8")
  const output = []

  output.push("<style>")
  output.push("body, pre, xmp, tt, code {")
  output.push("  font-family: Source Code Pro, Menlo, Monaco, Courier")
  output.push("}")
  output.push("</style>")
  output.push("<pre>")
  output.push(escapeHTML(source))
  output.push("</pre>")

  fs.writeFileSync(oVinyl.path, output.join("\n"))
  cb(null)
}

//------------------------------------------------------------------------------
function escapeHTML(source) {
  source = source
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  return "<pre>" + source + "</pre>"
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
