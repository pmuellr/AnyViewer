'use strict'

const Menu = require('electron').Menu

const _ = require('underscore')

const viewers = require('./viewers')
const utils = require('./utils')
const MenuData = require('./menu-data')

// -----------------------------------------------------------------------------
exports.loadAppMenu = loadAppMenu
exports.loadWindowMenu = loadWindowMenu

// -----------------------------------------------------------------------------
function loadAppMenu () {
  const menuHandler = new AppMenuHandler()
  return menuHandler.menu
}

// -----------------------------------------------------------------------------
function loadWindowMenu (viewer) {
  const menuHandler = new WindowMenuHandler(viewer)
  return menuHandler.menu
}

// -----------------------------------------------------------------------------
class MenuHandler {

  // ----------------------------------------------------------------------------
  init () {
    this.createMenu()
  }

  // ----------------------------------------------------------------------------
  createMenu () {
    const template = utils.clone(MenuData.template)
    const handler = new MenuData.HandlerClass(this)
    setMenuHandlers(template, handler)

    this.menu = Menu.buildFromTemplate(template)
  }

}

// -----------------------------------------------------------------------------
class WindowMenuHandler extends MenuHandler {
  // ----------------------------------------------------------------------------
  constructor (viewer) {
    super()

    this.viewer = viewer
    this.browserWindow = viewer.browserWindow

    this.init()
  }
}

// -----------------------------------------------------------------------------
class AppMenuHandler extends MenuHandler {
  // ----------------------------------------------------------------------------
  constructor () {
    super()

    this.init()
  }

  // ----------------------------------------------------------------------------
  get viewer () {
    return viewers.getFocusedViewer()
  }

  // ----------------------------------------------------------------------------
  get browserWindow () {
    const viewer = this.viewer
    if (!viewer) return null

    return viewer.browserWindow
  }
}

// -----------------------------------------------------------------------------
function setMenuHandlers (menuData, handler) {
  if (!menuData) return

  if (_.isString(menuData)) return
  if (_.isNumber(menuData)) return
  if (_.isBoolean(menuData)) return

  if (_.isArray(menuData)) {
    for (let i = 0; i < menuData.length; i++) {
      setMenuHandlers(menuData[i], handler)
    }
    return
  }

  for (let propName in menuData) {
    const propVal = menuData[propName]

    if (propName === 'on_click') {
      menuData.click = getMenuHandlerMethod(handler, propVal)
    } else {
      setMenuHandlers(propVal, handler)
    }
  }
}

// -----------------------------------------------------------------------------
function getMenuHandlerMethod (handler, name) {
  return function () {
    const fn = handler[name]
    const args = _.toArray(arguments)

    if (fn == null) {
      console.log('click handler method "' + name + '" not found.')
      return
    }

    fn.apply(handler, args)
  }
}
