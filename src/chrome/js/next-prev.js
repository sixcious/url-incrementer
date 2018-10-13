/**
 * URL Incrementer
 * @file next-prev.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var NextPrev = (() => {

  // startsWithExcludes helps better prioritize some keywords (e.g. we prefer an "includes" "prev" over a "startsWith" "back")
  //const startsWithExcludes = ["&gt;", ">", "new", "newer", "&lt;", "<", "‹", "back", "old", "older"],

  // urls store important, attributes, and innerHTML links that were found
  const urls = {
    "important":  { "relAttribute": new Map() },
    "attributes": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() },
    "innerHTML":  { "equals": new Map(), "startsWith": new Map(), "includes": new Map() }
  };

  /**
   * Finds the next or prev URL based on the keywords.
   *
   * @param keywords   the next or prev keywords list to use
   * @param priority   the link priority to use: attributes or innerHTML
   * @param sameDomain whether to enforce the same domain policy
   * @returns {string} the next or prev url
   * @public
   */
  function findNextPrevURL(keywords, priority, sameDomain) {
    console.log("findNextPrevURL() - keywords=" + keywords + ", priority=" + priority + ", sameDomain=" + sameDomain);
    const priority2 = priority === "attributes" ? "innerHTML" : "attributes",
          algorithms = [ // note: the order matters, the highest priority algorithms are first when they are iterated below
            { "priority": "important", "subpriority": ["relAttribute"] },
            { "priority": priority,    "subpriority": ["equals"]       },
            { "priority": priority2,   "subpriority": ["equals"]       },
            { "priority": priority,    "subpriority": ["startsWith", "includes"] },
            { "priority": priority2,   "subpriority": ["startsWith", "includes"] }
          ];
    buildURLs(keywords, sameDomain);
    for (const algorithm of algorithms) {
      const url = traverseResults(algorithm.priority, algorithm.subpriority, keywords);
      if (url) { return url; }
    }
    return "";
  }

  /**
   * Traverses the urls results object to see if a URL was found.
   * e.g. urls[attributes][equals][nextKeyword]
   *
   * @param priority    the link priority to use: attributes or innerHTML
   * @param subpriority the sub priority to use: equals, startsWith, includes
   * @param keywords    the ordered list of keywords sorted in priority
   * @returns {string} the url (if found)
   * @private
   */
  function traverseResults(priority, subpriorities, keywords) {
    for (const keyword of keywords) {
      for (const subpriority of subpriorities) {
        if (urls[priority][subpriority].has(keyword)) {
          console.log("traverseResults() - a next/prev Link was found:" +  priority + " - " + subpriority + " - " + keyword + " - " + url);
          return urls[priority][subpriority].get(keyword);
        }
      }
    }
    return undefined;
  }

  /**
   * Builds the urls results object by parsing all link and anchor elements.
   * 
   * @param keywords   the next or prev keywords list to use
   * @param sameDomain whether to enforce the same domain policy
   * @private
   */
  function buildURLs(keywords, sameDomain) {
    // Note: The following DOM elements contain links: link, a, area, and base
    const elements = document.querySelectorAll("link[href], a[href], area[href]"),
          hostname = window.location.hostname;
    parseElements(keywords, elements, hostname, sameDomain);
  }

  /**
   * Parses the elements by examining if their attributes or innerHTML contain
   * next or prev keywords in them.
   *
   * @param keywords   the next or prev keywords list to use
   * @param elements   the DOM elements to parse: links or anchors
   * @param hostname   the document's hostname used to verify if URLs are in the same domain
   * @param sameDomain whether to enforce the same domain policy
   * @private
   */
  function parseElements(keywords, elements, hostname, sameDomain) {
    for (const element of elements) {
      if (!element.href) {
        continue;
      }
      try { // Check if URL is in same domain if enabled, wrap in try/catch in case of exceptions with URL object
        const url = new URL(element.href);
        if (sameDomain && url.hostname !== hostname) {
          continue;
        }
      } catch (e) {
        console.log("parseElements() - exception caught:" + e);
        continue;
      }
      parseText(keywords, "innerHTML", element.href, element.innerHTML.trim().toLowerCase(), "");
      for (const attribute of element.attributes) {
        parseText(keywords, "attributes", element.href, attribute.nodeValue.trim().toLowerCase(), attribute.nodeName.toLowerCase());
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev
   * link. Adds the link to the urls map if a match is found.
   *
   * @param keywords  the next or prev keywords list to use
   * @param type      the type of element text: attributes or innerHTML
   * @param href      the URL to set this link to
   * @param text      the element's text to parse keywords from
   * @param attribute attribute's node name if it's needed
   * @private
   */
  function parseText(keywords, type, href, text, attribute) {
    // Iterate over this direction's keywords and build out the urls object's maps
    for (const keyword of keywords) {
      if (type === "attributes" && attribute === "rel" && text === keyword) { // important e.g. rel="next" or rel="prev"
        urls.important.relAttribute.set(keyword, href);
      } else if (text === keyword) {
        urls[type].equals.set(keyword, href);
      } else if (text.startsWith(keyword) && !startsWithExcludes.includes(keyword)) {
        urls[type].startsWith.set(keyword, href);
      } else if (text.includes(keyword)) {
        urls[type].includes.set(keyword, href);
      }
    }
  }

  // Return Public Functions
  return {
    findNextPrevURL: findNextPrevURL
  };
})();