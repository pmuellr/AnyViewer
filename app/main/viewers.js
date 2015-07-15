// Licensed under the Apache License. See footer for details.

"use strict"

const fs   = require("fs")
const path = require("path")

const tempfile         = require("tempfile")
const BrowserWindow    = require("browser-window")
const throttleDebounce = require("throttle-debounce")

const pkg      = require("../package.json")
const menus    = require("./menus")
const utils    = require("./utils")
const plugins  = require("./plugins")

//------------------------------------------------------------------------------
exports.createViewer               = createViewer
exports.hasViewers                 = hasViewers
exports.getViewers                 = getViewers
exports.getFocusedViewer           = getFocusedViewer
exports.getViewerFromBrowserWindow = getViewerFromBrowserWindow

//------------------------------------------------------------------------------
const ViewersOpen = new Map()

//------------------------------------------------------------------------------
function createViewer(fileName, options) {
  const fullFileName = getFullFileName(fileName)

  if (ViewersOpen.has(fullFileName)) {
    return ViewersOpen.get(fullFileName)
  }

  return new Viewer(fileName, options)
}

//------------------------------------------------------------------------------
function hasViewers() {
  return ViewersOpen.size != 0
}

//------------------------------------------------------------------------------
function getViewers() {
  return utils.ita(ViewersOpen.values())
}

//------------------------------------------------------------------------------
function getFocusedViewer() {
  const browserWindow = BrowserWindow.getFocusedWindow()
  if (!browserWindow) return null

  return getViewerFromBrowserWindow(browserWindow)
}

//------------------------------------------------------------------------------
function getViewerFromBrowserWindow(browserWindow) {
  return browserWindow.mdViewer
}

//------------------------------------------------------------------------------
class Viewer {

  //----------------------------------------------------------------------------
  constructor(fileName, options) {
    this.fileName     = fileName
    this.prefs        = options.prefs
    this.title        = options.title

    this.fullFileName = getFullFileName(fileName)
    this.relFileName  = getRelFileName(fileName)
    this.htmlFileName = getHtmlFileName(fileName)
    this.zoomFactor    = this.prefs.data.window_zoomFactor

    this.openFile()
  }

  //------------------------------------------------------------------------------
  openFile() {
    // app.addRecentDocument(this.fullFileName)

    const iFile = this.fullFileName
    const oFile = this.htmlFileName
    const prefs = this.prefs
    const self  = this

    plugins.renderHTML(iFile, oFile, prefs, function(err) {
      if (err) return

      self.open2()
    })
  }

  //------------------------------------------------------------------------------
  openFile2() {
    const opts = {
      width:              this.prefs.data.window_width,
      height:             this.prefs.data.window_height,
      preload:            path.join(__dirname, "../renderer/modules/renderer.js"),
      "node-integration": false,
      "zoom-factor":      this.zoomFactor
    }

    if (this.title)            { opts.title = this.title }
    else if (this.relFileName) { opts.title = this.relFileName }
    else                       { opts.title = pkg.productName }

    const browserWindow = this.browserWindow = new BrowserWindow(opts)
    browserWindow.mdViewer = this

    ViewersOpen.set(this.fullFileName, this)

    const windowMenu = menus.loadWindowMenu(this)
    browserWindow.setMenu(windowMenu)

    browserWindow.loadUrl("file://" + this.htmlFileName)

    if (this.fullFileName) {
      browserWindow.setRepresentedFilename(this.fullFileName)
    }

    const viewer = this

    const onResizeDebounced = debounce(1000, function() { viewer.onResize() })

    browserWindow.on("close",  function() { viewer.onClose() })
    browserWindow.on("closed", function() { viewer.onClosed() })
    browserWindow.on("resize", function() { onResizeDebounced() })

    browserWindow.webContents.on("did-finish-load", function() {
      viewer.didFinishLoad()
    })

    const self = this

    fs.watchFile(this.fullFileName, {interval: 1000}, function(curr, prev) {
      self.fileModified(curr, prev)
    })
  }

  //------------------------------------------------------------------------------
  reload() {
    markdown.render(this.fullFileName, this.htmlFileName)

    const hContent = fs.readFileSync(this.htmlFileName, "utf8")

    // this.browserWindow.reload()
    this.runScript("window.AnyViewer.reload(" + JSON.stringify(hContent) + ")")
  }

  //------------------------------------------------------------------------------
  fileModified(curr, prev) {
    if (curr.mtime == prev.mtime) return

    this.reload()
  }

  //----------------------------------------------------------------------------
  didFinishLoad() {
  }

  //----------------------------------------------------------------------------
  runScript(script) {
    this.browserWindow.webContents.executeJavaScript(script)
  }

  //----------------------------------------------------------------------------
  show() {
    this.browserWindow.show()
  }

  //----------------------------------------------------------------------------
  onClose() {
  }

  //----------------------------------------------------------------------------
  onClosed() {
    ViewersOpen.delete(this.fileName)
    fs.unlinkSync(this.htmlFileName)
  }

  //----------------------------------------------------------------------------
  onResize() {
    const size = this.browserWindow.getSize()

    this.prefs.data.window_width  = size[0]
    this.prefs.data.window_height = size[1]
    this.prefs.store()
  }

}

//------------------------------------------------------------------------------
function debounce(ms, fn) {
  return throttleDebounce.debounce(ms, fn)
}

//------------------------------------------------------------------------------
function getHtmlFileName(fileName) {
  if (!fileName) return null

  const htmlTemp = tempfile(".AnyViewer.html")

  return htmlTemp
}

//------------------------------------------------------------------------------
function getFullFileName(fileName) {
  if (!fileName) return null

  return path.resolve(fileName)
}

//------------------------------------------------------------------------------
function getRelFileName(fileName) {
  if (!fileName) return null

  const home = process.env.HOME
  if (!home) return fileName

  fileName = path.resolve(fileName)

  const relFileName = path.relative(home, fileName)
  if (relFileName[0] == ".") return fileName

  return path.join("~", relFileName)
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
