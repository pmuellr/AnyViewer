# Licensed under the Apache License. See footer for details.

require "cakex"

plist = require "plist"

pkg  = require "./package.json"
ePkg = require "./node_modules/electron-prebuilt/package.json"

#-------------------------------------------------------------------------------
task "watch",     "watch for source file changes, build", -> taskWatch()
task "build",     "run a build",                          -> taskBuild()
task "buildIcns", "build the OS X icns file",             -> taskBuildIcns()

WatchSpec = "app/**/* .eslintrc package.json"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
taskBuild = ->
  log "build starting."

  log "linting ..."
  eslint "app", {silent: true}, (code, output) =>
    console.log(output)

    platArch = "#{process.platform}-#{process.arch}"

    if platArch is "darwin-x64"
      mkdir "-p", "build/#{platArch}"

      build_darwin_x64 "build/#{platArch}", "AnyViewer-build"
      build_darwin_x64 "build/#{platArch}", "AnyViewer"

      origDir = pwd()
      log "building distribution archive"
      cd "build/#{platArch}"
      exec "zip -q -y -r ../AnyViewer-#{platArch}-#{pkg.version}.zip AnyViewer.app"
      cd origDir

    if platArch is "linux-x64"
      mkdir "-p", "build/#{platArch}"

      build_linux_x64 "build/#{platArch}", "AnyViewer-build"
      build_linux_x64 "build/#{platArch}", "AnyViewer"

      origDir = pwd()
      log "building distribution archive"
      cd "build/#{platArch}"
      exec "zip -q -y -r ../AnyViewer-#{platArch}-#{pkg.version}.zip AnyViewer"
      cd origDir

    log "build done."

#-------------------------------------------------------------------------------
watchIter = ->
  taskBuild()

#-------------------------------------------------------------------------------
taskWatch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  watch
    files: "Cakefile"
    run: (file) ->
      return unless file == "Cakefile"
      log "Cakefile changed, exiting"
      exit 0

#-------------------------------------------------------------------------------
build_app = (oDir) ->
  oDir = "#{oDir}/app"
  mkdir oDir

  cp "-R", "app/*", oDir

  pushd oDir
  exec "npm install --production"
  popd()

  fixAboutFile "#{oDir}/renderer/about.md"
  cp "README.md", "#{oDir}/renderer/README.md"

#-------------------------------------------------------------------------------
fixAboutFile = (aboutFile)->
  aboutContent = cat aboutFile
  aboutContent = aboutContent.replace(/%%app-version%%/g, pkg.version)
  aboutContent = aboutContent.replace(/%%electron-version%%/g, ePkg.version)

  aboutContent.to aboutFile

#-------------------------------------------------------------------------------
build_darwin_x64 = (dir, name)->
  log "building #{path.relative process.cwd(), path.join(dir, name)} ..."

  iDir = "node_modules/electron-prebuilt/dist"
  oDir = dir

  eiDir = "#{iDir}/Electron.app"
  eoDir = "#{oDir}/Electron.app"

  rm "-Rf", eoDir

  # copy electron, swizzle license/version names, locations
  cp "-R", eiDir, oDir
  cp "#{iDir}/LICENSE", "#{eoDir}/LICENSE-electron"
  cp "#{iDir}/version", "#{eoDir}/version-electron"

  # copy icns
  cp "app/renderer/images/AnyViewer.icns", "#{eoDir}/Contents/Resources"

  # fix the Info.plist
  cfBundleFix name, "#{eoDir}/Contents/Info.plist"

  # remove default_app
  rm "-rf", "#{eoDir}/Contents/Resources/default_app"

  # rename the binary executable
  mv "#{eoDir}/Contents/MacOS/Electron", "#{eoDir}/Contents/MacOS/#{name}"

  # build the app directory
  build_app "#{eoDir}/Contents/Resources"

  # rename the .app file
  rm "-Rf", "#{oDir}/#{name}.app"
  mv eoDir, "#{oDir}/#{name}.app"

#-------------------------------------------------------------------------------
build_linux_x64 = (dir, name)->
  log "building #{path.relative process.cwd(), path.join(dir, name)} ..."

  iDir = "node_modules/electron-prebuilt/dist"
  oDir = "#{dir}/#{name}"

  rm "-Rf", oDir

  # copy electron, swizzle license/version names, locations
  cp "-R", "#{iDir}/*", oDir
  cp "#{iDir}/LICENSE", "#{oDir}/LICENSE-electron"
  cp "#{iDir}/version", "#{oDir}/version-electron"

  # remove default_app
  rm "-rf", "#{oDir}/resources/default_app"

  # build the app directory
  build_app "#{oDir}/resources"

  # rename the .app file
  mv "#{oDir}/electron", "#{oDir}/#{name}"

#-------------------------------------------------------------------------------
cfBundleFix = (name, iFile) ->
  pObj = plist.parse( cat iFile )

  pObj.CFBundleDisplayName = name
  pObj.CFBundleExecutable  = name
  pObj.CFBundleName        = name
  pObj.CFBundleIconFile    = "AnyViewer.icns"
  pObj.CFBundleIdentifier  = "org.muellerware.#{name}"
  pObj.CFBundleVersion     = pkg.version

  pObj.CFBundleDocumentTypes = [
    {
      CFBundleTypeExtensions: [ "md" ],
      CFBundleTypeIconFile: "AnyViewer.icns",
      CFBundleTypeName:     "public.markdown",
      CFBundleTypeRole:     "Viewer",
      LSHandlerRank:        "Alternate",
      LSItemContentTypes:   [ "public.markdown" ]
    }
  ]

  pObj.UTImportedTypeDeclarations = [
    {
      UTTypeConformsTo: [ "public.data" ],
      UTTypeIdentifier: "public.markdown",
      UTTypeTagSpecification: {
        "com.apple.ostype":          "markdown",
        "public.filename-extension": [ "md" ],
        "public.mime-type":          "text/markdown"
      }
    }
	]

  plist.build(pObj).to iFile

#-------------------------------------------------------------------------------
taskBuildIcns = ->
  log "build icns file..."

  iFile = "app/renderer/images/AnyViewer.png"
  oFile = "app/renderer/images/AnyViewer.icns"
  tDir  = "tmp/icns.iconset"

  cleanDir tDir

  exec "sips -z    16 16  #{iFile} --out #{tDir}/icon_16x16.png"
  exec "sips -z    32 32  #{iFile} --out #{tDir}/icon_16x16@2x.png"
  exec "sips -z    32 32  #{iFile} --out #{tDir}/icon_32x32.png"
  exec "sips -z    64 64  #{iFile} --out #{tDir}/icon_32x32@2x.png"
  exec "sips -z  128 128  #{iFile} --out #{tDir}/icon_128x128.png"
  exec "sips -z  256 256  #{iFile} --out #{tDir}/icon_128x128@2x.png"
  exec "sips -z  256 256  #{iFile} --out #{tDir}/icon_256x256.png"
  exec "sips -z  512 512  #{iFile} --out #{tDir}/icon_256x256@2x.png"
  exec "sips -z  512 512  #{iFile} --out #{tDir}/icon_512x512.png"
  exec "sips -z 1024 1024 #{iFile} --out #{tDir}/icon_512x512@2x.png"

  exec "iconutil --convert icns --output #{oFile} #{tDir}"

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

#-------------------------------------------------------------------------------
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------------
