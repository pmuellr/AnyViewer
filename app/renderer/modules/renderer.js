// Licensed under the Apache License. See footer for details.

"use strict"

/*global $*/

const shell    = require("shell")
const webFrame = require("web-frame")

window.mdViewer = {}
window.mdViewer.reload        = reload
window.mdViewer.openLink      = openLink
window.mdViewer.setZoomFactor = setZoomFactor

//------------------------------------------------------------------------------
function reload(content) {
  const scrX = window.scrollX
  const scrY = window.scrollY

  $(".markdown-body").html(content)

  window.scrollTo(scrX, scrY)
}

//------------------------------------------------------------------------------
function openLink(href) {
  shell.openExternal(href)
}

//------------------------------------------------------------------------------
function setZoomFactor(zoomFactor) {
  webFrame.setZoomFactor(zoomFactor)
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
