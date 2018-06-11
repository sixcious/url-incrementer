/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

// https://stackoverflow.com/a/2725168 
  const URL_ATTRIBUTES = ["src", "href", "poster", "codebase", "cite", "action", "background", "longdesc", "usemap", "formaction", "icon"];

  // TODO
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

  function previewDownloadURLs() {
    var  allURLs = findDownloadURLs("all");
         allExtensions = findProperties(allURLs, "ext");
         allTags = findProperties(allURLs, "tag"),
         allAttributes = findProperties(allURLs, "attribute");
    return { "allURLs": allURLs, "allExtensions": allExtensions, "allTags": allTags, "allAttributes": allAttributes }
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
  function findDownloadURLs(strategy, extensions, tags, attributes, selector, includes, excludes) {
    console.log("findDownloadURLs()" + selector);
    var results = [],
        selectorbuilder = "";
    try {
    switch (strategy) {
      case "all":
      case "extensions":
        for (let urlattribute of URL_ATTRIBUTES) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[" + urlattribute + "]";
        }
        results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selectorbuilder, includes, excludes);
        break;
      case "tags":
        for (let tag of tags) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + tag;
        }
        console.log("tags selectorbuilder=" + selectorbuilder);
        results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selectorbuilder, includes, excludes);
        break;
      case "attributes":
        for (let attribute of attributes) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[" + attribute + "]";
        }
        console.log("tags selectorbuilder=" + selectorbuilder);
        results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selectorbuilder, includes, excludes);
        break;
      case "selector":
        results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selector, includes, excludes);
        break;
      case "page":
        var url = document.location.href,
            ext = findExt(url);
        results = [{ "url": url, "ext": isValidExt(ext) ? ext : "", "tag": "", "attribute": ""}];
        break;
      default:
        results = [];
        break;
    }
    } catch (e) {
      console.log(e);
      results = [];
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
  function findDownloadURLsBySelector(strategy, extensions, tags, attributes, selector, includes, excludes) {
    console.log("selector=" + selector);
    var hostname = document.location.hostname,
        els = document.querySelectorAll(selector),
        downloads = new Map(), // return value, we use a Set to avoid potential duplicate URLs
        url = "",
        ext = "",
        attribute = "",
        tag = "",
        mime = "";
    console.log("found " + els.length + " links");
    for (el of els) {
      //url = el.src ? el.src : el.href ? el.href : el.poster ? el.poster  "";
      for (urlattribute of URL_ATTRIBUTES) {
        if (el[urlattribute]) {
          url = el[urlattribute];
          attribute = urlattribute;
          break;
        }
      }
      if (url && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
        
     //   console.log("adding url!");
        ext = findExt(url);
        if (!isValidExt(ext)) {
          ext = "";
        }

        // Special Restriction (Extensions)
        if (strategy === "extensions" && (!extensions.includes(ext) || ext === "")) {
          continue;
        }
        tag = el.tagName ? el.tagName.toLowerCase() : "";
        // Special Restriction (Tags)
        if (strategy === "tags" && (!tags.includes(tag) || tag === "")) {
          continue;
        }
        // Special Restriction (Attributes)
        if (strategy === "attributes" && (!attributes.includes(attribute) || attribute === "")) {
          continue;
        }
        mime = EXT_MIME_TYPES[ext];
        downloads.set(url + "", {"url": url, "ext": ext, "tag": tag, "attribute": attribute, "mime": mime ? mime : ""});
      }
    }
    return [...downloads.values()]; // Convert Map values into Array for return value back (Map/Set can't be used)
  }
  


  // Regex to find file extension from URL by SteeBono @ stackoverflow.com
  // https://stackoverflow.com/a/42841283
  function findExt(url) {
    var urlquestion,
        urlhash,
        regex = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/,
        group = 1,
        match,
        ext = "";
    if (url && url.length > 0) {
      urlquestion = url.substring(0, url.indexOf("?"));
      urlhash = !urlquestion ? url.substring(0, url.indexOf("#")) : undefined;
      match = regex.exec(urlquestion ? urlquestion : urlhash ? urlhash : url ? url : "");
      if (match && match[group]) {
        ext = match[group].slice(1); // Remove the . (e.g. .jpeg becomes jpeg)
      }
    }
    return ext;
  }

  // Arbitrary rules: Extensions must be alphanumeric and under 8 characters
  function isValidExt(extension) {
    return extension && extension.trim() !== "" && /^[a-z0-9]+$/i.test(extension) && extension.length <= 8;
  }


  function findProperties(items, property) {
    const properties = new Set();
    if (items) {
      for (let item of items) {
        if (item && item[property]) {
          properties.add(item[property]);
        }
      }
    }
    return [...properties].sort();
  }

  /**
   * Determines if the URL includes or excludes the terms.
   *
   * @param url         the url to check against
   * @param terms       the terms to check
   * @param doesInclude boolean indicating if this is an includes or excludes check
   * @returns {boolean} true if the url includes or excludes the terms
   * @private
   */
  function doesIncludeOrExclude(url, terms, doesInclude) {
    let does = true;
    if (terms && terms.length > 0) {
      for (let term of terms) {
        if (term && doesInclude ? !url.includes(term) : url.includes(term)) {
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