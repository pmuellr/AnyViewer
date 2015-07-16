// Licensed under the Apache License. See footer for details.

"use strict"

const fs   = require("fs")
const path = require("path")

const _     = require("underscore")

const utils = require("./utils")

//------------------------------------------------------------------------------
exports.renderHTML = renderHTML

const Plugins    = new Map()
const Extensions = new Map()

//------------------------------------------------------------------------------
function renderHTML(iVinyl, oVinyl, prefs, cb) {
  cb = utils.onlyCallOnce(cb)

  initializeIfRequired()

  const plugin = Extensions.get(iVinyl.extname)
  if (!plugin) pitch("no plugin for extension " + iVinyl.extname)

  try {
    plugin.toHTML(iVinyl, oVinyl, cb)
  }
  catch(e) {
    return cb(e)
  }

  cb(null)
}

//------------------------------------------------------------------------------
let Initialized = false
function initializeIfRequired() {
  if (Initialized) return
  Initialized = true

  loadPlugins("core", path.join(__dirname, "..", "plugins"))
  loadPlugins("user", path.join(require("./prefs").getPrefsPath(), "plugins"))
}

//------------------------------------------------------------------------------
function loadPlugins(type, dir) {
  let entries
  try {
    entries = fs.readdirSync(dir)
  }
  catch (e) {
    console.log("error reading directory `" + dir + "`: " + e)
    return
  }

  for (let entry of entries) {
    let   stat
    const entryName = path.join(dir, entry)

    try {
      stat = fs.statSync(entryName)
    }
    catch (e) {
      console.log("error stat'ing plugin thing `" + entryName + "`: " + e)
      continue
    }

    if (!stat.isDirectory()) continue

    let   pkgJSON
    const pkgName = path.join(dir, entry, "package.json")

    try {
      pkgJSON = fs.readFileSync(pkgName, "utf8")
    }
    catch (e) {
      console.log("error reading plugin package `" + pkgName + "`: " + e)
      continue
    }

    let pkg = null
    try {
      pkg = JSON.parse(pkgJSON)
    }
    catch (e) {
      console.log("error parsing plugin package `" + pkgName + "`: " + e)
      continue
    }

    if (!pkg) {
      console.log("empty package `" + pkgName + "`")
      continue
    }

    if (!pkg.AnyViewer) {
      console.log("package does not have an AnyViewer property `" + pkgName + "`")
      continue
    }

    if (!pkg.AnyViewer.plugin) {
      console.log("package does not have an AnyViewer.plugin property `" + pkgName + "`")
      continue
    }

    let plugin     = null
    let pluginName = path.join(dir, entry, pkg.AnyViewer.plugin)

    try {
      plugin = require(pluginName)
    }
    catch (e) {
      console.log("error loading plugin `" + pluginName + "`: " + e)
      continue
    }

    if (!plugin) {
      console.log("plugin exports nothing `" + pluginName + "`:")
      continue
    }

    if (!_.isFunction(plugin.toHTML))  {
      console.log("plugin does't export a toHTML() function `" + pluginName + "`")
      continue
    }

    if (!_.isArray(plugin.extensions)) {
      console.log("plugin does't export an extensions array `" + pluginName + "`")
      continue
    }

    Plugins.set(entry, plugin)

    for (let ext of plugin.extensions) {
      Extensions.set(ext, plugin)
    }
  }
}

function pitch(string) {
  throw new Error(string)
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
