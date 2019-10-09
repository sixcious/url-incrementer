/**
 * URL Incrementer
 * @file next-prev.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var NextPrev = (() => {

  // The urls object stores important, attributes, and innerHTML links that were found
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
   * @param domId      Infy Scroll: the DOM ID of the parent of the elements to search thru
   * @returns {*} the next or prev url (if found) along with the subtype and keyword that was used to find it
   * @public
   */
  function findNextPrevURL(keywords, priority, sameDomain, domId) {
    console.log("findNextPrevURL() - keywords=" + keywords + ", priority=" + priority + ", sameDomain=" + sameDomain);
    const priority2 = priority === "attributes" ? "innerHTML" : "attributes";
    // Note: the order matters, the highest priority algorithms are first when they are iterated below
    const algorithms = [
      { "type": "important", "subtypes": ["relAttribute"] },
      { "type": priority,    "subtypes": ["equals"] },
      { "type": priority2,   "subtypes": ["equals"] },
      // Combined startsWith and includes for priority on keywords instead of the subtypes
      { "type": priority,    "subtypes": ["startsWith", "includes"] },
      { "type": priority2,   "subtypes": ["startsWith", "includes"] }
    ];
    buildURLs(keywords, sameDomain, domId);
    for (const algorithm of algorithms) {
      const result = traverseResults(algorithm.type, algorithm.subtypes, keywords);
      if (result) { return result; }
    }
  }

  /**
   * Traverses the urls results object to see if a URL was found. e.g. urls[attributes][equals][next]
   *
   * @param type     the link type to use: important, attributes or innerHTML
   * @param subtypes the subtypes to use: relAttribute, equals, startsWith, includes
   * @param keywords the ordered list of keywords sorted in priority
   * @returns {*} the next or prev url (if found) along with the subtype and keyword that was used to find it
   * @private
   */
  function traverseResults(type, subtypes, keywords) {
    for (const keyword of keywords) {
      for (const subtype of subtypes) {
        if (urls[type][subtype].has(keyword)) {
          console.log("traverseResults() - a next/prev link was found:" +  type + " - " + subtype + " - " + keyword + " - " + urls[type][subtype].get(keyword));
          return {url: urls[type][subtype].get(keyword), subtype: subtype, keyword: keyword};
        }
      }
    }
  }

  /**
   * Builds the urls results object by parsing all link and anchor elements.
   * 
   * @param keywords   the next or prev keywords list to use
   * @param sameDomain whether to enforce the same domain policy
   * @param domId      Infy Scroll: the DOM ID of the parent of the elements to search thru
   * @private
   */
  function buildURLs(keywords, sameDomain, domId) {
    // Infy Scroll: document_ will be the frame document or the only document and parentId is used for DOM mode
    // Note: The following DOM elements contain links: link, a, area, and base
    const domObject = domId ? document.getElementById(domId) : undefined;
    const document_ = domObject && domObject.contentDocument ? domObject.contentDocument : document;
    const parentId = domId && domObject && !domObject.contentDocument ? domId + " " : "";
    const elements = document_.querySelectorAll(parentId + "link[href], " + parentId + "a[href], " + parentId + "area[href]");
    const hostname = window.location.hostname;
    for (const element of elements) {
      // Check if URL is in same domain if enabled, wrap in try/catch in case of exceptions with URL object
      try {
        const url = new URL(element.href);
        if (sameDomain && url.hostname !== hostname) {
          continue;
        }
        parseText(keywords, "innerHTML", element.href, element.innerHTML.trim().toLowerCase(), "");
        for (const attribute of element.attributes) {
          parseText(keywords, "attributes", element.href, attribute.nodeValue.trim().toLowerCase(), attribute.nodeName.toLowerCase());
        }
      } catch (e) {
        console.log("parseElements() - exception caught:" + e);
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev link.
   * Adds the link to the urls map if a match is found.
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
      // Important e.g. rel="next" or rel="prev"
      if (attribute && attribute === "rel" && text === keyword) {
        urls.important.relAttribute.set(keyword, href);
      } else if (text === keyword) {
        urls[type].equals.set(keyword, href);
      } else if (text.startsWith(keyword)) {
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