'use strict'

const util = require('util')
const path = require('path')

module.exports = createLogger

function createLogger (fileName) {
  return new Logger(fileName)
}

class Logger {
  constructor (fileName) {
    this._fileName = fileName
    this._baseName = path.basename(fileName)
  }

  debug () { this._log('DEBUG', [].slice.call(arguments)) }
  info () { this._log('INFO', [].slice.call(arguments)) }
  warn () { this._log('WARN', [].slice.call(arguments)) }
  error () { this._log('ERROR', [].slice.call(arguments)) }

  _log (type, args) {
    const msg = util.format.apply(util, [].slice.call(args))
    const date = new Date().toISOString().substr(11, 8)
    console.log(date + ' [' + type + '] ' + this._baseName + ' - ' + msg)
  }
}
