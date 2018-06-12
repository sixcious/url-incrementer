/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

  // A list of all attributes that can contain URLs @see https://stackoverflow.com/a/2725168 
  const URL_ATTRIBUTES = ["src", "href", "poster", "codebase", "cite", "action", "background", "longdesc", "usemap", "formaction", "icon"];

  /**
   * TODO
   *
   * @returns {*} results, the array of all URLs items, all extensions, all tags, and all attributes
   * @public
   */
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
   * @param strategy   the download strategy to employ
   * @param extensions the file extensions to check for
   * @param tags       the HTML tags (e.g. <img>) to check for
   * @param attributes the HTML tag attributes (e.g. src, href) to check for
   * @param selector   (optional) the CSS selectors to use in querySelectorAll()
   * @param includes   (optional) the array of Strings that must be included in the URLs
   * @param excludes   (optional) the array of Strings that must be excluded from the URLs
   * @returns {*} results, the array of results
   * @public
   */
  function findDownloadURLs(strategy, extensions, tags, attributes, selector, includes, excludes) {
    console.log("findDownloadURLs()" + selector);
    var results = [],
        selectorbuilder = "";
    try {
      switch (strategy) {
        case "all":
        case "extensions": // Noticed issues with using a selectorbuilder based on the extensions so go with all for this for now
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
          results = [{ "url": url, "ext": ext, "tag": "", "attribute": ""}];
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
   * @param strategy   the download strategy to employ
   * @param extensions the file extensions to check for
   * @param tags       the HTML tags (e.g. <img>) to check for
   * @param attributes the HTML tag attributes (e.g. src, href) to check for
   * @param selector   (optional) the CSS selectors to use in querySelectorAll()
   * @param includes   (optional) the array of Strings that must be included in the URLs
   * @param excludes   (optional) the array of Strings that must be excluded from the URLs
   * @returns {*} results, the array of results
   * @private
   */
  function findDownloadURLsBySelector(strategy, extensions, tags, attributes, selector, includes, excludes) {
    console.log("selector=" + selector);
    var hostname = document.location.hostname,
        els = document.querySelectorAll(selector),
        downloads = new Map(), // return value, we use a Map to avoid potential duplicate URLs
        url = "",
        ext = "",
        attribute = "",
        tag = "";
    console.log("found " + els.length + " links");
    for (el of els) {
      for (urlattribute of URL_ATTRIBUTES) {
        if (el[urlattribute]) {
          url = el[urlattribute];
          attribute = urlattribute;
          break;
        }
      }
      if (url && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
        ext = findExt(url);
        // Special Restriction (Extensions)
        if (strategy === "extensions" && (!ext || !extensions.includes(ext))) {
          continue;
        }
        tag = el.tagName ? el.tagName.toLowerCase() : "";
        // Special Restriction (Tags)
        if (strategy === "tags" && (!tag || !tags.includes(tag))) {
          continue;
        }
        // Special Restriction (Attributes)
        if (strategy === "attributes" && (!attribute || !attributes.includes(attribute))) {
          continue;
        }
        downloads.set(url + "", {"url": url, "ext": ext, "tag": tag, "attribute": attribute});
      }
    }
    return [...downloads.values()]; // Convert Map values into Array for return value back (Map/Set can't be used)
  }

  /**
   * Finds all the unique properties (extensions, tags, or attributes) from the collection of items.
   *
   * @param items    the items to check
   * @param property the property to check (e.g. "ext", "tag", "attribute")
   * @returns {Array} the unique properties sorted
   * @private
   */
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

  /**
   * Finds the file extension from a URL String.
   * Regex to find a file extension from a URL is by SteeBono @ stackoverflow.com
   *
   * @param url the URL to parse
   * @returns {string} the file extension (if found)
   * @see https://stackoverflow.com/a/42841283
   * @private
   */
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
        if (!isValidExt(ext)) { // If extension is not valid, throw it out
          ext = "";
        }
      }
    }
    return ext;
  }

  /**
   * Determines if a potential file extension is valid.
   * Arbitrary rules: Extensions must be alphanumeric and under 8 characters
   *
   * @param extension the extension to check
   * @returns {boolean} true if the extension is valid, false if not
   * @private
   */
  function isValidExt(extension) {
    return extension && extension.trim() !== "" && /^[a-z0-9]+$/i.test(extension) && extension.length <= 8;
  }

  // Return Public Functions
  return {
    previewDownloadURLs: previewDownloadURLs,
    findDownloadURLs: findDownloadURLs
  };
}();