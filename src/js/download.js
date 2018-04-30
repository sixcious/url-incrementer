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
  function download(document_) {
    console.log("in download...");
    var links = document_.querySelectorAll("[src*='.png'],[href*='.action']"),
        // links = doc.getElementsByTagName("img"),
        // srclinks = document_.querySelectorAll("[src]"),
        // hreflinks = document_.querySelectorAll("[href]"),
        link,
        url,
        filename,
        a,
        i;
    // for (i = 0; i < links.length; i++) {
    //   link = links[i];
    //   url = link.src ? link.src : link.href ? link.href : "";
    //   filename = url.split("/").pop();
    //   if (url && filename && filename.includes("cats") || filename.includes("docId")) {
    //     a = document_.createElement("a");
    //     a.setAttribute("href", url);
    //     a.setAttribute("download", filename);
    //     console.log("a is =" + a);
    //     a.click();
    //   }
    // }
    console.log("downloading the page!");
    a = document_.createElement("a");
    a.setAttribute("href", window.location.href);
    a.setAttribute("download", "webpage");
    console.log("a page is =" + a);
    a.click();
  }

  // Return Public Functions
  return {
    download: download
  };
}();