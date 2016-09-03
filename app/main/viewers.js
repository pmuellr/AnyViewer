'use strict'

const fs = require('fs')
const URL = require('url')
const path = require('path')

const shell = require('electron').shell
const BrowserWindow = require('electron').BrowserWindow

const Vinyl = require('vinyl')
const tempfile = require('tempfile')
const throttleDebounce = require('throttle-debounce')

const pkg = require('../package.json')
const logger = require('./logger')(__filename)
const menus = require('./menus')
const utils = require('./utils')
const plugins = require('./plugins')

// -----------------------------------------------------------------------------
exports.createViewer = createViewer
exports.hasViewers = hasViewers
exports.getViewers = getViewers
exports.getFocusedViewer = getFocusedViewer
exports.getViewerFromBrowserWindow = getViewerFromBrowserWindow

// -----------------------------------------------------------------------------
const ViewersOpen = new Map()

// -----------------------------------------------------------------------------
function createViewer (fileName, options) {
  logger.info('creating viewer for %s', fileName)

  const fullFileName = getFullFileName(fileName)

  if (ViewersOpen.has(fullFileName)) {
    return ViewersOpen.get(fullFileName)
  }

  return new Viewer(fileName, options)
}

// -----------------------------------------------------------------------------
function hasViewers () {
  return ViewersOpen.size !== 0
}

// -----------------------------------------------------------------------------
function getViewers () {
  return utils.ita(ViewersOpen.values())
}

// -----------------------------------------------------------------------------
function getFocusedViewer () {
  const browserWindow = BrowserWindow.getFocusedWindow()
  if (!browserWindow) return null

  return getViewerFromBrowserWindow(browserWindow)
}

// -----------------------------------------------------------------------------
function getViewerFromBrowserWindow (browserWindow) {
  return browserWindow.mdViewer
}

// -----------------------------------------------------------------------------
class Viewer {

  // ----------------------------------------------------------------------------
  constructor (fileName, options) {
    logger.info('creating Viewer for %s', fileName)

    this.fileName = fileName
    this.prefs = options.prefs
    this.title = options.title

    this.fullFileName = getFullFileName(fileName)
    this.relFileName = getRelFileName(fileName)
    this.htmlFileName = getHtmlFileName(fileName)
    this.zoomFactor = this.prefs.data.window_zoomFactor

    this.renderFile(this.openFile.bind(this))
  }

  // -----------------------------------------------------------------------------
  renderFile (next) {
    logger.info('rendering file %s', this.fileName)

    const iVinyl = new Vinyl({path: this.fullFileName})
    const oVinyl = new Vinyl({path: this.htmlFileName})
    const prefs = this.prefs

    try {
      plugins.renderHTML(iVinyl, oVinyl, prefs, next)
    } catch (e) {
      logger.error('error rendering file: ', e)
    }
  }

  // -----------------------------------------------------------------------------
  openFile (err) {
    if (err) {
      logger.error('error trying to open file' + this.fullFileName + ': ' + err)
    }

    try {
      return this.openFile_(err)
    } catch (err) {
      logger.error('error opening file' + this.fullFileName + ': ' + err)
    }
  }

  // -----------------------------------------------------------------------------
  openFile_ (err) {
    logger.info('opening file %s', this.fullFileName)
    const opts = {
      width: this.prefs.data.window_width,
      height: this.prefs.data.window_height,
      webPreferences: {
        nodeIntegration: false,
        zoomFactor: this.zoomFactor,
        preload: path.join(__dirname, '../renderer/modules/renderer.js')
      }
    }

    if (this.title) {
      opts.title = this.title
    } else if (this.relFileName) {
      opts.title = this.relFileName
    } else {
      opts.title = pkg.productName
    }

    const browserWindow = this.browserWindow = new BrowserWindow(opts)
    browserWindow.mdViewer = this

    ViewersOpen.set(this.fullFileName, this)

    const windowMenu = menus.loadWindowMenu(this)
    browserWindow.setMenu(windowMenu)

    browserWindow.loadURL('file://' + this.htmlFileName)

    if (this.fullFileName) {
      browserWindow.setRepresentedFilename(this.fullFileName)
    }

    const viewer = this

    const onResizeDebounced = debounce(1000, function () { viewer.onResize() })

    browserWindow.on('close', function () { viewer.onClose() })
    browserWindow.on('closed', function () { viewer.onClosed() })
    browserWindow.on('resize', function () { onResizeDebounced() })

    browserWindow.webContents.on('did-finish-load', function () {
      if (err) viewer.loadFileContent(err)

      viewer.didFinishLoad()
    })

    const self = this

    fs.watchFile(this.fullFileName, {interval: 1000}, function (curr, prev) {
      self.fileModified(curr, prev)
    })

    logger.info('done opening file %s', this.fileName)
  }

  // -----------------------------------------------------------------------------
  loadFileContent (err) {
    logger.info('loadFileContent(' + err + ')')

    let content = null

    if (!err) {
      content = fs.readFileSync(this.htmlFileName, 'utf8')
    } else {
      content = []

      content.push('<h1>Woops, error processing file: ' + utils.htmlEscape(err.message) + '</h1>')
      content.push('<p>file processed: "<tt>' + utils.htmlEscape(this.fullFileName) + '</tt>"')

      if (err.longMessage) {
        content.push('<p>' + utils.htmlEscape(err.longMessage))
      } else {
        content.push('<pre>' + utils.htmlEscape(err.stack) + '</pre>')
      }

      content = content.join('\n')
    }

    content = JSON.stringify(content)
    this.runScript('window.AnyViewer.reload(' + content + ')')
  }

  // -----------------------------------------------------------------------------
  reload () {
    this.renderFile(this.loadFileContent.bind(this))
  }

  // -----------------------------------------------------------------------------
  fileModified (curr, prev) {
    if (curr.mtime === prev.mtime) return

    this.reload()
  }

  // ----------------------------------------------------------------------------
  didFinishLoad () {
    this.browserWindow.webContents.on('will-navigate', function (e, url) {
      e.preventDefault()

      const urlp = URL.parse(url)

      if ((urlp.protocol === 'http:') || (urlp.protocol === 'https:')) {
        shell.openExternal(url)
      } else if (urlp.protocol === 'file:') {
        shell.openItem(urlp.path)
      }
    })
  }

  // ----------------------------------------------------------------------------
  runScript (script) {
    logger.info('runScript()')
    if (!this.browserWindow) return

    this.browserWindow.webContents.executeJavaScript(script)
  }

  // ----------------------------------------------------------------------------
  show () {
    if (!this.browserWindow) return

    this.browserWindow.show()
  }

  // ----------------------------------------------------------------------------
  onClose () {
  }

  // ----------------------------------------------------------------------------
  onClosed () {
    ViewersOpen.delete(this.fileName)

    fs.unwatchFile(this.fullFileName)

    try {
      fs.unlinkSync(this.htmlFileName)
    } catch (e) {
      // console.log('error deleting file `' + this.htmlFileName + '`: ' + e)
    }

    this.browserWindow = null
  }

  // ----------------------------------------------------------------------------
  onResize () {
    if (!this.browserWindow) return

    const size = this.browserWindow.getSize()

    this.prefs.data.window_width = size[0]
    this.prefs.data.window_height = size[1]
    this.prefs.store()
  }

}

// -----------------------------------------------------------------------------
function debounce (ms, fn) {
  return throttleDebounce.debounce(ms, fn)
}

// -----------------------------------------------------------------------------
function getHtmlFileName (fileName) {
  if (!fileName) return null

  const htmlTemp = tempfile('.AnyViewer.html')

  return htmlTemp
}

// -----------------------------------------------------------------------------
function getFullFileName (fileName) {
  if (!fileName) return null

  return path.resolve(fileName)
}

// -----------------------------------------------------------------------------
function getRelFileName (fileName) {
  if (!fileName) return null

  const home = process.env.HOME
  if (!home) return fileName

  fileName = path.resolve(fileName)

  const relFileName = path.relative(home, fileName)
  if (relFileName[0] === '.') return fileName

  return path.join('~', relFileName)
}
