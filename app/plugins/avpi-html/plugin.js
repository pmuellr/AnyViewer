//const PluginName = path.basename(__dirname)

//------------------------------------------------------------------------------
exports.toHTML     = toHTML
exports.extensions = [".html"]

//------------------------------------------------------------------------------
function toHTML(iVinyl, oVinyl, cb) {
  oVinyl.path = iVinyl.path
  cb(null)
}
