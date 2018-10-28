/**
 * URL Incrementer
 * @file download.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Download = (() => {

  // A list of all attributes that can contain URLs (Note the following URL attributes are deprecated in HTML5: background, classid, codebase, longdesc, profile)
  const URL_ATTRIBUTES = ["action", "cite", "data", "formaction", "href", "icon", "manifest", "poster", "src", "style", "usemap"];

  /**
   * Finds the current page URL and all URLs, extensions, tags, and attributes on the page to build a
   * download preview.
   *
   * @returns {*} results, the page URL, the array of all URLs items, all extensions, all tags, and all attributes
   * @public
   */
  function previewDownloadURLs() {
    const pageURL = findDownloadURLs("page"),
          allURLs = findDownloadURLs("all"),
          allExtensions = findProperties(allURLs, "extension"),
          allTags = findProperties(allURLs, "tag"),
          allAttributes = findProperties(allURLs, "attribute");
    return { "pageURL": pageURL, "allURLs": allURLs, "allExtensions": allExtensions, "allTags": allTags, "allAttributes": allAttributes }
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
    // items is an intermediate return value, we use a Map to avoid potential duplicate URLs, but we can't return a map
    // so results is the final return value from the map (an array because we can't return a map from a content script)
    const items = new Map();
    let results = [],
        selectorbuilder = "";
    switch (strategy) {
      case "all":
      // Noticed issues with using a selectorbuilder based on the extensions so put it with all for now
      case "extensions":
        for (const urlattribute of URL_ATTRIBUTES) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[" + urlattribute + "]";
        }
        break;
      case "tags":
        for (const tag of tags) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + tag;
        }
        break;
      case "attributes":
        for (const attribute of attributes) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[" + attribute + "]";
        }
        break;
      case "selector":
        selectorbuilder = selector;
        break;
      case "page":
        break;
      default:
        break;
    }
    try {
      if (strategy === "page") {
        results = findPageURL(includes, excludes, items);
      } else {
        results = findDownloadURLsBySelector(document, strategy, extensions, tags, attributes, selectorbuilder, includes, excludes, items);
      }
    } catch (e) {
      console.log("findDownloadURLs() - exception caught:" + e);
      results = [];
    }
    return results;
  }

  /**
   * Finds the current web page's URL.
   *
   * @param includes (optional) the array of Strings that must be included in the URL
   * @param excludes (optional) the array of Strings that must be excluded from the URL
   * @param items    the items map
   * @returns {*} results, the array of results
   * @private
   */
  function findPageURL(includes, excludes, items) {
    const url = window.location.href;
    buildItems(items, undefined, "", url, "page", undefined, undefined, undefined, undefined, includes, excludes);
    // Convert Map values into Array for return value back (Map/Set can't be used)
    return [...items.values()];
  }

  /**
   * Finds all URLs that match the specified strategy and applicable parameters. Performs a query on the page's elements
   * and checks each element to see if it passes the strategy's rules.
   *
   * @param document   the document to query against (this is a parameter to allow searching thru nested iframes)
   * @param strategy   the download strategy to employ
   * @param extensions (optional) if strategy is extensions: the file extensions to check for
   * @param tags       (optional) if strategy is tags: the HTML tags (e.g. <img>) to check for
   * @param attributes (optional) if strategy is attributes: the HTML tag attributes (e.g. src, href) to check for
   * @param selector   (optional) if strategy is selector: the CSS selectors to use in querySelectorAll()
   * @param includes   (optional) the array of Strings that must be included in the URLs
   * @param excludes   (optional) the array of Strings that must be excluded from the URLs
   * @param items      the items map
   * @returns {*} results, the array of results
   * @private
   */
  function findDownloadURLsBySelector(document, strategy, extensions, tags, attributes, selector, includes, excludes, items) {
    const elements = document.querySelectorAll(selector),
          origin = new URL(window.location.href).origin;
    console.log("findDownloadURLsBySelector() - found " + elements.length + " element(s)");
    for (const element of elements) {
      for (const attribute of URL_ATTRIBUTES) {
        if (element[attribute]) {
          // The style attribute might contain multiple URLs
          if (attribute && attribute.toLowerCase() === "style") {
            const urls = extractURLsFromStyle(element.style);
            for (const url of urls) {
              buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
            }
          }
          // The iframe tag's document can be searched if it's the same origin of this document
          else if (element.tagName && element.tagName.toLowerCase() === "iframe" && attribute && attribute.toLowerCase() === "src") {
            const url = element[attribute];
            buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
            console.log("findDownloadURLsBySelector() - iframe encountered, document origin=" + origin + ", iframe origin=" + new URL(url).origin);
            if (isValidURL(url) && new URL(url).origin === origin && element.contentWindow && element.contentWindow.document) {
              findDownloadURLsBySelector(element.contentWindow.document, strategy, extensions, tags, attributes, selector, includes, excludes, items);
            }
          } else {
            const url = element[attribute];
            buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
          }
        }
      }
    }
    // Convert Map values into Array for return value back (Map/Set can't be used)
    return [...items.values()];
  }

  /**
   * Finds all URLs that match the specified strategy and applicable parameters. Performs a query on the page's elements
   * and checks each element to see if it passes the strategy's rules.
   *
   * @param items      the items map
   * @param element    the element that contained the attribute
   * @param attribute  the attribute that contained the URL
   * @param url        the URL to check
   * @param strategy   the download strategy to employ
   * @param extensions (optional) if strategy is extensions: the file extensions to check for
   * @param tags       (optional) if strategy is tags: the HTML tags (e.g. <img>) to check for
   * @param attributes (optional) if strategy is attributes: the HTML tag attributes (e.g. src, href) to check for
   * @param selector   (optional) if strategy is selector: the CSS selectors to use in querySelectorAll()
   * @param includes   (optional) the array of Strings that must be included in the URLs
   * @param excludes   (optional) the array of Strings that must be excluded from the URLs
   * @private
   */
  function buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes) {
    let filenameAndExtension = "",
        filename = "",
        extension = "",
        tag = "";
    if (isValidURL(url) && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
      filenameAndExtension = findFilenameAndExtension(url);
      filename = findFilename(filenameAndExtension);
      extension = findExtension(filenameAndExtension);
      // Special Restriction (Extensions)
      if (strategy === "extensions" && (!extension || !extensions.includes(extension))) {
        return;
      }
      tag = element && element.tagName ? element.tagName.toLowerCase() : "";
      // Special Restriction (Tags)
      if (strategy === "tags" && (!tag || !tags.includes(tag))) {
        return;
      }
      // Special Restriction (Attributes)
      if (strategy === "attributes" && (!attribute || !attributes.includes(attribute))) {
        return;
      }
      items.set(url + "", {"url": url, "filenameAndExtension": filenameAndExtension, "filename": filename, "extension": extension, "tag": tag, "attribute": attribute});
    }
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
      for (const item of items) {
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
      for (const term of terms) {
        if (term && doesInclude ? !url.includes(term) : url.includes(term)) {
          does = false;
          break;
        }
      }
    }
    return does;
  }

  /**
   * Finds the URLs from a CSS inline style.
   *
   * @param style the CSS style
   * @returns {Array} the URLs array extracted from the style, if it exists
   * @private
   */
  function extractURLsFromStyle(style) {
    const urls = [];
    if (style) {
      const URL_STYLE_PROPERTIES =  ["background", "background-image", "list-style", "list-style-image", "content", "cursor", "play-during", "cue", "cue-after", "cue-before", "border-image", "border-image-source", "mask", "mask-image", "@import", "@font-face"],
            regex =  /\s*url\s*\(\s*(?:'(\S*?)'|"(\S*?)"|((?:\\\s|\\\)|\\\"|\\\'|\S)*?))\s*\)/i;
      for (const property of URL_STYLE_PROPERTIES) {
        if (style[property]) {
          const match = regex.exec(style[property]);
          // TODO: Check other groups from this regex?
          const url = match ? match[2] ? match[2] : "" : "";
          console.log("extractURLFromStyle() - style property=" + property + ", style[property]=" + style[property] + ", and url=" + url);
          urls.push(url);
        }
      }
    }
    return urls;
  }

  /**
   * Finds the filename joined together with its extension from a URL.
   *
   * @param url the URL to parse
   * @returns {string} the filename and extension joined together
   * @private
   */
  function findFilenameAndExtension(url) {
    let filenameAndExtension = "";
    if (url) {
      filenameAndExtension = url.split('#').shift().split('?').shift().split('/').pop();
    }
    return filenameAndExtension;
  }

  /**
   * Finds the filename from a string containing a filename and extension joined together.
   *
   * @param filenameAndExtension the filename and extension (joined together) to parse
   * @returns {string} the filename (if found)
   * @private
   */
  function findFilename(filenameAndExtension) {
    let filename = "";
    if (filenameAndExtension) {
      filename = filenameAndExtension.split('.').shift();
    }
    return filename;
  }

  /**
   * Finds the extension from a string containing a filename and extension joined together.
   *
   * @param filenameAndExtension the filename and extension (joined together) to parse
   * @returns {string} the extension (if found)
   * @private
   */
  function findExtension(filenameAndExtension) {
    let extension = "";
    if (filenameAndExtension && filenameAndExtension.includes(".")) {
      extension = filenameAndExtension.split('.').pop();
      // If extension is not valid, throw it out
      if (!isValidExtension(extension)) {
        extension = "";
      }
    }
    return extension;
  }

  /**
   * Determines if a potential URL is a valid download URL.
   * Arbitrary rules: URLs must be Strings and not start with mailto.
   *
   * @param url the URL to parse
   * @returns {boolean} true if the URL is a download URL, false otherwise
   * @private
   */
  function isValidURL(url) {
    return url && typeof url === "string" && url.trim().length > 0 && !url.startsWith("mailto");
  }

  /**
   * Determines if a potential file extension is valid.
   * Arbitrary rules: Extensions must be alphanumeric and under 8 characters.
   *
   * @param extension the extension to check
   * @returns {boolean} true if the extension is valid, false if not
   * @private
   */
  function isValidExtension(extension) {
    return extension && extension.trim().length > 0 && /^[a-z0-9\\.]+$/i.test(extension) && extension.length <= 8;
  }

  // Return Public Functions
  return {
    previewDownloadURLs: previewDownloadURLs,
    findDownloadURLs: findDownloadURLs
  };

})();