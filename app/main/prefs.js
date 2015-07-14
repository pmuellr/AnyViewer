// Licensed under the Apache License. See footer for details.

"use strict"

const fs   = require("fs")
const path = require("path")

const app = require("app")

const _      = require("underscore")
const mkdirp = require("mkdirp")

const PrefsFileName = getPrefsFileName("preferences.json")

//------------------------------------------------------------------------------
exports.create       = create
exports.getPrefsPath = getPrefsPath

//------------------------------------------------------------------------------
function create(defaultValues) { return new Prefs(defaultValues) }

//------------------------------------------------------------------------------
class Prefs {

  //----------------------------------------------------------------------------
  constructor(defaultValues) {
    defaultValues = defaultValues || {}

    this.data     = _.clone(defaultValues)
    this.fileName = PrefsFileName

    if (!this.fileName) return
    if (!fs.existsSync(this.fileName)) return

    let contents

    try {
      contents = fs.readFileSync(this.fileName, "utf8")
    }
    catch (e) {
      console.log("error reading preferences '" + this.fileName + "': " + e)
      contents = {}
    }

    try {
      const fileData = JSON.parse(contents)
      this.data = _.defaults(fileData, this.data)
    }
    catch (e) {
      console.log("invalid JSON data in preferences '" + this.fileName + "': " + e)
    }
  }

  //----------------------------------------------------------------------------
  store() {
    if (!this.fileName) return

    try {
      const contents = JSON.stringify(this.data, null, 4)
      fs.writeFileSync(this.fileName, contents)
    }
    catch (e) {
      console.log("error writing preferences '" + this.fileName + "': " + e)
    }
  }

}

//------------------------------------------------------------------------------
function getPrefsFileName(baseName) {
  const userDataPath = getPrefsPath()

  try {
    mkdirp.sync(userDataPath)
  }
  catch(e) {
    return null
  }

  return path.join(userDataPath, baseName)
}

//------------------------------------------------------------------------------
function getPrefsPath() {
  try {
    return app.getPath("userData")
  }
  catch(e) {
    return getPrefsPathUnixy()
  }
}

//------------------------------------------------------------------------------
function getPrefsPathUnixy() {
  const homePath = process.env.HOME || process.env.USERPROFILE

  return path.join(homePath, ".mb-viewer")
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
