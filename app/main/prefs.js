'use strict'

const fs = require('fs')
const path = require('path')

const app = require('electron').app

const _ = require('underscore')
const mkdirp = require('mkdirp')

const pkg = require('../package.json')

const PrefsFileName = getPrefsFileName('preferences.json')

// -----------------------------------------------------------------------------
exports.create = create
exports.getPrefsBasePath = getPrefsBasePath

// -----------------------------------------------------------------------------
function create (defaultValues) { return new Prefs(defaultValues) }

// -----------------------------------------------------------------------------
class Prefs {

  // ----------------------------------------------------------------------------
  constructor (defaultValues) {
    defaultValues = defaultValues || {}

    this.data = _.clone(defaultValues)
    this.fileName = PrefsFileName

    if (!this.fileName) return
    if (!fs.existsSync(this.fileName)) return

    let contents

    try {
      contents = fs.readFileSync(this.fileName, 'utf8')
    } catch (e) {
      console.log('error reading preferences "' + this.fileName + '": ' + e)
      contents = {}
    }

    try {
      const fileData = JSON.parse(contents)
      this.data = _.defaults(fileData, this.data)
    } catch (e) {
      console.log('invalid JSON data in preferences "' + this.fileName + '": ' + e)
    }
  }

  // ----------------------------------------------------------------------------
  store () {
    if (!this.fileName) return

    try {
      const contents = JSON.stringify(this.data, null, 4)
      fs.writeFileSync(this.fileName, contents)
    } catch (e) {
      console.log('error writing preferences "' + this.fileName + '": ' + e)
    }
  }

}

// -----------------------------------------------------------------------------
function getPrefsFileName (baseName) {
  const prefsBasePath = getPrefsBasePath()

  try {
    mkdirp.sync(prefsBasePath)
  } catch (e) {
    return null
  }

  return path.join(prefsBasePath, baseName)
}

// -----------------------------------------------------------------------------
function getPrefsBasePath () {
  let basePath

  try {
    basePath = app.getPath('home')
  } catch (e) {
    basePath = process.env.HOME || process.env.USERPROFILE
  }

  return path.join(basePath, '.' + pkg.name)
}
