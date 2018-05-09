/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = URLI.Download || function () {

  /**
   *
   * @public
   */
  function download(strategy, selector, includes, limit) {
    console.log("download(selector)");
    return findSelectorLinks(selector);
  }

  /**
   * TODO
   *
   * @param selector
   * @param includes
   * @param limit
   * @private
   */
  function downloadSelectorLinks(selector, includes, limit) {
    var links,
        link,
        url,
        a,
        i,
        length;
    links = document.querySelectorAll(selector);
    length = limit < links.length ? limit : links.length;
    console.log("links length = " + links.length);
    console.log("links in downloadLinks=" + links);
    for (i = 0; i < length; i++) {
      link = links[i];
      url = link.src ? link.src : link.href ? link.href : "";
      if (url) { // && includes && url.includes(includes)) {
        a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", "");
        console.log("about to download!!! a is =" + a);
        a.click();
      }
    }
    return links;
  }

  /**
   * TODO
   *
   * @private
   */
  function downloadPage() {
    console.log("downloadPage()");
    var a;
    a = document.createElement("a");
    a.setAttribute("href", window.location.href);
    a.setAttribute("download", "");
    a.click();
  }

  /**
   * TODO
   */
  function findSelectorLinks(selector) {
    console.log("findSelectorLinks()" + selector);
    var links = document.querySelectorAll(selector);
    console.log(links);
    console.log(links.length);
    var urls = [];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      urls[i] = link.src ? link.src : link.href ? link.href : ""
      console.log("url=" + urls[i]);
    }
    return urls;
  }

  // Return Public Functions
  return {
    download: download
  };
}();