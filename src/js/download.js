/**
 * URL Incrementer Download
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Download = function () {

  // A list of all attributes that can contain URLs (Note the following URL attributes are deprecated in HTML5: background, classid, codebase, longdesc, profile)
  // List derived from Daniel DiPaolo @ stackoverflow.com @see https://stackoverflow.com/a/2725168
  const URL_ATTRIBUTES = ["action", "cite", "data", "formaction", "href", "icon", "manifest", "poster", "src", "usemap", "style"];

  // let items = new Map(); TODO...

  /**
   * Finds the current page URL and all URLs, extensions, tags, and attributes on the page to build a
   * download preview.
   *
   * @returns {*} results, the array of all URLs items, all extensions, all tags, and all attributes
   * @public
   */
  function previewDownloadURLs() {
    const  pageURL = findDownloadURLs("page"),//findPageURL(),
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
    let results = [],
        selectorbuilder = "";
    switch (strategy) {
      case "all":
      case "extensions": // Noticed issues with using a selectorbuilder based on the extensions so go with all for this for now
        for (let urlattribute of URL_ATTRIBUTES) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + "[" + urlattribute + "]";
        }
        break;
      case "tags":
        for (let tag of tags) {
          selectorbuilder += (selectorbuilder !== "" ? "," : "") + tag;
        }
        break;
      case "attributes":
        for (let attribute of attributes) {
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
        results = findPageURL(includes, excludes);
      } else {
        results = findDownloadURLsBySelector(strategy, extensions, tags, attributes, selectorbuilder, includes, excludes);
      }
    } catch (e) {
      console.log("URLI.Download.findDownloadURLs() - exception caught:" + e);
      results = [];
    }
    return results;
  }

  /**
   * Finds the current web page's URL.
   *
   * @param includes (optional) the array of Strings that must be included in the URL
   * @param excludes (optional) the array of Strings that must be excluded from the URL
   * @returns {*} results, the array of results
   * @private
   */
  function findPageURL(includes, excludes) {
    const items = new Map(),
          url = document.location.href;
    buildItems(items, undefined, undefined, url, "page", undefined, undefined, undefined, undefined, includes, excludes);
    return [...items.values()]; // Convert Map values into Array for return value back (Map/Set can't be used)
    // if (isValidURL(url) && doesIncludeOrExclude(url, includes, true) && doesIncludeOrExclude(url, excludes, false)) {
    //   return [{"url": url, "extension": findExtension(url), "tag": "", "attribute": ""}];
    //   //return [{"url": url, "filenameAndExtension": filenameAndExtension, "filename": filename, "extension": extension, "tag": "", "attribute": ""}];
    // } else {
    //   return [];
    // }
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
          elements = document.querySelectorAll(selector),
          origin = new URL(document.location.href).origin;
    console.log("URLI.Download.findDownloadURLsBySelector() - found " + elements.length + " element(s)");
    for (let element of elements) {
      for (let attribute of URL_ATTRIBUTES) {
        if (element[attribute]) {
          // The style attribute might contain multiple URLs
          if (attribute && attribute.toLowerCase() === "style") {
            const urls = extractURLsFromStyle(element.style);
            for (let url of urls) {
              buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
            }
          } else if (element.tagName && element.tagName.toLowerCase() === "iframe" && attribute && attribute.toLowerCase() === "src") {
            const url = element[attribute];
            buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
            console.log("found iframe, origin=" + origin);
            console.log("found iframe, iframe=" + new URL(url).origin);
            if (new URL(url).origin === origin) {
              extractURLsFromIframe(items, element, strategy, extensions, tags, attributes, selector, includes, excludes);
            }
          } else {
            const url = element[attribute];
            buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
          }
        }
      }
    }
    return [...items.values()]; // Convert Map values into Array for return value back (Map/Set can't be used)
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
      for (let item of items) {
        if (item && item[property]) {
          properties.add(item[property]);
        }
      }
    }
    return [...properties].sort();
  }

  // TODO
  function isValidURL(url) {
    return url && typeof url === "string" && url.trim().length > 0 && !url.startsWith("mailto");
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

  function findFilenameAndExtension(url) {
    let filenameAndExtension = "";
    if (url) {
      // TODO:
      // by hayatbiralem
      // @see https://stackoverflow.com/questions/511761/js-function-to-get-filename-from-url/2480287#comment61576914_17143667
      filenameAndExtension = url.split('#').shift().split('?').shift().split('/').pop(); // TODO Replace? replace(/a/, ""); //;//.replace(/\..*/, "").replace(/[\W_]+/,"");
    }
    return filenameAndExtension;

  }


  function findFilename(filenameAndExtension) {
    let filename = "";
    if (filenameAndExtension) {
      filename = filenameAndExtension.split('.').shift();
    }
    return filename;
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
  function findExtension(filenameAndExtension) {
    let extension = "";
    // if (url) {
    //   const regex = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/,
    //         group = 1,
    //         urlquestion = url.substring(0, url.indexOf("?")),
    //         urlhash = !urlquestion ? url.substring(0, url.indexOf("#")) : undefined,
    //         match = regex.exec(urlquestion ? urlquestion : urlhash ? urlhash : url ? url : "");
    //   if (match && match[group]) {
    //     extension = match[group].slice(1); // Remove the . (e.g. .jpeg becomes jpeg)
    //     if (!isValidExtension(extension)) { // If extension is not valid, throw it out
    //       extension = "";
    //     }
    //   }
    // }
    if (filenameAndExtension && filenameAndExtension.includes(".")) {
      extension = filenameAndExtension.split('.').pop();
      //extension = filenameAndExtension.substr(filenameAndExtension.indexOf(".") + 1);
      if (!isValidExtension(extension)) { // If extension is not valid, throw it out
        extension = "";
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
    return extension && extension.trim() !== "" && /^[a-z0-9\\.]+$/i.test(extension) && extension.length <= 8;
  }

  /**
   * Finds the URLs from a CSS inline style.
   * Regex to find the URL from a CSS style is by Alex Z @ stackoverflow.com
   * Style properties that can have URLs is by Chad Scira et all @ stackoverflow.com
   *
   * @param style the CSS style
   * @returns {Array} the URLs array extracted from the style, if it exists
   * @see https://stackoverflow.com/a/34166861
   * @see https://stackoverflow.com/q/24730939
   * @private
   */
  function extractURLsFromStyle(style) {
    const urls = [];
    if (style) {
      const URL_STYLE_PROPERTIES =  ["background", "background-image", "list-style", "list-style-image", "content", "cursor", "play-during", "cue", "cue-after", "cue-before", "border-image", "border-image-source", "mask", "mask-image", "@import", "@font-face"],
            regex =  /\s*url\s*\(\s*(?:'(\S*?)'|"(\S*?)"|((?:\\\s|\\\)|\\\"|\\\'|\S)*?))\s*\)/i;
      for (let property of URL_STYLE_PROPERTIES) {
        if (style[property]) {
          const match = regex.exec(style[property]);
          const url = match ? match[2] ? match[2] : "" : ""; // TODO: Check other groups from this regex?
          console.log("URLI.Download.extractURLFromStyle() - style property=" + property + ", style[property]=" + style[property] + ", and url=" + url);
          urls.push(url);
        }
      }
    }
    return urls;
  }

  // TODO: Rewrite findDownloadURLs by selector to accept a document and then rewrite this method...
  function extractURLsFromIframe(items, iframe, strategy, extensions, tags, attributes, selector, includes, excludes)  {
    if (iframe) {
      const elements = iframe.contentWindow.document.querySelectorAll(selector);
      console.log("URLI.Download.extractURLsFromIframe() - found " + elements.length + " element(s)");
      for (let element of elements) {
        for (let attribute of URL_ATTRIBUTES) {
          const url = element[attribute];
          buildItems(items, element, attribute, url, strategy, extensions, tags, attributes, selector, includes, excludes);
        }
      }
    }
  }

  // Return Public Functions
  return {
    previewDownloadURLs: previewDownloadURLs,
    findDownloadURLs: findDownloadURLs
  };
}();