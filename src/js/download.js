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
  function download(document_, querySelectorAll) {
          // links = doc.getElementsByTagName("img"),
        // srclinks = document_.querySelectorAll("[src]"),
        // hreflinks = document_.querySelectorAll("[href]"),
    console.log("in download...");
    var links = document_.querySelectorAll(querySelectorAll),
        link,
        url,
        filename,
        a,
        i,
        length;

		
    for (i = 0; i < links.length; i++) {
      link = links[i];
      url = link.src ? link.src : link.href ? link.href : "";
      filename = url.split("/").pop();
      if (url && filename) {
        a = document_.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", filename);
        console.log("a is =" + a);
        a.click();
       }
     }
    console.log("downloading the page!");
    a = document_.createElement("a");
    a.setAttribute("href", window.location.href);
    a.setAttribute("download", "");
    console.log("a page is =" + a);
    a.click();
  }

  // Return Public Functions
  return {
    download: download
  };
}();