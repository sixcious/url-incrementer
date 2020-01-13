/**
 * URL Incrementer
 * @file next-prev.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var NextPrev = (() => {

  /**
   * Finds the next or prev URL based on the keywords.
   *
   * @param type       the rule type can be "selector" or "xpath"
   * @param selector   the next or prev css selector rule to use
   * @param xpath      the next or prev xpath rule to use
   * @param attribute  the next or prev css selector/xpath attribute to use
   * @param keywords   the next or prev keywords list to use
   * @param sameDomain whether to enforce the same domain policy
   * @param document_  Infy Scroll only: the current document on the page to query
   * @param scrollEnabled if Infy Scroll
   * @returns {*} the next or prev url (if found) along with the subtype and keyword that was used to find it
   * @public
   */
  function findNextPrevURL(type, selector, xpath, attribute, keywords, sameDomain, document_, scrollEnabled) {
    console.log("findNextPrevURL() - type=" + type + ", selector=" + selector + ", xpath=" + xpath + "attribute=" + attribute +  ", keywords=" + keywords + ", sameDomain=" + sameDomain + ", document=" + (document_ ? document_.location : ""));
    // The urls object stores important, attribute, innerText, and innerHTML links that were found
    const urls = {
      "selector":  undefined,
      "attribute": { "equals": new Map(), "startsWith": new Map(), "includes": new Map(), "rel": new Map() },
      "innerText": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() },
      "innerHTML": { "equals": new Map(), "startsWith": new Map(), "includes": new Map() }
    };
    // Note: the algorithm order matters, the highest priority algorithms are first when they are iterated below
    const algorithms = [
      { "type": "attribute", "subtypes": ["rel"] },
      { "type": "attribute", "subtypes": ["equals"] },
      { "type": "innerText", "subtypes": ["equals"] },
      { "type": "innerHTML", "subtypes": ["equals"] },
      // Combined startsWith and includes for priority on keywords instead of the subtypes
      { "type": "attribute", "subtypes": ["startsWith", "includes"] },
      { "type": "innerText", "subtypes": ["startsWith", "includes"] },
      { "type": "innerHTML", "subtypes": ["startsWith", "includes"] }
    ];
    buildURLs(urls, type, selector, xpath, attribute, keywords, sameDomain, document_);
    console.log("findNextPrev() - URLS built:");
    console.log(JSON.stringify(Object.values(urls)));
    if (urls.selector) {
      highlightElement(urls.selector.element, scrollEnabled);
      return { url: urls.selector.url, method: "selector", type: selector + "." + attribute.join(".") };
    }
    for (const algorithm of algorithms) {
      const result = traverseResults(urls, algorithm.type, algorithm.subtypes, keywords, scrollEnabled);
      if (result) { return result; }
    }
  }

  /**
   * Traverses the urls results object to see if a URL was found. e.g. urls[attributes][equals][next]
   *
   * @param urls     the urls object stores attribute, innerText, and innerHTML links that were found
   * @param type     the algorithm main type to use: attribute, innerText, or innerHTML
   * @param subtypes the algorithm subtypes to use: rel, equals, startsWith, includes
   * @param keywords the ordered list of keywords sorted in priority
   * @param scrollEnabled if Infy Scroll
   * @returns {*} the next or prev url (if found) along with the subtype and keyword that was used to find it
   * @private
   */
  function traverseResults(urls, type, subtypes, keywords, scrollEnabled) {
    for (const keyword of keywords) {
      for (const subtype of subtypes) {
        if (urls[type][subtype].has(keyword)) {
          const value = urls[type][subtype].get(keyword);
          console.log("traverseResults() - a next/prev link was found:" +  type + " - " + subtype + " - " + keyword + " - " + value.element + " - " + value.attribute + " - " + value.url);
          highlightElement(value.element, scrollEnabled);
          return {url: value.url, method: "keyword", type: type, subtype: subtype, keyword: keyword, element: value.elementName, attribute: value.attribute };
        }
      }
    }
  }

  /**
   * Builds the urls results object by parsing all link and anchor elements.
   *
   * @param urls       the urls object stores important, attribute, innerText, and innerHTML links that were found
   * @param type       the link type to use: important, attributes or innerHTML
   * @param selector   the next or prev css selector rule to use
   * @param xpath      the next or prev xpath rule to use
   * @param attribute  the next or prev css selector/xpath attribute to use
   * @param keywords   the next or prev keywords list to use
   * @param sameDomain whether to enforce the same domain policy
   * @param document_  Infy Scroll: the current document on the page to query
   * @private
   */
  function buildURLs(urls, type, selector, xpath, attribute, keywords, sameDomain, document_) {
    const document__ = document_ ? document_ : document;
    const hostname = window.location.hostname;
    try {
      let elements;
      if (type === "xpath") {
        elements = [document__.evaluate(xpath, document__, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue];
      } else {
        elements = document__.querySelectorAll(selector);
      }
      for (const element of elements) {
        let url = element[attribute[0]];
        for (let i = 1; i < attribute.length; i++) {
          url = url[attribute[i]];
        }
        if (isValidURL(url)) {
          urls.selector = { url: url, element: element };
          return;
        }
      }
    } catch(e) {
      console.log("buildURLs() - Exception caught when querying for selector: " + e);
    }
    const elements = document__.querySelectorAll("link[href], a[href], area[href], form[action], button[formaction]");
    for (const element of elements) {
      // Check if URL is in same domain if enabled, wrap in try/catch in case of exceptions with URL object
      try {
        const url = new URL(element.href);
        if (sameDomain && url.hostname !== hostname) {
          continue;
        }
        const elementName = element.nodeName.toLowerCase();
        parseText(urls, keywords, "innerText", element.href, element.innerText.trim().toLowerCase(), elementName, element);
        parseText(urls, keywords, "innerHTML", element.href, element.innerHTML.trim().toLowerCase(), elementName, element);
        for (const eattribute of element.attributes) {
          parseText(urls, keywords, "attribute", element.href, eattribute.nodeValue.trim().toLowerCase(), elementName, element, eattribute.nodeName.toLowerCase());
        }
      } catch (e) {
        console.log("buildURLs() - exception caught:" + e);
      }
    }
  }

  /**
   * Parses an element's text for keywords that might indicate a next or prev link.
   * Adds the link to the urls map if a match is found.
   *
   * @param urls        the urls object stores important, attribute, innerText, and innerHTML links that were found
   * @param keywords    the next or prev keywords list to use
   * @param type        the type of element text value to parse: attribute, innerText, or innerHTML
   * @param href        the URL to set this link to
   * @param text        the element's attribute value, innerText, or innerHTML to parse keywords from
   * @param elementName the element's name
   * @param element     the element
   * @param eattribute  the element attribute's node name if it's needed
   * @private
   */
  function parseText(urls, keywords, type, href, text, elementName, element, eattribute) {
    // Iterate over this direction's keywords and build out the urls object's maps
    const value = { url: href, element: element, elementName: elementName, attribute: eattribute };
    for (const keyword of keywords) {
      // Important e.g. rel="next" or rel="prev"
      if (eattribute && eattribute === "rel" && text === keyword) {
        urls.attribute.rel.set(keyword, value);
      } else if (text === keyword) {
        urls[type].equals.set(keyword, value);
      } else if (text.startsWith(keyword)) {
        urls[type].startsWith.set(keyword, value);
      } else if (text.includes(keyword)) {
        urls[type].includes.set(keyword, value);
      }
    }
  }

  /**
   * Determines if a potential URL is a valid URL.
   * Arbitrary rules: URLs must 1) be parsed as URL objects and 2) not start with mailto.
   *
   * @param url the URL to parse
   * @returns {boolean} true if the URL is a download URL, false otherwise
   * @private
   */
  function isValidURL(url) {
    let valid = false;
    try {
      const url_ = new URL(url);
      valid = url_ && url_.href && url_.hostname === window.location.hostname && !url_.href.startsWith("mailto");
    } catch (e) {
      console.log("isValidURL() - exception caught: " + e);
    }
    return valid;
  }

  /**
   * Highlights the next or prev element on the document page.
   *
   * @param element       the DOM element to highlight
   * @param scrollEnabled if infy scroll
   */
  function highlightElement(element, scrollEnabled) {
    if (scrollEnabled) {
      element.style.outline = "5px solid black";
      element.style.backgroundColor = "#FDFF47";
      setTimeout(function() {
        element.style.outline = "";
        element.style.backgroundColor = "";
      }, 5000);
    }
  }

  // Return Public Functions
  return {
    findNextPrevURL: findNextPrevURL
  };

})();