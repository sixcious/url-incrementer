/**
 * URL Incrementer Next Prev
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.NextPrev = URLI.NextPrev || function () {
  
  var urls = {attributes: {}, innerHTML: {}};
  
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
    return urls[priority][direction] ? urls[priority][direction] : urls[priority === "attributes" ? "innerHTML" : "attributes"][direction];
  }

  /**
   * Gets the next and prev links in the document by parsing all link and anchor
   * elements.
   *
   * Note: the document is passed in as a param to to build the links. The
   * document varies depending on the context of when this code is run:
   *
   * 1: If ran as a content_script (via a call from chrome.tabs.executeScript),
   *    it will pass in that tab's document natively
   *
   * 2: If ran in the background (via a call from background.js), it will pass
   *    in a document created from an Ajax XMLHttpRequest response
   *
   * @param doc the document to use based on the callee's context
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
    if (text.indexOf("next") !== -1) {
      urls[type].next = href;
    } else if (text.indexOf("forward") !== -1) {
      urls[type].forward = href;
    } else if (text.indexOf("new") !== -1) {
      urls[type].new = href;
    } else if (text.indexOf(">") !== -1) {
      urls[type].gt = href;
    } else if (text.indexOf("prev") !== -1) {
      urls[type].prev = href;
    } else if (text.indexOf("back") !== -1) {
      urls[type].back = href;
    } else if (text.indexOf("old") !== -1) {
      urls[type].old = href;
    } else if (text.indexOf("<") !== -1) {
      urls[type].lt = href;
    }
  }

  // Return Public Functions
  return {
    getURL: getURL
  };
}();