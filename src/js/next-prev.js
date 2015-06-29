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
   * TODO
   * 
   * @param contextDoc
   * @public
   */
  function setDoc(contextDoc) {
    console.log("setDoc(contextDoc=" + contextDoc + ")");
    doc = contextDoc;
  }

  /**
   * Processes the next and prev links and return the correct URL link to use.
   * 
   * @param priority  the link priority to use: attributes or innerHTML
   * @param direction the direction to go: next or prev
   * @return url the url to use based on the parameters
   * @public
   */
  function getURL(priority, direction) {
    console.log("getURL(priority=" + priority + ", direction=" + direction + ")");
    return links[priority][direction] ? links[priority][direction] : links[priority === "attributes" ? "innerHTML" : "attributes"][direction];
  }

  /**
   * Gets the next and prev links in the document by parsing all link and anchor
   * elements.
   * 
   * @public
   */
  function getLinks() {
    console.log("getLinks()");
    // Note: The following DOM elements contain links: link, a, area, and base
    var links_ = doc.getElementsByTagName("link"),
        anchors = doc.links; // Includes all anchor and area elements
	  parseElements(links_);
	  parseElements(anchors);
		// TODO: mutationObserver();
		console.log("lan:" + links.attributes.next);
		console.log("lap:" + links.attributes.prev);
		console.log("lin:" + links.innerHTML.next);
		console.log("lip:" + links.innerHTML.prev);
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
    console.log("parseElements(elements=" + elements +")");
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
      parseElement(element, element.innerHTML.toLowerCase(), "innerHTML");
      attributes = element.attributes;
      for (j = 0; j < attributes.length; j++) {
        attribute = attributes[j];
        // TODO: Separate all attributes by attribute.nodeName.toLowerCase()
        parseElement(element, attribute.nodeValue.toLowerCase(), "attributes");
      }
    }
  }

  /**
   * TODO
   * 
   * @param TODO
   * @private
   */
  function parseElement(element, keyword, type) {
    if (keyword.indexOf("next") !== -1) {
      links[type].next = element.href;
    } else if (keyword.indexOf("forward") !== -1) {
      links[type].forward = element.href;
    } else if (keyword.indexOf(">") !== -1) {
      links[type].gt = element.href;
    } else if (keyword.indexOf("prev") !== -1) {
      links[type].prev = element.href;
    } else if (keyword.indexOf("back") !== -1) {
      links[type].back = element.href;
    } else if (keyword.indexOf("<") !== -1) {
      links[type].lt = element.href;
    }
  }

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

  // Return Public Functions
  return {
    setDoc: setDoc,
    getURL: getURL,
    getLinks: getLinks
  };
}();