AnyViewer - a programmable desktop file viewer built on Electron
================================================================================

usage
================================================================================

AnyViewer is a desktop application to view files.  The application only displays
HTML, so AnyViewer needs to be programmed to convert arbitrary files into HTML
format, using a plugin.

AnyViewer ships with plugins to handle HTML, Markdown, and source files that
can be rendered by the
[highlight.js package](https://www.npmjs.com/package/highlight.js) (the list
of languages is available
[here](https://github.com/isagalaev/highlight.js/tree/master/src/languages)).


plugins
--------------------------------------------------------------------------------

In order to have a custom HTML renderer for a particular file extension, you'll
need to install a plugin.  A plugin is an node package installed in a particular
location.  That location is the directory named `plugins` in the AnyViewer data
directory.  The AnyViewer data directory is located at:

* Mac OS X - `~/Library/Application Support/AnyViewer`

Each plugin should be in a separate directory, in the same vein as node's
`node_modules` directory.  The `package.json` file for each package should have
a property: `AnyViewer`, whose value is an object (described below), but
otherwise should be an `npm`-installable package.  Packages without an
`AnyViewer` property are not considered plugins.

The `AnyViewer` object in a `package.json` file should be an object, and can
have the following properties:

* `plugin`: the value of this property should be a reference to a module
  moduleID that is the primary entrypoint to the plugin.  Very similar to
  [package.json's `main`](https://docs.npmjs.com/files/package.json#main).

The plugin's primary entrypoint should be a module which exports the following
properties:

* `toHTML`: a function of shape `toHTML(vinylIn, vinylOut, cb)`.  
  This function is invoked to convert the original file being opened to HTML.
  The `vinyl*` parameters are
  [vinyl File objects](https://www.npmjs.com/package/vinyl),
  probably just with the file name values.  

  * `vinylIn` is the file that was requested to be open.
  * `vinylOut` is an output file which will be rendered
    in the HTML viewer - so it should be HTML.  The plugin is expected
    to write the HTML content to the specified file name.
  * The `cb` parameter is a callback of the shape cb(err).  Invoked this
    function when you have finished writing the HTML back, passing `null`
    as `err` on success, else an Error object.

  The path set in `vinylOut` is a temporary file name, which you can use
  to generate HTML.  The file will be erased when the viewer window
  closes.  But this is just a helper; you can also set `vinylOut.path` to
  a file which should be loaded directly in the viewer as well.  See the
  built-in HTML plugin for an example.

* `extensions`: an array of strings of extensions supported by this plugin.
  Expected to include the `"."` character at the beginning of each string,
  like [vinyl's extname property](https://www.npmjs.com/package/vinyl#extname).

AnyViewer features
--------------------------------------------------------------------------------

* Font-size changes can be made via menu and shortcuts, the same way you
  change "zoom" pages in the Chrome web browser.  The last change you made
  is set as the default size for all future viewer windows.

* The last change you made to the height and width of the windows are set
  as the default values for all future viewer windows.

* You can open a Chrome Dev Tools window via menu and shortcut.

* There are no forward/backward buttons available for history traversal,
  but there are menu items and shortcuts for those functions.

* A file which is being viewed is tracked for changes; when the file changes
  on disk, the view will be reloaded with the new contents.


install
================================================================================

You can download a pre-built binary from the
[releases page](https://github.com/AnyViewer/releases).

You can associate AnyViewer with particular file types, by following these
instructions:

* for [Mac OS X](http://www.imore.com/how-change-default-apps-os-x)


building
================================================================================

* clone this repo
* run `npm install` to install dependencies
* run `npm run build` to build the execute

A "build" version of the executable is available in the `build` directory,
to make it easier to test a development version while you have a stable version
installed at the same time, on your boxen.



hacking
================================================================================

This project uses [cake](http://coffeescript.org/#cake) as it's
build tool.  To rebuild the project continuously, use the command

```bash
npm run watch
```

Other `cake` commands are available (assuming you are using npm v2) with
the command

```bash
npm run cake -- <command here>
```

Run `npm run cake` to see the other commands available in the `Cakefile`.


license
================================================================================

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

--------------------------------------------------------------------------------

<center>
<img width="80%" src="app/renderer/images/AnyViewer.png">
</center>
