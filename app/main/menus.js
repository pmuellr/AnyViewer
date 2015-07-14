// Licensed under the Apache License. See footer for details.

"use strict"

const Menu          = require("menu")

const _ = require("underscore")

const viewers  = require("./viewers")
const utils    = require("./utils")
const MenuData = require("./menu-data")

//------------------------------------------------------------------------------
exports.loadAppMenu    = loadAppMenu
exports.loadWindowMenu = loadWindowMenu

//------------------------------------------------------------------------------
function loadAppMenu() {
  const menuHandler = new AppMenuHandler()
  return menuHandler.menu
}

//------------------------------------------------------------------------------
function loadWindowMenu(viewer) {
  const menuHandler = new WindowMenuHandler(viewer)
  return menuHandler.menu
}

//------------------------------------------------------------------------------
class MenuHandler {

  //----------------------------------------------------------------------------
  constructor() {}

  //----------------------------------------------------------------------------
  init() {
    this.createMenu()
  }

  //----------------------------------------------------------------------------
  createMenu() {
    const template = utils.clone(MenuData.template)
    const handler  = new MenuData.HandlerClass(this)
    setMenuHandlers(template, handler)

    this.menu = Menu.buildFromTemplate(template)
  }

}

//------------------------------------------------------------------------------
class WindowMenuHandler extends MenuHandler {
  //----------------------------------------------------------------------------
  constructor(viewer) {
    super()

    this.viewer        = viewer
    this.browserWindow = viewer.browserWindow

    this.init()
  }
}

//------------------------------------------------------------------------------
class AppMenuHandler extends MenuHandler {
  //----------------------------------------------------------------------------
  constructor() {
    super()

    this.init()
  }

  //----------------------------------------------------------------------------
  get viewer() {
    return viewers.getFocusedViewer()
  }

  //----------------------------------------------------------------------------
  get browserWindow() {
    const viewer = this.viewer
    if (!viewer) return null

    return viewer.browserWindow
  }
}

//------------------------------------------------------------------------------
function setMenuHandlers(menuData, handler) {
  if (!menuData) return

  if (_.isString(menuData)) return
  if (_.isNumber(menuData)) return
  if (_.isBoolean(menuData)) return

  if (_.isArray(menuData)) {
    for (let i=0; i<menuData.length; i++) {
      setMenuHandlers(menuData[i], handler)
    }
    return
  }

  for (let propName in menuData) {
    const propVal = menuData[propName]

    if (propName == "on_click") {
      menuData.click = getMenuHandlerMethod(handler, propVal)
    }

    else {
      setMenuHandlers(propVal, handler)
    }
  }

}

//------------------------------------------------------------------------------
function getMenuHandlerMethod(handler, name) {
  return function() {
    const fn   = handler[name]
    const args = _.toArray(arguments)

    if (fn == null) {
      console.log("click handler method '" + name + "' not found.")
      return
    }

    fn.apply(handler, args)
  }
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
