const fs = require("fs")
const path = require("path")

const marked    = require("marked")
const highlight = require("highlight.js")

const AppDir = path.dirname(path.dirname(path.dirname(__dirname)))

//------------------------------------------------------------------------------
exports.toHTML     = toHTML
exports.extensions = [".md", ".markdown"]

//------------------------------------------------------------------------------
configureMarked()

//------------------------------------------------------------------------------
function toHTML(vinylIn, vinylOut, cb) {
  const output = []
  const basePath = escapeHTML(vinylIn.path)
  const mContent = fs.readFileSync(vinylIn.path, "utf8")
  const hContent = marked(mContent)

  output.push("<base href='" + escapeHTML(basePath) + "'>")
  output.push("<link rel='stylesheet' href='" + escapeHTML(__dirname) + "github-markdown.css'>")
  output.push("<link rel='stylesheet' href='" + escapeHTML(AppDir) + "/node_modules/highlight.js/styles/github.css'>")
  output.push("<div class='markdown-body'>")
  output.push(hContent)
  output.push("</div>")

  fs.writeFileSync(oFile, output.join("\n"))

  cb(null)
}

//------------------------------------------------------------------------------
function escapeHTML(source) {
  return source
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
