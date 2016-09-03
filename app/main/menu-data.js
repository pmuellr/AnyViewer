'use strict'

const app = require('electron').app
const Dialog = require('electron').dialog

const main = require('./main')

// -----------------------------------------------------------------------------
function setExports () {
  exports.template = getTemplate()
  exports.HandlerClass = HandlerClass
}

// -----------------------------------------------------------------------------
function getTemplate () {
  return [
    {
      label: 'AnyViewer',
      submenu: [
        { label: 'About AnyViewer', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide AnyViewer', accelerator: 'Command+H', selector: 'hide:' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', selector: 'hideOtherApplications:' },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', on_click: 'onQuit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { label: 'Open File...', accelerator: 'Command+O', on_click: 'onOpenFileMenu' },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Print...', accelerator: 'Command+P', on_click: 'onPrint' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        // { label: 'Copy',       accelerator: 'Command+C', selector: 'copy:' },
        // { label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:' }
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
//      { label: 'Back',            accelerator: 'Command+[',     on_click: 'onGoBack' },
//      { label: 'Forward',         accelerator: 'Command+]',     on_click: 'onGoForward' },
        { label: 'Reload', accelerator: 'Command+R', on_click: 'onReload' },
        { label: 'Enter Fullscreen', on_click: 'onEnterFullscreen' },
        { label: 'Actual Size', accelerator: 'Command+0', on_click: 'onZoomActualSize' },
        { label: 'Zoom In', accelerator: 'Command+=', on_click: 'onZoomIn' },
        { label: 'Zoom Out', accelerator: 'Command+-', on_click: 'onZoomOut' },
        { label: 'Toggle DevTools', accelerator: 'Alt+Command+I', on_click: 'onToggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:' },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' }
      ]
    }
  ]
}

// -----------------------------------------------------------------------------
class HandlerClass {

  // -----------------------------------
  constructor (menu) {
    this.menu = menu
  }

  // -----------------------------------
  onGoBack () {
    this.menu.browserWindow.webContents.goBack()
  }

  // -----------------------------------
  onGoForward () {
    this.menu.browserWindow.webContents.goForward()
  }

  // -----------------------------------
  onOpenFileMenu () {
    const options = {
      title: 'Open File',
      defaultPath: process.env.HOME,
      properties: [ 'openFile' ]
    }

    if (this.menu.browserWindow) {
      Dialog.showOpenDialog(this.menu.browserWindow, options, onOpenFileCB)
    } else {
      Dialog.showOpenDialog(options, onOpenFileCB)
    }

  // -----------------------------------
    function onOpenFileCB (fileNames) {
      if (!fileNames) return

      fileNames.forEach(function (fileName) {
        main.openFile(fileName)
      })
    }
  }

  // -----------------------------------
  onQuit () {
    app.quit()
  }

  // -----------------------------------
  onPrint () {
    if (!this.menu.browserWindow) return

    this.menu.browserWindow.webContents.print({printBackground: true})
  }

  // -----------------------------------
  onReload () {
    if (!this.menu.browserWindow) return

    this.menu.browserWindow.mdViewer.reload()
  }

  // -----------------------------------
  onEnterFullscreen () {
    if (!this.menu.browserWindow) return

    this.menu.browserWindow.setFullScreen(true)
  }

  // -----------------------------------
  onToggleDevTools () {
    if (!this.menu.browserWindow) return

    this.menu.browserWindow.toggleDevTools()
  }

  // -----------------------------------
  onZoomActualSize () {
    setZoomFactor(this.menu.viewer, 1)
  }

  // -----------------------------------
  onZoomIn () {
    const zoomFactor = getZoomFactor(this.menu.viewer)
    setZoomFactor(this.menu.viewer, zoomFactor * 1.2)
  }

  // -----------------------------------
  onZoomOut () {
    const zoomFactor = getZoomFactor(this.menu.viewer)
    setZoomFactor(this.menu.viewer, zoomFactor * 0.8)
  }
}

// -----------------------------------------------------------------------------
function getZoomFactor (viewer) {
  if (!viewer) return 0

  return viewer.zoomFactor
}

// -----------------------------------------------------------------------------
function setZoomFactor (viewer, zoomFactor) {
  if (!viewer) return

  viewer.runScript('window.AnyViewer.setZoomFactor(' + zoomFactor + ')')
  viewer.zoomFactor = zoomFactor

  viewer.prefs.data.window_zoomFactor = zoomFactor
  viewer.prefs.store()
}

// -----------------------------------------------------------------------------
setExports()
