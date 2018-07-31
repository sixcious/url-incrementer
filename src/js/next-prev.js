/**
 * URL Incrementer Next Prev
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.NextPrev = function () {

  // Keywords are ordered in priority
  // startsWithExcludes helps better prioritize some keywords (e.g. we prefer an "includes" "prev" over a "startsWith" "back")
  const keywords = {
    "next": ["next", "forward", "次", "&gt;", ">", "newer", "new"],
    "prev": ["prev", "previous", "前", "&lt;", "<", "‹", "back", "older", "old"],
    "startsWithExcludes": ["&gt;", ">", "new", "&lt;", "<", "‹", "back", "old"]
  },
  // urls store important, attributes, and innerHTML links that were found
  urls = {
    "important":  { "relAttribute": new Map() },
    "attributes": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() },
    "innerHTML":  { "equals": new Map(), "startsWith": new Map(), "includes": new Map() }
  };

  /**
   * Finds the next or prev URL.
   *
   * @param direction  the direction to go: next or prev
   * @param priority   the link priority to use: attributes or innerHTML
   * @param sameDomain whether to enforce the same domain policy
   * @return {string} the next or prev url
   * @public
   */
  function findNextPrevURL(direction, priority, sameDomain) {
    console.log("URLI.NextPrev.findNextPrevURL() - direction=" + direction);
    const priority2 = priority === "attributes" ? "innerHTML" : "attributes",
          algorithms = [ // note: the order matters, the highest priority algorithms are first when they are iterated below
            { "priority": "important", "subpriority": "relAttribute" },
            { "priority": priority,    "subpriority": "equals"       },
            { "priority": priority2,   "subpriority": "equals"       },
            { "priority": priority,    "subpriority": "startsWith"   },
            { "priority": priority2,   "subpriority": "startsWith"   },
            { "priority": priority,    "subpriority": "includes"     },
            { "priority": priority2,   "subpriority": "includes"     }
          ];
    buildURLs(direction, sameDomain);
    for (let algorithm of algorithms) {
      const url = traverseResults(algorithm.priority, algorithm.subpriority, keywords[direction]);
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
   * @return {string} the url (if found)
   * @private
   */
  function traverseResults(priority, subpriority, keywords) {
    let url = "";
    for (let keyword of keywords) {
      if (urls[priority][subpriority].has(keyword)) {
        url = urls[priority][subpriority].get(keyword);
        console.log("URLI.NextPrev.traverseResults() - a next/prev Link was found:" +  priority + " - " + subpriority + " - " + keyword + " - " + url);
        break;
      }
    }
    return url;
  }

  /**
   * Builds the urls results object by parsing all link and anchor elements.
   * 
   * @param direction  the direction to go: next or prev
   * @param sameDomain whether to enforce the same domain policy
   * @private
   */
  function buildURLs(direction, sameDomain) {
    // Note: The following DOM elements contain links: link, a, area, and base
    const elements = document.querySelectorAll("link[href], a[href], area[href]"),
          hostname = document.location.hostname;
    parseElements(direction, elements, hostname, sameDomain);
  }

  /**
   * Parses the elements by examining if their attributes or innerHTML contain
   * next or prev keywords in them.
   *
   * @param direction  the direction to go: next or prev
   * @param elements   the DOM elements to parse: links or anchors
   * @param hostname   the document's hostname used to verify if URLs are in the same domain
   * @param sameDomain whether to enforce the same domain policy
   * @private
   */
  function parseElements(direction, elements, hostname, sameDomain) {
    for (let element of elements) {
      if (!element.href) {
        continue;
      }
      try { // Check if URL is in same domain if enabled, wrap in try/catch in case of exceptions with URL object
        const url = new URL(element.href);
        if (sameDomain && url.hostname !== hostname) {
          continue;
        }
      } catch (e) {
        continue;
      }
      parseText(direction, "innerHTML", element.href, element.innerHTML.trim().toLowerCase(), "");
      for (let attribute of element.attributes) {
        parseText(direction, "attributes", element.href, attribute.nodeValue.trim().toLowerCase(), attribute.nodeName.toLowerCase());
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev
   * link. Adds the link to the urls map if a match is found.
   * 
   * @param direction the direction to go: next or prev
   * @param type      the type of element text: attributes or innerHTML
   * @param href      the URL to set this link to
   * @param text      the element's text to parse keywords from
   * @param attribute attribute's node name if it's needed
   * @private
   */
  function parseText(direction, type, href, text, attribute) {
    // Iterate over this direction's keywords and build out the urls object's maps
    for (let keyword of keywords[direction]) {
      if (type === "attributes" && attribute === "rel" && text === keyword) { // important e.g. rel="next" or rel="prev"
        urls.important.relAttribute.set(keyword, href);
      } else if (text === keyword) {
        urls[type].equals.set(keyword, href);
      } else if (text.startsWith(keyword) && keywords.startsWithExcludes.indexOf(keyword) < 0) { // startsWithExcludes
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
}();