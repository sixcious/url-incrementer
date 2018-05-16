/**
 * URL Incrementer Next Prev
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.NextPrev = function () {

  const nextKeywords = ["next", "forward", ">", "new"],
        prevKeywords = ["prev", "previous", "back", "<", "old"],
        urls = {
          "next": {
            "important": new Map(),
            "attributes": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() },
            "innerHTML":  { "equals": new Map(), "startsWith": new Map(), "includes": new Map() }
          },
          "prev": {
            "important": new Map(),
            "attributes": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() },
            "innerHTML":  { "equals": new Map(), "startsWith": new Map(), "includes": new Map() }
          }
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
    buildURLs(sameDomainPolicyEnabled);
    var url = [],
        keywords = direction === "next" ? nextKeywords : prevKeywords,
        otherPriority = priority === "attributes" ? "innerHTML" : "attributes";
    console.log(urls);

//  url = traverseResults(direction, "important", keywords);
    url[1] = urls[direction].important.get("relAttribute");
    console.log("1url " + direction + " important.relattribute =" + url);
    //if (url) { return url; }
    url[2] = traverseResults(direction, priority, "equals", keywords);
        console.log("2url " + direction + priority + "equals=" + url);
   // if (url) { return url; }
    url[3] = traverseResults(direction, otherPriority, "equals", keywords);
        console.log("3url " + direction + otherPriority + "equals=" + url);
   // if (url) { return url; }
    url[4] = traverseResults(direction, priority, "startsWith", keywords);
        console.log("4url=" + direction + priority + "startsWith=" + url);
   // if (url) { return url; }
       url[5] = traverseResults(direction, priority, "includes", keywords);
        console.log("6url=" + direction + priority + "includes=" + url);
   // if (url) { return url; }
    url[6] = traverseResults(direction, otherPriority, "startsWith", keywords);
        console.log("5url=" + direction + otherPriority + "startsWith=" + url);
   // if (url) { return url; }
    url[7] = traverseResults(direction, otherPriority, "includes", keywords);
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
  function traverseResults(direction, priority, subpriority, keywords) {
    var url = undefined;
    for (let keyword of keywords) {
      if (urls[direction][priority][subpriority].has(keyword)) {
        url = urls[direction][priority][subpriority].get(keyword);
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
      parseText("innerHTML", element.href, element.innerHTML.toLowerCase(), "");
      attributes = element.attributes;
      for (j = 0; j < attributes.length; j++) {
        attribute = attributes[j];
        parseText("attributes", element.href, attribute.nodeValue.toLowerCase(), attribute.nodeName.toLowerCase());
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
  function parseText(type, href, text, attributeNodeName) {
    // Important Priority:
    if (type === "attributes" && attributeNodeName === "rel") {
      if (text === "next") {
        urls.next.important.set("relAttribute", href);
      } else if (text === "prev") {
        urls.prev.important.set("relAttribute", href);
      }
    }
    // Attributes & innerHTML Next:
    for (let nextKeyword of nextKeywords) {
      if (text === nextKeyword) {
        urls.next[type].equals.set(nextKeyword, href);
      } else if (text.startsWith(nextKeyword)) {
        urls.next[type].startsWith.set(nextKeyword, href);
      } else if (text.includes(nextKeyword)) {
        urls.next[type].includes.set(nextKeyword, href);
      }
    }
    // Attributes & innerHTML Prev:
    for (let prevKeyword of prevKeywords) {
      if (text === prevKeyword) {
        urls.prev[type].equals.set(prevKeyword, href);
      } else if (text.startsWith(prevKeyword)) {
        urls.prev[type].startsWith.set(prevKeyword, href);
      } else if (text.includes(prevKeyword)) {
        urls.prev[type].includes.set(prevKeyword, href);
      }
    }
  }

  // Return Public Functions
  return {
    getURL: getURL
  };
}();