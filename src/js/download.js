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
      },
      urls = new Set(); // return value, we use a Set to avoid potential duplicate URLs

  /**
   * TODO
   * @public
   */
  function findDownloadURLs(strategy, types, selector, includes, limit, sameDomainPolicyEnabled) {
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
        return findDownloadURLsBySelector(selectorFromTypes, includes, limit, sameDomainPolicyEnabled);
        break;
      case "all":
        return findDownloadURLsBySelector("[src],[href]", includes, limit, sameDomainPolicyEnabled);
        break;
      case "selector":
        return findDownloadURLsBySelector(selector, includes, limit, sameDomainPolicyEnabled);
        break;
      case "page":
        urls.add(document.location.href);
        return [...urls];
        break;
      default:
        return [...urls];
        break;
    }
  }
  
  function findDownloadURLsBySelector(selector, includes, limit, sameDomainPolicyEnabled) {
    var origin = document.location.origin,
        els = document.querySelectorAll(selector),
        el,
        url,
        length = els.length,  //= limit && limit < els.length ? limit : els.length,
        i;
    console.log("found " + els.length + " links");
    for (i = 0; i < length; i++) {
      el = els[i];
      url = el.src ? el.src : el.href ? el.href : "";
      if (isFromSameDomain(sameDomainPolicyEnabled, url, origin)) {
        urls.add(url);
      }
    }
    console.log("urls=");
    console.log(urls);
    return [...urls];
  }

  function isFromSameDomain(sameDomainPolicyEnabled, url, origin) {
    var sameDomain = true,
        urlo;
    if (sameDomainPolicyEnabled) {
      urlo = new URL(url);
      if (urlo.origin !== origin) {
        console.log("found a link that wasn't from the same origin!" + url);
        sameDomain = false;
      }
    }
    return sameDomain;
  }

  // Return Public Functions
  return {
    findDownloadURLs: findDownloadURLs
  };
}();