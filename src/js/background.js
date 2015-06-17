// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.Background");

/**
 * URL Next Plus Background.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */
var URLNP = URLNP || {};
URLNP.Background = URLNP.Background || function () {

  var instances = []; // Keeps track of the tab instances (TODO: Put in storage)

  /**
   * Initializes the storage with the default values. The storage is initialized
   * when the extension is first installed.
   * 
   * @public
   */
  function initStorage() {
    console.log("initStorage()");
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set({
        "keyEnabled": true,
        "keyQuickEnabled": false,
        "keyNext": [0, 39],
        "keyPrev": [0, 37],
        "keyClear": [0, 13],
        "keyQuickNext": [7, 39],
        "keyQuickPrev": [7, 37],
        "defaultMode": "use-links",
        "defaultLinks": "", // TODO
        "defaultInterval": 1,
        "animationsEnabled": true
      });
    });
  }

  /**
   * Gets the tab's instance (if requested and none exists, builds a default).
   * 
   * @param tab   the tab to lookup this instance by
   * @param build boolean indicating to build a default instance if none exists
   * @param items the storage items used to build the default instance
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tab, build, items, links) {
    console.log("getInstance(tab=" + tab + ", build=" + build + ", items=" + items + ")");
    var instance,
        selection_;
        // links;
    if (tab) {
      instance = instances[tab.id];
      if (build) {
        // chrome.tabs.executeScript(tab.id, {file: "js/content-scripts/links.js", runAt: "document_end"}, function(results) {
          // links = results[0];
          selection_ = findSelection(tab.url);
          if (!instance) {
            instance = {
              enabled: false,
              tab: tab,
              mode: items.defaultMode,
              links: links,
              selection: selection_.selection,
              selectionStart: selection_.selectionStart,
              interval: items.defaultInterval
            };
          } else if (instance.tab.url !== tab.url) { // In case navigating away
            instance.tab = tab;
            instance.links = links;
            instance.selection = selection_.selection;
            instance.selectionStart = selection_.selectionStart;
          }
        // });
        // instances[tab.id] = instance;
      }
    }
    return instance;
  }

  /**
   * Sets the tab's instance.
   * 
   * @param tab      the tab to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tab, instance) {
    console.log("setInstance(tab=" + tab + ", instance=" + instance + ")");
    if (tab) {
      instances[tab.id] = instance;
    }
  }

  /**
   * Updates the instance's tab based on the desired direction.
   * 
   * This function updates the tab based on the instance's properties.
   * 
   * @param instance  the instance belonging to this tab
   * @param direction the direction to go
   * @public
   */
  function updateTab(instance, direction) {
    console.log("updateTab(instance=" + instance + ", direction=" + direction + ")");
    var jurl;
    switch (instance.mode) {
      case "use-links":
        break;
      case "modify-url":
        jurl = modifyURL(instance.tab.url, instance.selection, instance.selectionStart, instance.interval, direction);
        //instance.tab.url = jurl.url2;
        instance.selection = jurl.selection2;
        // setInstance(instance.tab.id, instance);
        chrome.tabs.update(instance.tab.id, {url: jurl.url2}, function(tab) { instance.tab = tab; setInstance(tab.id, instance);});
        break;
      default:
        break;
    }
  }

  /**
   * "Quick" updates the tab based on the desired direction.
   * 
   * This function can only be called by quick keyboard shortcuts and uses the
   * tab and storage items to determine to determine the action.
   * 
   * @param tab       the tab to update
   * @param direction the direction to go
   * @param items     the storage items
   * @public
   */
  function quickUpdateTab(tab, direction, items) {
    console.log("quickUpdateTab(tab=" + tab + ", direction=" + direction + ", items=" + items + ")");
    var jselection,
        jurl;
    switch (items.defaultMode) {
      case "use-links":
        break;
      case "modify-url":
        jselection = findSelection(tab.url);
        jurl = modifyURL(tab.url, jselection.selection, jselection.selectionStart, items.defaultInterval, direction);
        if (jurl && jurl.url2 && tab.url !== jurl.url2) {
          chrome.tabs.update(tab.id, {url: jurl.url2});
        }
        break;
      default:
        break;
    }
  }

  /**
   * Finds a selection in the url to modify.
   * 
   * First looks for common prefixes that come before numbers, such as
   * = (equals) and / (slash). Example URLs with prefixes:
   * 
   * http://www.google.com?page=1234
   * http://www.google.com/1234
   * 
   * If no prefixes with numbers exist, finds the last number in the url.
   * 
   * @param url the url to find the selection in
   * @return JSON object {selection, selectionStart}
   * @private
   */
  function findSelection(url) {
    console.log("findSelection(url=" + url + ")");
    var re1 = /(?:=|\/)(\d+)/, // RegExp to find prefixes = and / with numbers
        re2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
        matches;
    return (matches = re1.exec(url)) ? {selection: matches[1], selectionStart: matches.index + 1} :
           (matches = re2.exec(url)) ? {selection: matches[0], selectionStart: matches.index} :
                                       {selection: "", selectionStart: -1};
  }

  /**
   * Modifies the URL by either incrementing or decrementing the specified
   * selection.
   * 
   * @param url            the URL that will be modified
   * @param selection      the specific selection in the URL to modify
   * @param selectionStart the starting index of the selection in the URL
   * @param interval       the amount to increment or decrement
   * @param direction      the direction to go: next/increment or prev/decrement
   * @return JSON object {url2: modified url, selection2: modified selection}
   * @private
   */
  function modifyURL(url, selection, selectionStart, interval, direction) {
    console.log("modifyURL(url=" + url + ", selection=" + selection + ", selectionStart=" + selectionStart + ", interval=" + interval + ", direction=" + direction + ")");
    var url2,
        selection2,
        leadingzeros = selection.charAt(0) === '0',
        alphanumeric = /^[a-z0-9]+$/i.exec(selection); // TODO
    // In case of minus, set the selection to 0 in case the result is negative
    selection2 = direction === "next" ? (+selection + interval).toString() :
                 direction === "prev" ? (+selection - interval >= 0 ? +selection - interval : 0).toString() :
                                        "";
    if (leadingzeros && selection.length > selection2.length) {
      // Or use Array(1000).join("0") instead of literal "0000..." String?
      selection2 = "00000000000000000000000000000000000000000000000000".substring(0, selection.length - selection2.toString().length) + selection2;
    }
    url2 = url.substring(0, selectionStart) + selection2 + url.substring(selectionStart + selection.length);
    return {url2: url2, selection2: selection2};
  }

  // Return Public Functions
  return {
    initStorage: initStorage,
    getInstance: getInstance,
    setInstance: setInstance,
    updateTab: updateTab,
    quickUpdateTab: quickUpdateTab
  };
}();

// If first run, initialize storage and go to options
// TODO: Remove the details.reason === "update" after this release
chrome.runtime.onInstalled.addListener(function(details) {
  console.log("!chrome.runtime.onInstalled details.reason=" + details.reason);
  if (details.reason === "install" || details.reason === "update") {
    URLNP.Background.initStorage();
    chrome.runtime.openOptionsPage();
  }
});

// Listen for requests from chrome.runtime.sendMessage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("!chrome.runtime.onMessage request.greeting \"" + request.greeting + "\" from tab #" + sender.tab.id);
  switch (request.greeting) {
    case "getInstance":
      sendResponse({instance: URLNP.Background.getInstance(sender.tab)});
      break;
    case "setInstance":
      URLNP.Background.setInstance(sender.tab, request.instance);
      sendResponse({});
      break;
    case "updateTab":
      URLNP.Background.updateTab(URLNP.Background.getInstance(sender.tab), request.direction);
      sendResponse({});
      break;
    case "quickUpdateTab":
      URLNP.Background.quickUpdateTab(sender.tab, request.direction, request.items);
      sendResponse({});
      break;
    default:
      sendResponse({});
      break;
  }
  return true;
});