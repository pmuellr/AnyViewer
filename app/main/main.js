'use strict'

const path = require('path')

const app = require('electron').app
const Menu = require('electron').Menu

const logger = require('./logger')(__filename)
const menus = require('./menus')
const prefs = require('./prefs')
const viewers = require('./viewers')

let IsReady = false
const FilesToOpen = []

const Prefs = prefs.create({
  window_width: 800,
  window_height: 600,
  window_zoomFactor: 1
})

// -----------------------------------------------------------------------------

process.on('uncaughtException', function (err) {
  logger.error('uncaught exception: ', err)
  logger.error('stack:')
  logger.error(err.stack)
})

// -----------------------------------------------------------------------------

exports.openFile = openFile

for (let i = 1; i < process.argv.length; i++) {
  openFile(process.argv[i])
}

app.on('window-all-closed', onAllWindowsClosed)
app.on('ready', onReady)
app.on('open-file', onOpenFile)

// -----------------------------------------------------------------------------
function openFile (fileName, title) {
  logger.info('opening file %s', fileName)

  if (!IsReady) {
    FilesToOpen.push(fileName)
    return
  }

  const viewer = viewers.createViewer(fileName, {
    prefs: Prefs,
    title: title
  })

  viewer.show()
}

// -----------------------------------------------------------------------------
function onOpenFile (event, fileName) {
  openFile(fileName)
}

// -----------------------------------------------------------------------------
function onReady () {
  IsReady = true

  for (let i = 0; i < FilesToOpen.length; i++) {
    openFile(FilesToOpen[i])
  }

  if (!viewers.hasViewers()) {
    setTimeout(openAboutFile, 2000)
  }

  const appMenu = menus.loadAppMenu()
  Menu.setApplicationMenu(appMenu)
}

// -----------------------------------------------------------------------------
function openAboutFile () {
  if (viewers.hasViewers()) return

  logger.info('opening about.md')

  openFile(path.join(__dirname, '../renderer/about.md'), 'About')
}

// -----------------------------------------------------------------------------
function onAllWindowsClosed () {
  app.quit()
}
