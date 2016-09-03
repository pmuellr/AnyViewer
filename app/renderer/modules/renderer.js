'use strict'

const webFrame = require('electron').webFrame

window.AnyViewer = {}
window.AnyViewer.reload = reload
window.AnyViewer.setZoomFactor = setZoomFactor

// -----------------------------------------------------------------------------
function reload (newContent) {
  const x = window.scrollX
  const y = window.scrollY

  // document.location.reload(true)

  const doc = document.open('text/html')
  doc.write(newContent)
  doc.close()

  window.scroll(x, y)
}

// -----------------------------------------------------------------------------
function setZoomFactor (zoomFactor) {
  webFrame.setZoomFactor(zoomFactor)
}
