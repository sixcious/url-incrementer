/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

/*  var FILE_TYPE_SELECTORS = {
        "jpeg": "[src*='.jpg' i],[href*='.jpg' i],[src*='.jpeg' i],[href*='.jpeg' i]",
        "png":  "[src*='.png' i],[href*='.png' i]",
        "gif":  "[src*='.gif' i],[href*='.gif' i]",
        "webm": "[src*='.webm' i],[href*='.webm' i]",
        "mp3":  "[src*='.mp3' i],[href*='.mp3' i]",
        "mp4":  "[src*='.mp4' i],[href*='.mp4' i]",
        "zip":  "[src*='.zip' i],[href*='.zip' i]"
      };*/

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
          bad = findDownloadURLsBySelector("[src],[href]");
    } catch (e) {
      console.log(e);
    }

      allExtensions = findExts(bad);
      allTags = findTags(bad);

   // console.log("bad=" + bad);
    console.log("bad.length=" + bad.length);

    //console.log("extarr=" + extensions);
    //let bad = new Set(good.filter(x => !bads.has(x)));
    // DIFFERENCE:
/*    var a = ['a', 'b', 'c', 'd'];
var b = ['a', 'b'];
var b1 = new Set(b);
var difference = [...new Set([...a].filter(x => !b1.has(x)))];


    let namesSet = new Set(array.map(item => item.name));
    goodset = new Set(array.map(item => item.url));
    badset = new Set(array.map(item => item.url));
    differenceb = [...new Set(
  */  
//    result2=bad result1=good
    //Find values that are in result2 but not in result1
var uniqueResultTwo = bad.filter(function(obj) {
    return !good.some(function(obj2) {
        return obj.url == obj2.url;
    });
});

    return { "good": good, "bad": uniqueResultTwo, "allExtensions": allExtensions, "allTags": allTags }
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
  function findDownloadURLs(strategy, extensions, tags, selector, includes, excludes) {
    console.log("findDownloadURLs()" + selector);
    var selectorbuilder = "",
        i;
    switch (strategy) {
      case "types":
      /*
        for (i = 0; i < types.length; i++) {
          console.log("in for... types[i]=" + types[i]);
          if (types[i] && FILE_TYPE_SELECTORS[types[i]]) {
            selectorFromTypes += selectorFromTypes !== "" ? "," : "";
            selectorFromTypes += FILE_TYPE_SELECTORS[types[i]];
          }
          */
        for (let extension of extensions) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[src*='." + extension + "' i],[href*='." + extension + "' i]";
        }
        console.log("extension selectorbuilder=" + selectorbuilder);
        return findDownloadURLsBySelector(selectorbuilder, includes, excludes);
        break;
      case "tags":
        //return findDownloadURLsBySelector img, video,
        for (let tag of tags) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + tag;
        }
        console.log("tags selectorbuilder=" + selectorbuilder);
        return findDownloadURLsBySelector(selectorbuilder, includes, excludes);
        break;
      case "selector":
        return findDownloadURLsBySelector(selector, includes, excludes);
        break;
      case "page":
        return [{ "href": document.location.href, "ext": "", "tag": ""}];
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
  function findDownloadURLsBySelector(selector, includes, excludes) {
    var hostname = document.location.hostname,
        els = document.querySelectorAll(selector),
        downloads = new Map(), // return value, we use a Set to avoid potential duplicate URLs
        url = "",
        ext = "",
        tag = "";
    console.log("found " + els.length + " links");
    for (el of els) {
      url = el.src ? el.src : el.href ? el.href : "";
      if (url && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
        console.log("adding url!");
        ext = findExt(url);
        if (!isValidExt(ext)) {
          ext = "";
        }
        tag = el.tagName ? el.tagName.toLowerCase() : "";
        downloads.set(url + "", {"url": url, "ext": ext, "tag": tag});
      }
    }
    console.log("downloadsFound=");
    console.log(downloads);
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
    var regex = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/,
        group = 1,
        match = regex.exec(url),
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