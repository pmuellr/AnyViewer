// Licensed under the Apache License. See footer for details.

"use strict"

const highlight = require("highlight.js")

//------------------------------------------------------------------------------
const Extensions = initExtensions()
const AppDir     = path.dirname(path.dirname(path.dirname(__dirname)))

exports.toHTML     = toHTML
exports.extensions = Extensions.slice()

//------------------------------------------------------------------------------
function toHTML(vinylIn, vinylOut, cb) {
  const extName = vinylIn.extname.slice(1).toLowerCase()
  const lang    = highlight.getLanguage(extName)
  const source  = getSource(vinylIn)

  const output = []
  output.push("<link rel='stylesheet' href='" + AppDir + "/node_modules/highlight.js/styles/github.css'>")

  if (lang) {
    output.push(highlight(lang, source, true).value)
  }
  else {
    output.push(escapeHTML(source))
  }

  fs.writeFileSync(vinylOut.path, output.join("\n"))
  cb(null)
}

//------------------------------------------------------------------------------
function getSource(vinyl) {
  return fs.readFileSync(vinyl.path, "utf8")
}

//------------------------------------------------------------------------------
function escapeHTML(source) {
  source = source
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return "<pre>" + source + "</pre>"
}

//------------------------------------------------------------------------------
function initExtensions() {
  const result = []
  const languages = highlight.listLanguages()

  for (let language of languages) {
    if (language == "markdown") continue

    result.push("." + language)

    const lang = highlight.getLanguage(language)
    if (lang.aliases) {
      for (let alias of lang.aliases) {
        if (language == "html") continue
        
        result.push("." + alias)
      }
    }
  }

  result.sort()
  return result
}

//------------------------------------------------------------------------------
if (require.main == module) {
  console.log("this module supports the following language extensions:")
  console.log(Extensions.join(" "))
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
