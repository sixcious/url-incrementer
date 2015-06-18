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
  function init() {
    console.log("init()");
  }

  /**
   * Gets the tab's instance.
   * 
   * @param tab the tab to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tab) {
    console.log("getInstance(tab=" + tab + ")");
    var instance;
    if (tab) {
      instance = instances[tab.id];
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
   * Builds/Updates a default instance.
   * 
   * @param tab   the tab to lookup this instance by
   * @param build boolean indicating to build a default instance if none exists
   * @param items the storage items used to build the default instance
   * @param links the next and prev links found for this tab
   * @return instance the tab's instance
   * @public
   */
  function buildInstance(instance, tab, items, links) {
    console.log("buildInstance(instance=" + instance + ", tab=" + tab + "items=" + items + ", links=" + links + ")");
    var selection_ = findSelection(tab.url);
    if (!instance) {
      instance = {};
      instance.enabled = false;
      instance.mode = items.defaultMode;
      instance.interval = items.defaultInterval;
    }
    instance.tab = tab;
    instance.links = links;
    instance.selection = selection_.selection;
    instance.selectionStart = selection_.selectionStart;
    return instance;
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
    var url_;
    switch (instance.mode) {
      case "use-links":
        break;
      case "modify-url":
        url_ = modifyURL(instance.tab.url, instance.selection, instance.selectionStart, instance.interval, direction);
        //instance.tab.url = jurl.url2;
        instance.selection = url_.selection2;
        // setInstance(instance.tab.id, instance);
        chrome.tabs.update(instance.tab.id, {url: url_.url2}, function(tab) { instance.tab = tab; setInstance(tab.id, instance);});
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
    var selection_,
        url_,
        links;
    switch (items.defaultMode) {
      case "use-links":
        chrome.tabs.executeScript(tab.id, {file: "js/content-scripts/links.js", runAt: "document_end"}, function(results) {
          links = results[0];
          chrome.tabs.update(tab.id, {
            url: direction === "next" ? links.rel.next ? links.rel.next : links.innerHTML.next ? links.innerHTML.next : "" :
                 direction === "prev" ? links.rel.prev ? links.rel.prev : links.innerHTML.prev ? links.innerHTML.prev : "" : ""
          });
        });
        break;
      case "modify-url":
        selection_ = findSelection(tab.url);
        url_ = modifyURL(tab.url, selection_.selection, selection_.selectionStart, items.defaultInterval, direction);
        if (url_ && url_.url2 && tab.url !== url_.url2) {
          chrome.tabs.update(tab.id, {url: url_.url2});
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
    init: init,
    getInstance: getInstance,
    setInstance: setInstance,
    buildInstance: buildInstance,
    updateTab: updateTab,
    quickUpdateTab: quickUpdateTab
  };
}();

// Listen for installation changes -- initialize storage and go to options
chrome.runtime.onInstalled.addListener(function(details) {
  console.log("!chrome.runtime.onInstalled details.reason=" + details.reason);
  // TODO: Remove the details.reason === "update" after this release
  if (details.reason === "install" || details.reason === "update") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set({
        "defaultMode": "use-links",
        "defaultLinks": "", // TODO
        "defaultInterval": 1,
        "animationsEnabled": true
      });
    });
    chrome.runtime.openOptionsPage();
  }
});

// Listen for commands (keyboard shortcuts)
chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    chrome.storage.sync.get(null, function(items) {
      console.log("!chrome.commands.onCommand command=" + command);
      switch (command) {
        case "next":
          URLNP.Background.quickUpdateTab(tabs[0], "next", items);
          break;
        case "prev":
          URLNP.Background.quickUpdateTab(tabs[0], "prev", items);
          break;
        case "clear":
          URLNP.Background.setInstance(tabs[0], undefined);
          break;
        default:
          break;
      }
    });
  });
});