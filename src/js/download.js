/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = URLI.Download || function () {

  var FILE_DESCRIPTORS = {
        "jpeg": {
          "extensions": ["jpg", "jpeg"],
          "mimeType":   "image/jpeg",
          "selector":   "[src*='.jpg' i],[href*='.jpg' i],[src*='.jpeg' i],[href*='.jpeg' i]"
        },
        "png": {
          "extensions": ["png"],
          "mimeType":   "",
          "selector":   "[src*='.png' i],[href*='.png' i]"
        },
        "gif": {
          "extensions": ["gif"],
          "mimeType":   "",
          "selector":   "[src*='.gif' i],[href*='.gif' i]"
        },
        "mp3": {
          "extensions": ["mp3"],
          "mimeType":   "",
          "selector":   "[src*='.mp3' i],[href*='.mp3' i]"
        },
        "mp4": {
          "extensions": ["mp4"],
          "mimeType":   "",
          "selector":   "[src*='.mp4' i],[href*='.mp4' i]"
        },
      };

  /**
   * TODO
   *
   * @param strategy
   * @param types
   * @param selector
   * @param path
   * @param sameDomainPolicyEnabled
   * @returns {*}
   * @public
   */
  function findDownloadURLs(strategy, types, selector, path, sameDomainPolicyEnabled) {
    console.log("findDownloadURLs()" + selector);
    var selectorFromTypes = "",
        i;
    switch (strategy) {
      case "types":
        for (i = 0; i < types.length; i++) {
          console.log("in for... types[i]=" + types[i]);
          if (types[i] && FILE_DESCRIPTORS[types[i]]) {
            selectorFromTypes += selectorFromTypes !== "" ? "," : "";
            selectorFromTypes += FILE_DESCRIPTORS[types[i]].selector;
          }
        }
        return findDownloadURLsBySelector(selectorFromTypes, path, sameDomainPolicyEnabled);
        break;
      case "selector":
        return findDownloadURLsBySelector(selector, path, sameDomainPolicyEnabled);
        break;
      case "page":
        return [document.location.href];
        break;
      default:
        return [];
        break;
    }
  }

  /**
   * TODO
   *
   * @param selector
   * @param path
   * @param sameDomainPolicyEnabled
   * @returns {*[]}
   * @private
   */
  function findDownloadURLsBySelector(selector, path, sameDomainPolicyEnabled) {
    var hostname = document.location.hostname,
        els = document.querySelectorAll(selector),
        el,
        urls = new Set(), // return value, we use a Set to avoid potential duplicate URLs
        url;
    console.log("found " + els.length + " links");
    for (el of els) {
      url = el.src ? el.src : el.href ? el.href : "";
      if (url && isFromSameDomain(sameDomainPolicyEnabled, url, hostname) && doesIncludePath(url, path)) {
        urls.add(url);
      }
    }
    console.log("urls=");
    console.log(urls);
    return [...urls]; // Convert Set into Array for return value back (Set can't be used)
  }

  /**
   * TODO
   *
   * @param sameDomainPolicyEnabled
   * @param url
   * @param hostname
   * @returns {boolean}
   * @private
   */
  function isFromSameDomain(sameDomainPolicyEnabled, url, hostname) {
    var sameDomain = true,
        urlo;
    if (sameDomainPolicyEnabled) {
      urlo = new URL(url);
      if (urlo.hostname !== hostname) {
        console.log("found a link that wasn't from the samee hostname!" + url);
        sameDomain = false;
      }
    }
    return sameDomain;
  }

  /**
   * TODO
   *
   * @param url
   * @param path
   * @returns {boolean}
   * @private
   */
  function doesIncludePath(url, path) {
    var doesInclude = true;
    console.log("checking path and url... path =" + path + " url=" + url);
    if (path && !url.includes(path)) {
      console.log("found a url that doesn't include the path... :( path=" + path + " , url=" + url);
      doesInclude = false;
    }
    return doesInclude;
  }
  
  function checkSize(url, callback) {
    new Promise(resolve => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = () => {
        resolve(+xhr.getResponseHeader("Content-Length"));
        xhr.abort();
      };
      xhr.send();
    }).then(console.log);
  }

  // Return Public Functions
  return {
    findDownloadURLs: findDownloadURLs
  };
}();