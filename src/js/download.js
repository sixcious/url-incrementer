/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = URLI.Download || function () {

  /**
   * TODO
   */
  function findDownloadURLs(selector) {
    console.log("finLinks()" + selector);
    var els = document.querySelectorAll(selector),
        el,
        urls = [],
        i;
    console.log("found " + els.length + " links");
    for (i = 0; i < els.length; i++) {
      el = els[i];
      urls[i] = el.src ? el.src : el.href ? el.href : ""
      console.log("url=" + urls[i]);
    }
    return urls;
  }

  // Return Public Functions
  return {
    findDownloadURLs: findDownloadURLs
  };
}();