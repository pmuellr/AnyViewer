'use strict'

const fs = require('fs')

// -----------------------------------------------------------------------------
// const PluginName = path.basename(__dirname)

exports.toHTML = toHTML
exports.extensions = 'txt'.split(' ')

// -----------------------------------------------------------------------------
function toHTML (iVinyl, oVinyl, cb) {
  const source = fs.readFileSync(iVinyl.path, 'utf8')
  const output = []

  output.push('<!doctype html>')
  output.push('<html>')
  output.push('<head>')
  output.push('<meta charset=\'UTF-8\'>')
  output.push('<style>')
  output.push('body, pre, xmp, tt, code {')
  output.push('  font-family: Source Code Pro, Menlo, Monaco, Courier')
  output.push('}')
  output.push('</style>')
  output.push('</head>')
  output.push('<body>')
  output.push('<pre>')
  output.push(escapeHTML(source))
  output.push('</pre>')
  output.push('</body>')
  output.push('</html>')

  fs.writeFileSync(oVinyl.path, output.join('\n'))
  cb(null)
}

// -----------------------------------------------------------------------------
function escapeHTML (source) {
  source = source
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return '<pre>' + source + '</pre>'
}
