/**
 * URL Incrementer Next Prev
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.NextPrev = function () {

        // Keywords are ordered in priority.
        // startsWithExcludes helps better prioritize some keywords (e.g. we prefer includes of "prev" over startsWith of "back")
  const keywords = {
          "next": ["next", "forward", "&gt;", ">", "new"],
          "prev": ["prev", "previous", "back", "&lt;", "<", "‹", "old"],
          "startsWithExcludes": ["new", "old", "back"]
        },
        // urls store important, attributes, and innerHTML links that were found
        urls = {
          "important": new Map(),
          "attributes": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() },
          "innerHTML":  { "equals": new Map(), "startsWith": new Map(), "includes": new Map() }
        };

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
    buildURLs(direction, sameDomainPolicyEnabled);
    var url = [],
        otherPriority = priority === "attributes" ? "innerHTML" : "attributes";

    url[1] = urls.important.get("relAttribute");
    console.log("1url " + direction + " important.relattribute =" + url);
    //if (url) { return url; }
    url[2] = traverseResults(priority, "equals", keywords[direction]);
        console.log("2url " + direction + priority + "equals=" + url);
   // if (url) { return url; }
    url[3] = traverseResults(otherPriority, "equals", keywords[direction]);
        console.log("3url " + direction + otherPriority + "equals=" + url);
   // if (url) { return url; }
    url[4] = traverseResults(priority, "startsWith", keywords[direction]);
        console.log("4url=" + direction + priority + "startsWith=" + url);
   // if (url) { return url; }
       url[5] = traverseResults(priority, "includes", keywords[direction]);
        console.log("6url=" + direction + priority + "includes=" + url);
   // if (url) { return url; }
    url[6] = traverseResults(otherPriority, "startsWith", keywords[direction]);
        console.log("5url=" + direction + otherPriority + "startsWith=" + url);
   // if (url) { return url; }
    url[7] = traverseResults(otherPriority, "includes", keywords[direction]);
        console.log("7url=" + direction + otherPriority + "includes=" + url);
 //   if (url) { return url; }    
 
 console.log(url);
 for (var i = 0;i < url.length; i++) {
   if (url[i]) { return url[i] }
 }
    return "";
  }

  /**
   * TODO
   */
  function traverseResults(priority, subpriority, keywords) {
    var url = undefined;
    for (let keyword of keywords) {
      if (urls[priority][subpriority].has(keyword)) {
        url = urls[priority][subpriority].get(keyword);
        break;
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
  function buildURLs(direction, sameDomainPolicyEnabled) {
    // Note: The following DOM elements contain links: link, a, area, and base
    var links = document.getElementsByTagName("link"),
        anchors = document.links, // Includes all anchor and area elements
        hostname = document.location.hostname;
    parseElements(direction, links, hostname, sameDomainPolicyEnabled);
    parseElements(direction, anchors, hostname, sameDomainPolicyEnabled);
  }

  /**
   * Parses the elements by examining if their attributes or innerHTML contain
   * next or prev keywords in them.
   *
   * @param elements the DOM elements to parse
   * @param links    the links object to use
   * @private
   */
  function parseElements(direction, elements, hostname, sameDomainPolicyEnabled) {
    var url;
    for (let element of elements) {
      if (!element.href) {
        continue;
      }
      try {
        url = new URL(element.href);
        if (sameDomainPolicyEnabled && url.hostname !== hostname) {
          continue;
        }
      } catch (e) {
        continue;
      }
      parseText(direction, "innerHTML", element.href, element.innerHTML.trim().toLowerCase(), "");
      for (attribute of element.attributes) {
        parseText(direction, "attributes", element.href, attribute.nodeValue.trim().toLowerCase(), attribute.nodeName.toLowerCase());
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev
   * links. Adds values to the urls Maps if a match is found.
   *
   * @param type the link type: innerHTML or attributes
   * @param href the URL to set this link to
   * @param text the text to parse keywords from
   * @param attributeNodeName attribute's node name if it's needed
   * @private
   */
  function parseText(direction, type, href, text, attributeNodeName) {
    // Important Priority (e.g. rel="next" or rel="prev"):
    if (type === "attributes" && attributeNodeName === "rel" && direction === text) {
      urls.important.set("relAttribute", href);
    }
    // Attributes & innerHTML:
    for (let keyword of keywords[direction]) {
      if (text === keyword) {
        urls[type].equals.set(keyword, href);
      } else if (text.startsWith(keyword) && keywords.startsWithExcludes.indexOf(keyword) < 0) {
        urls[type].startsWith.set(keyword, href);
      } else if (text.includes(keyword)) {
        urls[type].includes.set(keyword, href);
      }
    }
  }

  // Return Public Functions
  return {
    getURL: getURL
  };
}();