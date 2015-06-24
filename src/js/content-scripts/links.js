// TODO

console.log("URLNP.Links");

/**
 * URL Next Plus Links.
 * 
 * Uses the JavaScript Revealing Module Pattern
 * 
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Links = URLNP.Links || function () {

  var links = {attributes: {}, innerHTML: {}};

  /**
   * Gets the next and prev links in the document by parsing all link and anchor
   * elements.
   * 
   * @public
   */
  function getLinks() {
    console.log("getLinks()");
    var links_ = document.getElementsByTagName("link"),
        //areas = document.getElementsByTagName("area"),
        //bases = document.getElementsByTagName("base"),
        anchors = document.links; // Includes all anchor and area elements
		// console.log("\ttotal links found:" + links_.length);
		// for (i = 0; i < links_.length; i++) {
		//   console.log("\t" + (i + 1) + ":" + links_[i].rel + " " + links_[i].href);
		// }
		// console.log("\ttotal anchors found:" + anchors.length);
		// for (i = 0; i < anchors.length; i++) {
		//   console.log("\t" + (i + 1) + ":" + anchors[i].href);
		// }
		// console.time("scan");
	  parseElements(links_);
	 // parseElements(areas);
	 // parseElements(bases);
	  parseElements(anchors);
		// console.timeEnd("scan");
		// console.log("links attributes");
		// // for (key in links.attributes) {
		// //   console.log()
		// // }
		// console.log("links attributes next:" + links.attributes.next);
		// console.log("links attributes prev:" + links.attributes.prev);
		// console.log("links innerHTML next:" + links.innerHTML.next);
		// console.log("links innerHTML prev:" + links.innerHTML.prev);
		// TODO:
		// if (true) {
		//   mutationObserver();
		// }
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
        icache,
        jcache,
        i,
        j;
    for (i = 0; i < elements.length; i++) {
      element = elements[i];
      if (!element.href) {
        continue;
      }
      icache = element.innerHTML.toLowerCase();
      if (icache.indexOf("next") !== -1) {
        links.innerHTML.next = element.href;
      } else if (icache.indexOf("prev") !== -1) {
        links.innerHTML.prev = element.href;
      }
      attributes = element.attributes;
      for (j = 0; j < attributes.length; j++) {
        attribute = attributes[j];
        jcache = attribute.nodeValue.toLowerCase();
        // TODO: Separate all attributes by attribute.nodeName.toLowerCase()
        if (jcache === "next") {
          links.attributes.next = element.href;
        } else if (jcache === "prev") {
          links.attributes.prev = element.href;
        }
      }
    }
  }

  /**
   * TODO
   * 
   * @private
   */ 
  function mutationObserver() {
    console.log("mutationObserver()");
//var insertedNodes = [];
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        //var i;
        console.log("mutation type=" + mutation.type +", mutation target=" + mutation.target + ", mutation node name=" + mutation.nodeName);
        for (var i = 0, node = mutation.addedNodes[i]; i < mutation.addedNodes.length; i++) {
        //[].forEach.call(mutation.addedNodes, function(node) {
          console.log("added node:" + node.id + " with tag name=" + node.tagName);
          var tagName = node.tagName.toLowerCase();
          if (tagName === "a" || tagName === "link") {
            // TODO parse the element and then if it is a next/prev notify the popup
          }
        }
      });
    });
    observer.observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true });
  }

  // Return Public Functions
	return {
	  getLinks: getLinks
	};
}();

// This last line will be returned in the chrome.tabs.executeScript() call
URLNP.Links.getLinks();