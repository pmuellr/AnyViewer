// Licensed under the Apache License. See footer for details.

"use strict"

const fs = require("fs")
const path = require("path")

const marked    = require("marked")
const highlight = require("highlight.js")

const utils = require("./utils")

const AppDir = path.dirname(__dirname)

//------------------------------------------------------------------------------
exports.render = render

//------------------------------------------------------------------------------
configureMarked()

//------------------------------------------------------------------------------
function render(iFile, oFile) {
  const output = []
  const basePath = utils.htmlEscape(iFile)
  const mContent = fs.readFileSync(iFile, "utf8")
  const hContent = marked(mContent)

  output.push("<base href='" + basePath + "'>")
  output.push("<link rel='stylesheet' href='" + AppDir + "/renderer/css/github-markdown.css'>")
  output.push("<link rel='stylesheet' href='" + AppDir + "/node_modules/highlight.js/styles/github.css'>")
  output.push("<script src='" + AppDir + "/node_modules/jquery/dist/jquery.min.js'></script>")
  output.push("<div class='markdown-body'>")
  output.push(hContent)
  output.push("</div>")

  fs.writeFileSync(oFile, output.join("\n"))
}

//------------------------------------------------------------------------------
function configureMarked() {
  const renderer = new marked.Renderer()

  renderer.link = renderLink

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
function renderLink(href, title, text) {
  var link    = JSON.stringify(href)
  var onclick = "window.mdViewer.openLink(" + link + ")"

  return "<a href='javascript:void(0)' onclick='" + onclick + "'>" + text + "</a>"
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
