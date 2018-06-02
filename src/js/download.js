/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

  var FILE_TYPE_SELECTORS = {
        "jpeg": "[src*='.jpg' i],[href*='.jpg' i],[src*='.jpeg' i],[href*='.jpeg' i]",
        "png":  "[src*='.png' i],[href*='.png' i]",
        "gif":  "[src*='.gif' i],[href*='.gif' i]",
        "webm": "[src*='.webm' i],[href*='.webm' i]",
        "mp3":  "[src*='.mp3' i],[href*='.mp3' i]",
        "mp4":  "[src*='.mp4' i],[href*='.mp4' i]",
        "zip":  "[src*='.zip' i],[href*='.zip' i]"
      };

  function previewDownloadURLs(strategy, types, selector, includes, excludes, sameDomainPolicyEnabled) {
    var good = findDownloadURLs(strategy, types, selector, includes, excludes, sameDomainPolicyEnabled);
    var els = document.querySelectorAll("[src],[href]"),
        bads = new Set(),
        url;
    for (el of els) {
      url = el.src ? el.src : el.href ? el.href : "";
      bads.add(url);
    }
    let bad = new Set(good.filter(x => !bads.has(x)));
    return { "good": good, "bad": [...bads] }
  }

  /**
   * TODO
   *
   * @param strategy
   * @param types
   * @param selector
   * @param includes
   * @param sameDomainPolicyEnabled
   * @returns {*}
   * @public
   */
  function findDownloadURLs(strategy, types, selector, includes, excludes, sameDomainPolicyEnabled) {
    console.log("findDownloadURLs()" + selector);
    var selectorFromTypes = "",
        i;
    switch (strategy) {
      case "types":
        for (i = 0; i < types.length; i++) {
          console.log("in for... types[i]=" + types[i]);
          if (types[i] && FILE_TYPE_SELECTORS[types[i]]) {
            selectorFromTypes += selectorFromTypes !== "" ? "," : "";
            selectorFromTypes += FILE_TYPE_SELECTORS[types[i]];
          }
        }
        return findDownloadURLsBySelector(selectorFromTypes, includes, excludes, sameDomainPolicyEnabled);
        break;
      case "selector":
        return findDownloadURLsBySelector(selector, includes, excludes, sameDomainPolicyEnabled);
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
   * @param includes
   * @param sameDomainPolicyEnabled
   * @returns {*[]}
   * @private
   */
  function findDownloadURLsBySelector(selector, includes, excludes, sameDomainPolicyEnabled) {
    var hostname = document.location.hostname,
        els = document.querySelectorAll(selector),
        urls = new Set(), // return value, we use a Set to avoid potential duplicate URLs
        url;
    console.log("found " + els.length + " links");
    for (el of els) {
      url = el.src ? el.src : el.href ? el.href : "";
      if (url && isFromSameDomain(sameDomainPolicyEnabled, url, hostname) &&
          doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
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
   * @param includes
   * @returns {boolean}
   * @private
   */
  function doesIncludeOrExclude(url, terms, doesInclude) {
    var does = true;
    console.log("checking terms and url... terms =" + terms + " url=" + url);
    if (terms && terms.length > 0) {
      for (let term of terms) {
        if (term && doesInclude ? !url.includes(term) : url.includes(term)) {
          console.log("found a url that doesn't include or exclude the term.. :( terms=" + terms + " , url=" + url);
          does = false;
          break;
        }
      }
    }
    return does;
  }

  // Return Public Functions
  return {
    previewDownloadURLs: previewDownloadURLs,
    findDownloadURLs: findDownloadURLs
  };
}();