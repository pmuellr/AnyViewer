'use strict'

const fs = require('fs')
const path = require('path')

const _ = require('underscore')

const utils = require('./utils')
const prefs = require('./prefs')

// -----------------------------------------------------------------------------
exports.renderHTML = renderHTML

const Plugins = new Map()
const Extensions = new Map()

// -----------------------------------------------------------------------------
function renderHTML (iVinyl, oVinyl, userPrefs, cb) {
  cb = utils.onlyCallOnce(cb)

  initializeIfRequired()

  const exts = getExtensions(iVinyl)

  let plugin
  for (let i = 0; i < exts.length; i++) {
    plugin = Extensions.get(exts[i])
    if (plugin) break
  }

  if (!plugin) {
    const errMessage = (exts.length === 1
      ? 'no plugin for extension ' + exts[0]
      : 'no plugin for extensions ' + exts.join(', ')
    )

    const err = new Error(errMessage)
    err.longMessage =
      'There is no plugin installed that can handle the extensions `' +
      exts.join(', ') +
      '`'

    throw err
  }

  try {
    plugin.toHTML(iVinyl, oVinyl, cb)
  } catch (e) {
    return cb(e)
  }

  cb(null)
}

// -----------------------------------------------------------------------------
function getExtensions (vinyl) {
  const regex = /^[^\.]*?\.(.*)/
  const match = vinyl.basename.match(regex)
  if (!match) return [ '' ]

  const result = []

  const parts = match[1].toLowerCase().split('.')
  while (parts.length > 0) {
    result.push(parts.join('.'))
    parts.shift()
  }

  return result
}

// -----------------------------------------------------------------------------
let Initialized = false
function initializeIfRequired () {
  if (Initialized) return
  Initialized = true

  loadPlugins('core', path.join(__dirname, '..', 'plugins'))
  loadPlugins('user', path.join(prefs.getPrefsBasePath(), 'plugins'))
}

// -----------------------------------------------------------------------------
function loadPlugins (type, dir) {
  let entries
  try {
    entries = fs.readdirSync(dir)
  } catch (e) {
    console.log('error reading directory `' + dir + '`: ' + e)
    return
  }

  for (let entry of entries) {
    let stat
    const entryName = path.join(dir, entry)

    try {
      stat = fs.statSync(entryName)
    } catch (e) {
      console.log('error stating plugin thing `' + entryName + '`: ' + e)
      continue
    }

    if (!stat.isDirectory()) continue

    let pkgJSON
    const pkgName = path.join(dir, entry, 'package.json')

    try {
      pkgJSON = fs.readFileSync(pkgName, 'utf8')
    } catch (e) {
      console.log('error reading plugin package `' + pkgName + '`: ' + e)
      continue
    }

    let pkg = null
    try {
      pkg = JSON.parse(pkgJSON)
    } catch (e) {
      console.log('error parsing plugin package `' + pkgName + '`: ' + e)
      continue
    }

    if (!pkg) {
      console.log('empty package `' + pkgName + '`')
      continue
    }

    if (!pkg.AnyViewer) {
      console.log('package does not have an AnyViewer property `' + pkgName + '`')
      continue
    }

    if (!pkg.AnyViewer.plugin) {
      console.log('package does not have an AnyViewer.plugin property `' + pkgName + '`')
      continue
    }

    let plugin = null
    let pluginName = path.join(dir, entry, pkg.AnyViewer.plugin)

    try {
      plugin = require(pluginName)
    } catch (e) {
      console.log('error loading plugin `' + pluginName + '`: ' + e)
      continue
    }

    if (!plugin) {
      console.log('plugin exports nothing `' + pluginName + '`:')
      continue
    }

    if (!_.isFunction(plugin.toHTML)) {
      console.log('plugin does not export a toHTML() function `' + pluginName + '`')
      continue
    }

    if (!_.isArray(plugin.extensions)) {
      console.log('plugin does not export an extensions array `' + pluginName + '`')
      continue
    }

    Plugins.set(entry, plugin)

    for (let ext of plugin.extensions) {
      Extensions.set(ext, plugin)
    }
  }
}
