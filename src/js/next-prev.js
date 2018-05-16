/**
 * URL Incrementer Next Prev
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.NextPrev = URLI.NextPrev || function () {

  const nextKeywords = ["next", "forward", "new", ">"],
        prevKeywords = ["prev", "back", "old", "<"],
        urls = {
          "next": {
            "attributes": new Map(),
            "innerHTML": new Map()
          },
          "prev": {
            "attributes": new Map(),
            "innerHTML": new Map()
          }
        };
  //
  // var urls = {attributes: {}, innerHTML: {}};
  
  /**
   * Gets the URL by examining the links object based off of the requested
   * priority and direction.
   *
   * @param priority  the link priority to use: attributes or innerHTML
   * @param direction the direction to go: next or prev
   * @param links     the links object to use
   * @return url the url to use based on the parameters
   * @public
   */
  function getURL(direction, priority, sameDomainPolicyEnabled) {
    buildURLs(sameDomainPolicyEnabled);
    //return urls[priority][direction] ? urls[priority][direction] : urls[priority === "attributes" ? "innerHTML" : "attributes"][direction];
    var url = "",
        keywords = direction === "next" ? nextKeywords : prevKeywords,
        otherPriority = priority === "attributes" ? "innerHTML" : "attributes";
    for (let keyword of keywords) {
      if (urls[direction][priority].has(keyword)) {
        url = urls[direction][priority].get(keyword);
        break;
      }
    }
    if (!url) {
      for (let keyword of keywords) {
        if (urls[direction][otherPriority].has(keyword)) {
          url = urls[direction][otherPriority].get(keyword);
          break;
        }
      }
    }
    return url;
  }

  /**
   * Gets the next and prev links in the document by parsing all link and anchor
   * elements.
   *
   * @param sameDomainPolicyEnabled whether to enforce the same domain policy
   * @return links the links containing the next and prev links (if any)
   * @private
   */
  function buildURLs(sameDomainPolicyEnabled) {
    // Note: The following DOM elements contain links: link, a, area, and base
    var links = document.getElementsByTagName("link"),
        anchors = document.links, // Includes all anchor and area elements
        origin = document.location.origin;
    parseElements(links, sameDomainPolicyEnabled, origin);
    parseElements(anchors, sameDomainPolicyEnabled, origin);
  }

  /**
   * Parses the elements by examining if their attributes or innerHTML contain
   * next or prev keywords in them.
   *
   * @param elements the DOM elements to parse
   * @param links    the links object to use
   * @private
   */
  function parseElements(elements, sameDomainPolicyEnabled, origin) {
    var element,
        attributes,
        attribute,
        urlo,
        i,
        j;
    for (i = 0; i < elements.length; i++) {
      element = elements[i];
      if (!element.href) {
        continue;
      }
      urlo = new URL(element.href);
      if (sameDomainPolicyEnabled && urlo.origin !== origin) {
        continue;
      }
      parseText(element.innerHTML.toLowerCase(), "innerHTML", element.href);
      attributes = element.attributes;
      for (j = 0; j < attributes.length; j++) {
        attribute = attributes[j];
        // TODO: Separate by attribute.nodeName.toLowerCase()
        parseText(attribute.nodeValue.toLowerCase(), "attributes", element.href);
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev
   * links and builds the links object if found.
   *
   * @param text the text to parse keywords from
   * @param type the link type: innerHTML or attributes
   * @param href the URL to set this link to
   * @private
   */
  function parseText(text, type, href) {
    for (let nextKeyword of nextKeywords) {
      if (text.includes(nextKeyword)) {
        urls.next[type].set(nextKeyword, href);
      }
    }
    for (let prevKeyword of prevKeywords) {
      if (text.includes(prevKeyword)) {
        urls.prev[type].set(prevKeyword, href);
      }
    }

    // if (text.indexOf("next") !== -1) {
    //   urls[type].next = href;
    // } else if (text.indexOf("forward") !== -1) {
    //   urls[type].forward = href;
    // } else if (text.indexOf("new") !== -1) {
    //   urls[type].new = href;
    // } else if (text.indexOf(">") !== -1) {
    //   urls[type].gt = href;
    // } else if (text.indexOf("prev") !== -1) {
    //   urls[type].prev = href;
    // } else if (text.indexOf("back") !== -1) {
    //   urls[type].back = href;
    // } else if (text.indexOf("old") !== -1) {
    //   urls[type].old = href;
    // } else if (text.indexOf("<") !== -1) {
    //   urls[type].lt = href;
    // }
  }

  // Return Public Functions
  return {
    getURL: getURL
  };
}();