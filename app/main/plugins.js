// Licensed under the Apache License. See footer for details.

"use strict"

const fs = require("fs")

const _     = require("underscore")
const vinyl = require("vinyl")

const utils = require("./utils")

//------------------------------------------------------------------------------
exports.renderHTML = renderHTML

const Plugins    = new Map()
const Extensions = new Map()

//------------------------------------------------------------------------------
function renderHTML(iFile, oFile, prefs, cb) {
  const cb = utils.callOnce(cb)

  initializeIfRequired(prefs)

  const iVinyl = vinyl({path: iFile})
  const oVinyl = vinyl({path: oFile})

  const plugin = Extensions(iVinyl.extname)
  if (!plugin) return cb(new Error("no plugin for extension " iVinyl.extname))

  try { plugin.toHTML(iVinyl, oVinyl, cb) }
  catch (e) { return cb(e) }

  cb(null)
}

//------------------------------------------------------------------------------
let Initialized = false
function initializeIfRequired(prefs) {
  if (Initialized) return
  Initialized = true

  loadPlugins(__dirname + "/../plugins")
  loadPlugins(prefs.getPrefsPath() + "/plugins")
}

//------------------------------------------------------------------------------
function loadPlugins(dir) {
  const entries = fs.readdirSync(dir)

  for (let entry of entries) {
    const stat = fs.statSync(dir + "/" + entry)
    if (!stat.isDirectory()) continue

    const pFile = dir + "/" + entry + "/package.json"
    const pJSON = fs.readFileSync(pFile, "utf8")

    let pkg = null
    try { pkg = JSON.parse(pJSON) }
    catch (e) {}

    if (!pkg) continue
    if (!pkg.AnyViewer) continue
    if (!pkg.AnyViewer.plugin) continue

    let plugin = null
    try { plugin = require(dir + "/" + entry + "/" + pkg.AnyViewer.plugin) }
    catch (e) {}

    if (!plugin) continue
    if (!_.isFunction(plugin.toHTML)) continue
    if (!_.isArray(plugin.extensions)) continue

    Plugins.set(entry, plugin)

    for (let ext of plugin.extensions) {
      Extensions.set(ext, plugin)
    }
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
