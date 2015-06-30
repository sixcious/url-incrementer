/**
 * URL Next Plus NextPrev
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.NextPrev = URLNP.NextPrev || function () {
  
  var doc,
      links = {attributes: {}, innerHTML: {}};

  /**
   * Sets the document, which will be used later to to build the links. This 
   * document varies depending on the context of when this code is run:
   * 
   * 1: If ran as a content_script via a call from chrome.tabs.executeScript, it
   *    will pass in that tab's document natively
   * 
   * 2: If ran in the background via a call from background.js, it will pass in
   *    a document created from an Ajax-sent XMLHttpRequest (XHR) responseXML
   * 
   * @param contextDoc the document
   * @public
   */
  function setDoc(contextDoc) {
    console.log("setDoc(contextDoc)");
    doc = contextDoc;
  }

  /**
   * Gets the URL by examining the links object based off of the requested
   * priority and direction.
   * 
   * @param priority  the link priority to use: attributes or innerHTML
   * @param direction the direction to go: next or prev
   * @return url the url to use based on the parameters
   * @public
   */
  function getURL(priority, direction) {
    console.log("getURL(priority, direction)");
    return links[priority][direction] ? links[priority][direction] : links[priority === "attributes" ? "innerHTML" : "attributes"][direction];
  }

  /**
   * Gets the next and prev links in the document by parsing all link and anchor
   * elements.
   * 
   * @return links the links containing the next and prev links (if any)
   * @public
   */
  function getLinks() {
    console.log("getLinks()");
    // Note: The following DOM elements contain links: link, a, area, and base
    var links_ = doc.getElementsByTagName("link"),
        anchors = doc.links; // Includes all anchor and area elements
	  parseElements(links_);
	  parseElements(anchors);
	 // console.log("links attributes next:" + links.attributes.next);
	 // console.log("links attributes prev:" + links.attributes.prev);
	 // console.log("links innerHTML next:" + links.innerHTML.next);
	 // console.log("links innerHTML prev:" + links.innerHTML.prev);
  	return links;
  }

  /**
   * Parses the elements by examining if their attributes or innerHTML contain
   * next or prev keywords in them.
   * 
   * @param elements the DOM elements to parse
   * @private
   */
  function parseElements(elements) {
    console.log("parseElements(elements)");
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
      parseText(element.innerHTML.toLowerCase(), "innerHTML", element.href);
      attributes = element.attributes;
      for (j = 0; j < attributes.length; j++) {
        attribute = attributes[j];
        parseText(attribute.nodeValue.toLowerCase(), "attributes", element.href);
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev
   * links and builds the links object if found.
   * 
   * TODO: Separate all attributes by attribute.nodeName.toLowerCase()
   * 
   * @param text the text to parse keywords from
   * @param type the link type: innerHTML or attributes
   * @param href the URL to set this link to 
   * @private
   */
  function parseText(text, type, href) {
    console.log("parseText(text, type, href)");
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
    setDoc: setDoc,
    getURL: getURL,
    getLinks: getLinks
  };
}();
//   /**
//   * TODO
//   * 
//   * @private
//   */ 
//   function mutationObserver() {
//     console.log("mutationObserver()");
// //var insertedNodes = [];
//     var observer = new MutationObserver(function(mutations) {
//       mutations.forEach(function(mutation) {
//         var i;
//         console.log("mutation type=" + mutation.type +", mutation target=" + mutation.target + ", mutation node name=" + mutation.nodeName);
//         for (i = 0, node = mutation.addedNodes[i]; i < mutation.addedNodes.length; i++) {
//           console.log("added node:" + node.id + " with tag name=" + node.tagName);
//           var tagName = node.tagName.toLowerCase();
//           if (tagName === "a" || tagName === "link") {
//             parseElements([node]);
//             // TODO parse the element and then if it is a next/prev send a message to popup
//           }
//         }
//       });
//     });
//     observer.observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true });
//   }