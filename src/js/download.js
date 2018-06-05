/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

  // TODO
  //const MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "video/webm", "audio/mpeg", "audio/mp3", "video/mp4", "application/zip"];
  const EXT_MIME_TYPES = {
    "jpg":  "image/jpeg",
    "jpeg": "image/jpeg",
    "png":  "image/png",
    "gif":  "image/gif",
    "webm": "video/webm",
    "mp3":  "audio/mpeg", // also "audio/mp3"
    "mp4":  "video/mp4",
    "zip":  "application/zip"
  };

  function previewDownloadURLs(strategy, extensions, tags, selector, includes, excludes) {
    var good = [],
        bad = [],
        allExtensions = [],
        allTags = [];
    console.log("trying for good...");
    try {
      good = findDownloadURLs(strategy, extensions, tags, selector, includes, excludes);
    } catch (e) {
      console.log(e);
    }
    console.log("trying for bad...");
        try {
          bad = findDownloadURLs("all", "", "", "[src],[href]");
          allExtensions = findExts(bad);
          allTags = findTags(bad);
    } catch (e) {
      console.log(e);
    }



    console.log("bad.length=" + bad.length);
    //Find values that are in result2 but not in result1
var uniqueResultTwo = bad.filter(function(obj) {
    return !good.some(function(obj2) {
        return obj.url === obj2.url;
    });
});

if (strategy === "page") {
  uniqueResultTwo = [];
}

    return { "good": good, "bad": uniqueResultTwo, "allExtensions": allExtensions, "allTags": allTags }
  }

  /**
   * TODO
   *
   * @param strategy
   * @param extensions
   * @param tags
   * @param selector
   * @param includes
   * @param excludes
   * @returns {*}
   * @public
   */
  function findDownloadURLs(strategy, extensions, tags, selector, includes, excludes) {
    console.log("findDownloadURLs()" + selector);
    var results = [],
        selectorbuilder = "";
    switch (strategy) {
      case "all":
        results = findDownloadURLsBySelector(strategy, extensions, tags, "[src],[href]", includes, excludes);
        break;
      case "types":
//        for (let extension of extensions) {
//          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[src*='." + extension + "' i],[href*='." + extension + "' i]";
//        }
//        console.log("extension selectorbuilder=" + selectorbuilder);
        results = findDownloadURLsBySelector(strategy, extensions, tags, "[src],[href]", includes, excludes);
        break;
      case "tags":
        for (let tag of tags) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + tag;
        }
        console.log("tags selectorbuilder=" + selectorbuilder);
        results = findDownloadURLsBySelector(strategy, extensions, tags, selectorbuilder, includes, excludes);
        break;
      case "selector":
        results = findDownloadURLsBySelector(strategy, extensions, tags, selector, includes, excludes);
        break;
      case "page":
        results = [{ "url": document.location.href, "ext": "", "tag": ""}];
        break;
      default:
        results = [];
        break;
    }
    return results;
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
  function findDownloadURLsBySelector(strategy, extensions, tags, selector, includes, excludes) {
    var hostname = document.location.hostname,
        els = document.querySelectorAll(selector),
        downloads = new Map(), // return value, we use a Set to avoid potential duplicate URLs
        url = "",
        ext = "",
        tag = "",
        mime = "";
    console.log("found " + els.length + " links");
    for (el of els) {
      url = el.src ? el.src : el.href ? el.href : "";
      if (url && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
     //   console.log("adding url!");
        ext = findExt(url);
        if (!isValidExt(ext)) {
          ext = "";
        }
        // Special Restriction (Extensions)
        if (strategy === "types" && (!extensions.includes(ext) || ext === "")) {
          continue;
        }
        tag = el.tagName ? el.tagName.toLowerCase() : "";
        // Special Restriction (Tags)
        if (strategy === "tags" && (!tags.includes(tag) || tag === "")) {
          continue;
        }
        mime = EXT_MIME_TYPES[ext];
        downloads.set(url + "", {"url": url, "ext": ext, "tag": tag, "mime": mime ? mime : ""});
      }
    }
   // console.log("downloadsFound=");
   // console.log(downloads);
    return [...downloads.values()]; // Convert Set into Array for return value back (Set can't be used)
  }
  
  function findExts(urls) {
    var ext,
        extset = new Set(),
        extarr = [];
    for (let url of urls) {
      if (url.ext) {
        extset.add(url.ext);
      }
    }
    extarr = [...extset].sort();
    return extarr;
  }

  // Regex to find file extension from URL by SteeBono @ stackoverflow.com
  // https://stackoverflow.com/a/42841283
  function findExt(url) {
    var urlquestion = url && url.length > 0 ? url.substring(0, url.indexOf("?")) : undefined,
        urlhash = url && url.length > 0 && !urlquestion ? url.substring(0, url.indexOf("#")) : undefined,  
    //urlo = new URL(url),
        regex = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/,
//regex = /.+(\.\w{3})\?*.*/,
        group = 1,
        match = regex.exec(urlquestion ? urlquestion : urlhash ? urlhash : url ? url : ""),
        ext = "";
    if (match && match[group]) {
      ext = match[group].slice(1); // Remove the . (e.g. .jpeg becomes jpeg)
    }
    return ext;
  }
  
  function isValidExt(ext) {
    // Arbitrary rules: Extensions must be alphanumeric and under 8 characters
    return ext && ext.trim() !== "" && /^[a-z0-9]+$/i.test(ext) && ext.length <= 8;
  }
  
  function findTags(items) {
    var tagset = new Set(),
        tagarr = [];
    for (let item of items) {
      tagset.add(item.tag);
    }
    tagarr = [...tagset].sort();
    return tagarr;
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
     //   console.log("found a link that wasn't from the samee hostname!" + url);
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
   // console.log("checking terms and url... terms =" + terms + " url=" + url);
    if (terms && terms.length > 0) {
      for (let term of terms) {
        if (term && doesInclude ? !url.includes(term) : url.includes(term)) {
     //     console.log("found a url that doesn't include or exclude the term.. :( terms=" + terms + " , url=" + url);
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