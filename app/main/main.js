// Licensed under the Apache License. See footer for details.

"use strict"

const app              = require("app")
const Menu             = require("menu")
const crashReporter    = require("crash-reporter")

const menus   = require("./menus")
const prefs   = require("./prefs")
const viewers = require("./viewers")

let   IsReady      = false
const FilesToOpen  = []

const Prefs = prefs.create({
  window_width:      800,
  window_height:     600,
  window_zoomFactor: 1
})

//------------------------------------------------------------------------------
exports.openFile = openFile

crashReporter.start()

for (let i=1; i<process.argv.length; i++) {
  openFile(process.argv[i])
}

app.on("window-all-closed", on_window_all_closed)
app.on("ready",             on_ready)
app.on("open-file",         on_open_file)

//------------------------------------------------------------------------------
function openFile(fileName, title) {
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

//------------------------------------------------------------------------------
function on_open_file(event, fileName) {
  openFile(fileName)
}

//------------------------------------------------------------------------------
function on_ready() {
  IsReady = true

  for (let i=0; i<FilesToOpen.length; i++) {
    openFile(FilesToOpen[i])
  }

  if (!viewers.hasViewers()) {
    setTimeout(openAboutFile, 2000)
  }

  const appMenu = menus.loadAppMenu()
  Menu.setApplicationMenu(appMenu)
}

//------------------------------------------------------------------------------
function openAboutFile() {
  if (viewers.hasViewers()) return

  openFile( __dirname + "/../renderer/about.md", "About")
}

//------------------------------------------------------------------------------
function on_window_all_closed() {
  app.quit()
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
