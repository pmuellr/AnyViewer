require "cakex"

plist = require "plist"

pkg  = require "./package.json"

electronVersion = "1.3.5"

year = 1900 + new Date().getYear()

#-------------------------------------------------------------------------------
task "watch",     "watch for source file changes, build", -> taskWatch()
task "build",     "run a build",                          -> taskBuild()
task "buildIcns", "build the OS X icns file",             -> taskBuildIcns()

WatchSpec = "app/**/* .eslintrc package.json"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
taskBuild = ->
  log "build starting"

  cd process.cwd()

  process.exit(1) if runStandard() != 0

  log "doing some setup"
  mkdir "-p", "tmp/app"
  cp "-R", "app/*", "tmp/app"

  fixAboutFile "tmp/app/renderer/about.md"
  cp "README.md", "tmp/app/renderer/README.md"

  log "running npm install on app"
  cd "tmp/app"
  exec "npm install --production"
  cd "../.."

  options = [
    "--overwrite"
    "--out           build"
    "--version       #{electronVersion}"
    "--app-copyright 'Copyright 2015-#{year} AnyViewer contributors. All Rights Reserved.'"
    "--app-version   #{pkg.version}"
  ].join(" ")

  optionsMac = [
    "--icon              app/renderer/images/AnyViewer.icns"
    "--app-bundle-id     org.muellerware.anyviewer"
    "--app-category-type public.app-category.utilities"
    "--protocol          anyviewer"
    "--protocol-name     AnyViewer"
  ].join(" ")

  optionsLinux = [
  ].join(" ")

  optionsWin = [
    "--win32metadata.CompanyName 'AnyViewer contributors'"
    "--win32metadata.ProductName  AnyViewer"
  ].join(" ")

  log "building executables"
  electron_packager "tmp/app --platform darwin --arch x64  #{options} #{optionsMac}"
  electron_packager "tmp/app --platform linux  --arch ia32 #{options} #{optionsLinux}"
  electron_packager "tmp/app --platform linux  --arch x64  #{options} #{optionsLinux}"
  electron_packager "tmp/app --platform win32  --arch ia32 #{options} #{optionsWin}"
  electron_packager "tmp/app --platform win32  --arch x64  #{options} #{optionsWin}"

  cfBundleFix "AnyViewer", "build/AnyViewer-darwin-x64/AnyViewer.app/Contents/Info.plist"

  buildDirs = [
    "darwin-x64"
    "linux-ia32"
    "linux-x64"
    "win32-ia32"
    "win32-x64"
  ]

  log "building executable archives"
  for buildDir in buildDirs
    rm "build/AnyViewer-#{buildDir}/LICENSE"
    rm "build/AnyViewer-#{buildDir}/LICENSES.chromium.html"
    rm "build/AnyViewer-#{buildDir}/version"

    origDir = pwd()
    cd "build/AnyViewer-#{buildDir}"
    exec "zip -q -y -r ../AnyViewer-#{buildDir}-#{pkg.version}.zip *"
    cd origDir

  log "build done."

#-------------------------------------------------------------------------------
runStandard = ->
  log "standard: checking files"
  rc = exec("node_modules/.bin/standard")
  log "standard: A-OK!" if rc.code == 0
  return rc.code

#-------------------------------------------------------------------------------
watchIter = ->
  runStandard()

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
  aboutContent = aboutContent.replace(/%%electron-version%%/g, electronVersion)

  aboutContent.to aboutFile

#-------------------------------------------------------------------------------
cfBundleFix = (name, iFile) ->
  pObj = plist.parse( cat iFile )

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
  log "building icns file from png"

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
