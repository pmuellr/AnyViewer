const fs = require("fs")
const path = require("path")

const marked    = require("marked")
const highlight = require("highlight.js")

const AppDir     = path.dirname(path.dirname(path.dirname(__dirname)))
//const PluginName = path.basename(__dirname)

//------------------------------------------------------------------------------
exports.toHTML     = toHTML
exports.extensions = ["md", "markdown"]

//------------------------------------------------------------------------------
configureMarked()

//------------------------------------------------------------------------------
function toHTML(iVinyl, oVinyl, cb) {
  const output = []
  const basePath = escapeHTML(iVinyl.path)
  const mContent = fs.readFileSync(iVinyl.path, "utf8")
  const hContent = marked(mContent)

  output.push("<base href='" + escapeHTML(basePath) + "'>")
  output.push("<link rel='stylesheet' href='" + escapeHTML(__dirname) + "/github-markdown.css'>")
  output.push("<link rel='stylesheet' href='" + escapeHTML(AppDir) + "/app/node_modules/highlight.js/styles/github.css'>")
  output.push("<div class='markdown-body'>")
  output.push(hContent)
  output.push("</div>")

  fs.writeFileSync(oVinyl.path, output.join("\n"))

  cb(null)
}

//------------------------------------------------------------------------------
function escapeHTML(source) {
  return source
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

//------------------------------------------------------------------------------
function configureMarked() {
  const renderer = new marked.Renderer()

  marked.setOptions({
    renderer:     renderer,
    gfm:          true,
    tables:       true,
    breaks:       false,
    pedantic:     false,
    sanitize:     false,
    smartLists:   true,
    smartypants:  false,
    highlight:    highlightCode
  })
}

//------------------------------------------------------------------------------
function highlightCode(code, lang) {
  if (!lang || lang == "") {
    return highlight.highlightAuto(code).value
  }

  return highlight.highlightAuto(code, [lang]).value
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
