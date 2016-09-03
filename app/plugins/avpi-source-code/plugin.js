'use strict'

const fs = require('fs')
const path = require('path')

const highlight = require('highlight.js')

// -----------------------------------------------------------------------------
const AppDir = path.dirname(path.dirname(path.dirname(__dirname)))
const Extensions = initExtensions()
// const PluginName = path.basename(__dirname)

exports.toHTML = toHTML
exports.extensions = Extensions.slice()

// -----------------------------------------------------------------------------
function toHTML (iVinyl, oVinyl, cb) {
  // console.log(PluginName + '.toHTML(', iVinyl, ',', oVinyl, ')')
  const extName = iVinyl.extname.slice(1).toLowerCase()
  const source = getSource(iVinyl)
  // console.log('  extName: ', extName)

  const output = []
  const style = 'monokai'
  output.push('<!doctype html>')
  output.push('<html>')
  output.push('<head>')
  output.push('<meta charset=\'UTF-8\'>')
  output.push('<link rel="stylesheet" href="' + AppDir + '/app/node_modules/highlight.js/styles/' + style + '.css">')
  output.push('<style>')
  output.push('body, pre, xmp, tt, code {')
  output.push(' font-family: Source Code Pro, Menlo, Monaco, Courier, monospace;')
  output.push('}')
  output.push('pre {')
  output.push(' margin: 0em;')
  output.push('}')
  output.push('</style>')
  output.push('</head>')
  output.push('<body class=hljs>')
  output.push('<pre>')
  output.push(highlight.highlight(extName, source, true).value)
  output.push('</pre>')
  output.push('</body>')
  output.push('</html>')

  fs.writeFileSync(oVinyl.path, output.join('\n'))
  cb(null)
}

// -----------------------------------------------------------------------------
function getSource (vinyl) {
  return fs.readFileSync(vinyl.path, 'utf8')
}

// -----------------------------------------------------------------------------
/*
function escapeHTML(source) {
  source = source
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return '<pre>' + source + '</pre>'
}
*/

// -----------------------------------------------------------------------------
function initExtensions () {
  const result = []
  const languages = highlight.listLanguages()
  const skipExtensions = new Set('md markdown'.split(' '))

  for (let language of languages) {
    if (skipExtensions.has(language)) continue

    result.push(language)

    const lang = highlight.getLanguage(language)
    if (lang.aliases) {
      for (let alias of lang.aliases) {
        if (skipExtensions.has(alias)) continue

        result.push(alias)
      }
    }
  }

  result.sort()
  return result
}

// -----------------------------------------------------------------------------
if (require.main === module) {
  console.log('this module supports the following language extensions:')
  console.log(Extensions.join(' '))
}
