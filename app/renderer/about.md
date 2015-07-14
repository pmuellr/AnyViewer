
AnyViewer
================================================================================

AnyViewer is a very simple Markdown file viewer desktop application. It will
render a Markdown file into HTML and display the HTML in an embedded web view
in an application window.

You change the text size via menu and shortcut, the exact same way you
"zoom" pages in the Chrome web browser.  The file you are viewing will
be watched, and the view will be updated when the file changes.

The markdown is rendered into HTML with the
[marked package](https://www.npmjs.com/package/marked).  The following options
are used to render the markdown:

    gfm:          true
    tables:       true
    breaks:       false
    pedantic:     false
    sanitize:     false
    smartLists:   true
    smartypants:  false

On OS X, AnyViewer associates itself with Markdown files (files with the `.md`
extension), so you should be able to open a Markdown file with an "Open With..."
kind of menu option.  To set AnyViewer to be the default application used with
Markdown files on a Mac, see these instructions on
[how to change default apps on the Mac](http://www.imore.com/how-change-default-apps-os-x).

For more information on AnyViewer, see the source repo at GitHub:

* <https://github.com/pmuellr/AnyViewer>

versions
--------------------------------------------------------------------------------

    application: %%app-version%%
    electron:    %%electron-version%%

--------------------------------------------------------------------------------

<center>
<img width="80%" src="images/AnyViewer.png">
</center>
