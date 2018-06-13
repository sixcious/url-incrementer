/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

  // A list of all attributes that can contain URLs
  // @see https://stackoverflow.com/a/2725168
  const URL_ATTRIBUTES = ["src", "href", "poster", "codebase", "cite", "action", "background", "longdesc", "usemap", "formaction", "icon"];

  /**
   * Finds all URLs, extensions, tags, and attributes on the page to build a download preview.
   *
   * @returns {*} results, the array of all URLs items, all extensions, all tags, and all attributes
   * @public
   */
  function previewDownloadURLs() {
    const  allURLs = findDownloadURLs("all"),
           allExtensions = findProperties(allURLs, "extension"),
           allTags = findProperties(allURLs, "tag"),
           allAttributes = findProperties(allURLs, "attribute");
    return { "allURLs": allURLs, "allExtensions": allExtensions, "allTags": allTags, "allAttributes": allAttributes }
  }

  /**
   * Finds all URLs by a specific strategy. Strategies can be "all", "extensions", "tags", "attributes", "selector",
   * or "page". This is the controller method that hands off the work to a lower-level method that actually parses
   * the elements using the selector.
   *
   * @param strategy   the download strategy to employ
   * @param extensions (optional) if strategy is extensions: the file extensions to check for
   * @param tags       (optional) if strategy is tags: the HTML tags (e.g. <img>) to check for
   * @param attributes (optional) if strategy is attributes: the HTML tag attributes (e.g. src, href) to check for
   * @param selector   (optional) if strategy is selector: the CSS selectors to use in querySelectorAll()
   * @param includes   (optional) the array of Strings that must be included in the URLs
   * @param excludes   (optional) the array of Strings that must be excluded from the URLs
   * @returns {*} results, the array of results
   * @public
   */
  function findDownloadURLs(strategy, extensions, tags, attributes, selector, includes, excludes) {
    let results = [],
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
          results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selectorbuilder, includes, excludes);
          break;
        case "attributes":
          for (let attribute of attributes) {
            selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[" + attribute + "]";
          }
          results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selectorbuilder, includes, excludes);
          break;
        case "selector":
          results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selector, includes, excludes);
          break;
        case "page":
          const url = document.location.href,
                extension = findExtension(url);
          results = [{ "url": url, "extension": extension, "tag": "", "attribute": ""}];
          break;
        default:
          results = [];
          break;
      }
    } catch (e) {
      console.log("URLI DEBUG: findDownloadURLs() Exception Caught:" + e);
      results = [];
    }
    return results;
  }

  /**
   * Finds all URLs that match the specified strategy and applicable parameters. Performs a query on the page's elements
   * and checks each element to see if it passes the strategy's rules.
   *
   * @param strategy   the download strategy to employ
   * @param extensions (optional) if strategy is extensions: the file extensions to check for
   * @param tags       (optional) if strategy is tags: the HTML tags (e.g. <img>) to check for
   * @param attributes (optional) if strategy is attributes: the HTML tag attributes (e.g. src, href) to check for
   * @param selector   (optional) if strategy is selector: the CSS selectors to use in querySelectorAll()
   * @param includes   (optional) the array of Strings that must be included in the URLs
   * @param excludes   (optional) the array of Strings that must be excluded from the URLs
   * @returns {*} results, the array of results
   * @private
   */
  function findDownloadURLsBySelector(strategy, extensions, tags, attributes, selector, includes, excludes) {
    const items = new Map(), // return value, we use a Map to avoid potential duplicate URLs
          elements = document.querySelectorAll(selector);
    let url = "",
        extension = "",
        attribute = "",
        tag = "";
    console.log("URLI DEBUG: findDownloadURLsBySelector() Found " + elements.length + " elements links");
    for (let element of elements) {
      for (let urlattribute of URL_ATTRIBUTES) {
        if (element[urlattribute]) {
          url = element[urlattribute];
          attribute = urlattribute;
          if (url && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
            extension = findExtension(url);
            // Special Restriction (Extensions)
            if (strategy === "extensions" && (!extension || !extensions.includes(extension))) {
              continue;
            }
            tag = element.tagName ? element.tagName.toLowerCase() : "";
            // Special Restriction (Tags)
            if (strategy === "tags" && (!tag || !tags.includes(tag))) {
              continue;
            }
            // Special Restriction (Attributes)
            if (strategy === "attributes" && (!attribute || !attributes.includes(attribute))) {
              continue;
            }
            items.set(url + "", {"url": url, "extension": extension, "tag": tag, "attribute": attribute});
          }
        }
      }
    }
    return [...items.values()]; // Convert Map values into Array for return value back (Map/Set can't be used)
  }

  /**
   * Finds all the unique properties (extensions, tags, or attributes) from the collection of items.
   *
   * @param items    the items to check
   * @param property the property to check (e.g. "extension", "tag", "attribute")
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
  function findExtension(url) {
    let extension = "";
    if (url && url.length > 0) {
      const regex = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/,
            group = 1,
            urlquestion = url.substring(0, url.indexOf("?")),
            urlhash = !urlquestion ? url.substring(0, url.indexOf("#")) : undefined,
            match = regex.exec(urlquestion ? urlquestion : urlhash ? urlhash : url ? url : "");
      if (match && match[group]) {
        extension = match[group].slice(1); // Remove the . (e.g. .jpeg becomes jpeg)
        if (!isValidExtension(extension)) { // If extension is not valid, throw it out
          extension = "";
        }
      }
    }
    return extension;
  }

  /**
   * Determines if a potential file extension is valid.
   * Arbitrary rules: Extensions must be alphanumeric and under 8 characters
   *
   * @param extension the extension to check
   * @returns {boolean} true if the extension is valid, false if not
   * @private
   */
  function isValidExtension(extension) {
    return extension && extension.trim() !== "" && /^[a-z0-9]+$/i.test(extension) && extension.length <= 8;
  }

  // Return Public Functions
  return {
    previewDownloadURLs: previewDownloadURLs,
    findDownloadURLs: findDownloadURLs
  };
}();