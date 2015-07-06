/**
 * URL Next Plus Next Prev
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.NextPrev = URLNP.NextPrev || function () {

  /**
   * TODO
   */ 
  function getLinksViaExecuteScript(tabId, callback) {
    chrome.tabs.executeScript(tabId, {file: "js/next-prev.js", runAt: "document_end"}, function() {
      var code = "URLNP.NextPrev.getLinks(document);";
      chrome.tabs.executeScript(tabId, {code: code, runAt: "document_end"}, function(results){
        callback(results[0]);
      });
    });
  }

  /**
   * TODO
   * 
   */ 
  function getLinksViaXHR(url, callback) {
    console.log("getting url in xhr" + url);
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "document";
    req.onload = function() { // Equivalent to onreadystate and checking 4
      callback(getLinks(this.responseXML));
    };
    req.send();
  }

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
  function getURL(priority, direction, links) {
    return links[priority][direction] ? links[priority][direction] : links[priority === "attributes" ? "innerHTML" : "attributes"][direction];
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
   * @return links the links containing the next and prev links (if any)
   * @private
   */
  function getLinks(doc) {
    // Note: The following DOM elements contain links: link, a, area, and base
    var links = {attributes: {}, innerHTML: {}},
        links_ = doc.getElementsByTagName("link"),
        anchors = doc.links; // Includes all anchor and area elements
    parseElements(links_, links);
    parseElements(anchors, links);
    return links;
  }

  /**
   * Parses the elements by examining if their attributes or innerHTML contain
   * next or prev keywords in them.
   * 
   * @param elements the DOM elements to parse
   * @param links    the links object to use
   * @private
   */
  function parseElements(elements, links) {
    var element,
        attributes,
        attribute,
        i,
        j;
    for (i = 0; i < elements.length; i++) {
      element = elements[i];
      if (!element.href) {
        continue;
      }
      parseText(element.innerHTML.toLowerCase(), "innerHTML", element.href, links);
      attributes = element.attributes;
      for (j = 0; j < attributes.length; j++) {
        attribute = attributes[j];
        parseText(attribute.nodeValue.toLowerCase(), "attributes", element.href, links);
        // TODO: Separate by attribute.nodeName.toLowerCase()
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
   * @param links the links object to use
   * @private
   */
  function parseText(text, type, href, links) {
    if (text.indexOf("next") !== -1) {
      links[type].next = href;
    } else if (text.indexOf("forward") !== -1) {
      links[type].forward = href;
    } else if (text.indexOf("new") !== -1) {
      links[type].new = href;
    } else if (text.indexOf(">") !== -1) {
      links[type].gt = href;
    } else if (text.indexOf("prev") !== -1) {
      links[type].prev = href;
    } else if (text.indexOf("back") !== -1) {
      links[type].back = href;
    } else if (text.indexOf("old") !== -1) {
     links[type].old = href; 
    } else if (text.indexOf("<") !== -1) {
      links[type].lt = href;
    }
  }

  // Return Public Functions
  return {
    getURL: getURL,
    getLinks: getLinks,
    getLinksViaXHR: getLinksViaXHR,
    getLinksViaExecuteScript: getLinksViaExecuteScript
  };
}();