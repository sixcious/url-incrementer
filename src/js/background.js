/**
 * URL Next Plus Background
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Background = URLNP.Background || function () {

  var instances = []; // Tab instances (TODO:Put in storage to convert to event)

  /**
   * Gets the tab's instance.
   * 
   * @param tab the tab id to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    console.log("getInstance(tabId=" + tabId + ")");
    return instances[tabId];
  }

  /**
   * Sets the tab's instance.
   * 
   * @param tab      the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    console.log("setInstance(tabId=" + tabId + ", instance=" + instance + ")");
    instances[tabId] = instance;
  }

  /**
   * Builds/Updates a instance with default values.
   * 
   * @param instance the instance, if any, to continue building off of
   * @param tab      the tab to set this instance with
   * @param items    the storage items used to build the default instance
   * @param links    the next and prev links found for this instance
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(instance, tab, items, links) {
    console.log("buildInstance(instance=" + instance + ", tab=" + tab +  ", items=" + items + ", links=" + links + ")");
    var selection_;
    if (tab) {
      selection_ = findSelection(tab.url);
      if (!instance) {
        instance = {};
        instance.enabled = false;
        instance.mode = items.defaultMode;
        instance.linksPriority = items.defaultLinksPriority;
        instance.interval = items.defaultInterval;
      }
      instance.tab = tab;
      instance.links = links;
      instance.selection = selection_.selection;
      instance.selectionStart = selection_.selectionStart;
      instance.leadingzeros = instance.selection.charAt(0) === '0';
      instance.alphanumeric = /[a-z]/i.test(instance.selection);
    }
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
    console.log("updateTab(instance=" + instance.tab.url + ", direction=" + direction + ")");
    var url;
    switch (instance.mode) {
      case "next-prev":
        chrome.tabs.executeScript(instance.tab.id, {file: "js/content-scripts/links.js", runAt: "document_end"}, function(results) {
          var links = results[0];
          url = processLinks(results[0], instance.linksPriority, direction);
          if (url && instance.tab.url !== url) {
            chrome.tabs.update(instance.tab.id, {url: url});
          }
        });
        break;
      case "plus-minus":
        url = modifyURL(instance.tab.url, instance.selection, instance.selectionStart, instance.interval, instance.leadingzeros, instance.alphanumeric, direction);
        instance.tab.url = url.urlm;
        instance.selection = url.selectionm;
        setInstance(instance.tab.id, instance);
        chrome.tabs.update(instance.tab.id, {url: url.urlm});
        break;
      default:
        break;
    }
  }

  /**
   * Processes the next and prev links and return the correct URL link to use.
   * 
   * @param links     the JSON object containing the next and prev links
   * @param priority  the link priority to use: attributes or innerHTML
   * @param direction the direction to go: next or prev
   * @return url the url to use based on the parameters
   * @private
   */
  function processLinks(links, priority, direction) {
    var url;
    url = direction === "next" ?
            priority === "attributes" ?
              links.attributes.next ? links.attributes.next : links.innerHTML.next ? links.innerHTML.next : undefined :
            priority === "innerHTML" ?
              links.innerHTML.next ? links.innerHTML.next : links.attributes.next ? links.attributes.next : undefined :
            undefined :
        direction === "prev" ?
          priority === "attributes" ?
            links.attributes.prev ? links.attributes.prev : links.innerHTML.prev ? links.innerHTML.prev : undefined :
          priority === "innerHTML" ?
              links.innerHTML.prev ? links.innerHTML.prev : links.attributes.prev ? links.attributes.prev : undefined :
          undefined :
        undefined;
    return url;
  }

  /**
   * Finds a selection in the url to modify (increment or decrement).
   * 
   * First looks for common prefixes that come before numbers, such as
   * = (equals) and / (slash). Example URLs with prefixes (= and /):
   * 
   * http://www.google.com?page=1234
   * http://www.google.com/1234
   * 
   * If no prefixes with numbers are found, uses the last number in the url. If
   * no numbers exist in the URL, returns an empty selection.
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
   * @return JSON object {urlm: modified url, selectionm: modified selection}
   * @private
   */
  function modifyURL(url, selection, selectionStart, interval, leadingzeros, alphanumeric, direction) {
    console.log("leadingzeros=" + leadingzeros + ", alphanumeric=" + alphanumeric);
    console.log("modifyURL(url=" + url + ", selection=" + selection + ", selectionStart=" + selectionStart + ", interval=" + interval + ", direction=" + direction + ")");
    var urlm,
        selectionm,
        selectionint = parseInt(selection, alphanumeric ? 36 : 10);
    // In case of minus producing negative, set selectionm to 0
    selectionm = direction === "next" ? (selectionint + interval).toString() :
                 direction === "prev" ? (selectionint - interval >= 0 ? selectionint - interval : 0).toString() :
                                        "";
    if (leadingzeros && selection.length > selectionm.length) {
      selectionm = "0".repeat(selection.length - selectionm.length) + selectionm;
      //selectionm = "00000000000000000000000000000000000000000000000000".substring(0, selection.length - selectionm.length) + selectionm;
    }
    if (alphanumeric) {
      selectionm = (+selectionm).toString(36);
    }
    urlm = url.substring(0, selectionStart) + selectionm + url.substring(selectionStart + selection.length);
    return {urlm: urlm, selectionm: selectionm};
  }

  // Return Public Functions
  return {
    getInstance: getInstance,
    setInstance: setInstance,
    buildInstance: buildInstance,
    updateTab: updateTab
  };
}();

// Listen for installation changes and do storage/extension initialization work
chrome.runtime.onInstalled.addListener(function(details) {
  console.log("!chrome.runtime.onInstalled details.reason=" + details.reason);
  // TODO: Remove the details.reason === "update" after this release
  if (details.reason === "install" || details.reason === "update") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set({
        "quickEnabled": true,
        "defaultMode": "next-prev",
        "defaultLinksPriority": "attributes",
        "defaultInterval": 1,
        "animationsEnabled": true
      });
    });
    chrome.runtime.openOptionsPage();
  }
});

// Listen for commands (keyboard shortcuts) and perform the command's action
chrome.commands.onCommand.addListener(function(command) {
  console.log("!chrome.commands.onCommand command=" + command);
  if (command === "next" || command === "prev" || command === "clear") {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      var instance = URLNP.Background.getInstance(tabs[0].id);
      if (command === "next" || command === "prev") {
        if (instance && instance.enabled) {
          URLNP.Background.updateTab(instance, command);
        } else {
          chrome.storage.sync.get(null, function(items) {
            if (items.quickEnabled) {
              instance = URLNP.Background.buildInstance(instance, tab, items, links); // TODO links
              URLNP.Background.updateTab(instance, command);
            }
          });
        }
      } else if (command === "clear" && instance && instance.enabled) {
        URLNP.Background.setInstance(tabs[0].id, undefined);
      }
    });
  }
});