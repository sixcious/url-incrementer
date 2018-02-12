/**
 * URL Plus Background
 * 
 * @author Roy Six
 * @namespace
 */
var URLP = URLP || {};
URLP.Background = URLP.Background || function () {

  var instances = []; // Tab instances (TODO: Use storage to make bg event page)

  /**
   * Gets the tab's instance.
   * 
   * @param tabId the tab id to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    return instances[tabId];
  }

  /**
   * Sets the tab's instance.
   * 
   * @param tabId    the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    instances[tabId] = instance;
  }

  /**
   * Builds/Updates a instance with default values.
   * 
   * @param instance the instance, if any, to continue building off of
   * @param tab      the tab properties (id, url) to set this instance with
   * @param items    the storage items used to build the default instance
   * @param links    the next and prev links found for this instance
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(instance, tab, items, links) {
    var selectionProps;
    if (tab) {
      if (!instance) {
        instance = {};
        instance.enabled = false;
        instance.interval = items.interval;
        instance.base = items.base;
        instance.baseCase = items.baseCase;
        instance.linksPriority = items.linksPriority;
        instance.sameDomainPolicy = items.sameDomainPolicy;
      }
      selectionProps = URLP.PlusMinus.findSelection(tab.url, items.selectionPriority, items.selectionCustom);
      instance.tabId = tab.id;
      instance.url = tab.url;
      instance.selection = selectionProps.selection;
      instance.selectionStart = selectionProps.selectionStart;
      instance.leadingZeros = items.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1;
    }
    return instance;
  }

  /**
   * Updates the instance's tab based on the desired action.
   * 
   * @param instance the instance for this tab
   * @param action   the operation (plus/minus) or direction (next/prev)
   * @param caller   String indicating who called this function (e.g. command)
   * @param callback the function callback (optional)
   * @public
   */
  function updateTab(instance, action, caller, callback) {
    var urlProps;
    switch (action) {
      case "plus":
      case "minus":
       urlProps = URLP.PlusMinus.modifyURL(instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros, action);
       instance.url = urlProps.urlmod;
       instance.selection = urlProps.selectionmod;
       chrome.tabs.update(instance.tabId, {url: instance.url});
       if (instance.enabled) { // Instance is never enabled in quick mode
         setInstance(instance.tabId, instance);
       }
       if (callback) {
         callback(instance);
       }
       break;
      case "next":
      case "prev":
       chrome.tabs.executeScript(instance.tabId, {file: "js/next-prev.js", runAt: "document_end"}, function() {
         var code = "URLP.NextPrev.getLinks(document, " + JSON.parse(instance.sameDomainPolicy) + ");";
         chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results){
          chrome.tabs.update(instance.tabId, {url: URLP.NextPrev.getURL(instance.linksPriority, action, results[0])});
            if (callback) {
              callback(instance);
            }
         });
       });
       break;
    }
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
chrome.runtime.onInstalled.addListener(function(details) { // TODO "Remove update"
  if (details.reason === "install" || details.reason === "update") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set({
        "shortcuts": "chrome",
        "quickEnabled": true,
        "animationsEnabled": true,
        "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase",
        "selectionCustom": {url: "", pattern: "", flags: "", group: 0, index: 0},
        "linksPriority": "attributes", "sameDomainPolicy": true,
        "keyEnabled": true, "keyQuickEnabled": true, "keyPlus": [7, 38], "keyMinus": [7, 40], "keyNext": [7, 39], "keyPrev": [7, 37], "keyClear": [7, 88],
        "mouseEnabled": false, "mouseQuickEnabled": false, "mousePlus": 0, "mouseMinus": 0, "mouseNext": 0, "mousePrev": 0, "mouseClear": 0
      });
    });
  }
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});

// Listen for commands (keyboard shortcuts) and perform the command's action
chrome.commands.onCommand.addListener(function(command) {
  chrome.storage.sync.get(null, function(items) {
    if (items.shortcuts === "chrome" && (command === "plus" || command === "minus" || command === "next" || command === "prev" || command === "clear")) {
      chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        var instance = URLP.Background.getInstance(tabs[0].id);
        if ((command === "plus" || command === "minus" || command === "next" || command === "prev") && (items.quickEnabled || instance.enabled)) {
          if (!instance && items.quickEnabled) {
            instance = URLP.Background.buildInstance(undefined, tabs[0], items);
          }
          URLP.Background.updateTab(instance, command);
        } else if (command === "clear" && instance && instance.enabled) {
          URLP.Background.setInstance(tabs[0].id, undefined);
        }
      });
    } 
  });
});

// Listen for requests from chrome.runtime.sendMessage (shortcuts.js)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var instance;
  switch (request.greeting) {
    case "getInstance":
      sendResponse({instance: URLP.Background.getInstance(sender.tab.id)});
      break;
    case "setInstance":
      URLP.Background.setInstance(sender.tab.id, request.instance);
      break;
    case "updateTab":
      instance = URLP.Background.getInstance(sender.tab.id);
      if (!instance && sender.tab && request.items) {
        instance = URLP.Background.buildInstance(undefined, sender.tab, request.items);
      }
      URLP.Background.updateTab(instance, request.action);
      break;
  }
  sendResponse({});
});