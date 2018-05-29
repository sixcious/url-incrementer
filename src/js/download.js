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
        el,
        urls = new Set(), // return value, we use a Set to avoid potential duplicate URLs
        url;
    console.log("found " + els.length + " links");
    for (el of els) {
      url = el.src ? el.src : el.href ? el.href : "";
      if (url && isFromSameDomain(sameDomainPolicyEnabled, url, hostname) && doesInclude(url, includes) && doesExclude(url, excludes)) {
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
  function doesInclude(url, includes) {
    var doesInclude = true;
    console.log("checking includes and url... includes =" + includes + " url=" + url);
    if (includes && !url.includes(includes)) {
      console.log("found a url that doesn't include the includes... :( includes=" + includes + " , url=" + url);
      doesInclude = false;
    }
    return doesInclude;
  }
  
    /**
   * TODO
   *
   * @param url
   * @param excludes
   * @returns {boolean}
   * @private
   */
  function doesExclude(url, excludes) {
    var doesExclude = true;
    console.log("checking excludes and url... excludes =" + excludes + " url=" + url);
    if (excludes && url.includes(excludes)) {
      console.log("found a url that doesn't exclude the excludes... :( excludes=" + excludes + " , url=" + url);
      doesExclude = false;
    }
    return doesExclude;
  }

  // Return Public Functions
  return {
    findDownloadURLs: findDownloadURLs
  };
}();