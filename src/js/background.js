/**
 * URL Incrementer Background
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Background = URLI.Background || function () {

  // SDV: Storage Default Values
  const SDV = {
    "autoEnabled": true, "downloadEnabled": false, "internalShortcutsEnabled": false,
    "allURLsPermissionsGranted": false, "downloadPermissionsGranted": false, "internalShortcutsPermissionsGranted": false,
    "quickEnabled": true,
    "iconColor": "dark",
    "iconFeedbackEnabled": false,
    "popupIconSize": 20,
    "animationsEnabled": true,
    "popupSettingsCanOverwrite": true,
    "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase",
    "selectionCustom": {url: "", pattern: "", flags: "", group: 0, index: 0},
    "nextPrevPopupButtons": false, "linksPriority": "attributes", "sameDomainPolicy": true,
    "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [5, "ArrowUp"], "keyDecrement": [5, "ArrowDown"], "keyNext": [], "keyPrev": [], "keyClear": [5, "KeyX"],
    "mouseEnabled": false, "mouseQuickEnabled": false, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1,
    "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true,
    "downloadStrategy": "types", "downloadTypes": ["jpg"], "downloadSelector": "[src*='.jpg' i],[href*='jpg' i]", "downloadIncludes": "", "downloadMinBytes": 0.0, "downloadMaxBytes": 10.0, "downloadLimit": 10,
    "urliClickCount": 0
  };

  var instances = new Map(); // The individual tab instances

  /**
   * Gets the storage default values (SDV).
   *
   * @return the storage default values (SDV)
   * @public
   */
  function getSDV() {
    return SDV;
  }

  /**
   * Gets all the tab instances.
   *
   * @return {Map<tabId, instance>} the tab instances
   * @public
   */
  function getInstances() {
    return instances;
  }

  /**
   * Gets the tab's instance.
   * 
   * @param tabId the tab id to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    return instances.get(tabId);
  }

  /**
   * Sets the tab's instance.
   * 
   * @param tabId    the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    instances.set(tabId, instance);
  }

  /**
   * Deletes the tab's instance and does any clean up work like removing listeners.
   *
   * @param tabId the tab id to lookup this instance by
   * @public
   */
  function deleteInstance(tabId) {
    chrome.storage.sync.get(null, function(items) {
      var instance = getInstance(tabId);
      if (items.internalShortcutsEnabled && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(tabId, {greeting: "removeKeyListener"});
      }
      if (items.internalShortcutsEnabled && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(tabId, {greeting: "removeMouseListener"});
      }
      if (items.autoEnabled && instance && instance.autoEnabled) {
        chrome.tabs.sendMessage(tabId, {greeting: "clearAutoTimeout"});
      }
      if (items.iconFeedbackEnabled) {
        chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000", tabId: tabId});
        chrome.browserAction.setBadgeText({text: "x", tabId: tabId});
        chrome.browserAction.getBadgeBackgroundColor({}, function(result) {
          console.log("r@@@esult=" + result);
          setTimeout(function () {
            chrome.browserAction.setBadgeBackgroundColor({color: result, tabId: tabId});
            chrome.browserAction.setBadgeText({text: "", tabId: tabId});
          }, 2000);
        });
      }
      instances.delete(tabId);
    });
  }

  /**
   * Builds/Updates an instance with default values.
   * 
   * @param instance the instance, if any, to continue building off of
   * @param tab      the tab properties (id, url) to set this instance with
   * @param items    the storage items to help build a default instance
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(instance, tab, items) {
    var selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom);
    if (!instance) {
      instance = {};
      instance.enabled = false;
      instance.interval = items.interval;
      instance.base = items.base;
      instance.baseCase = items.baseCase;
      instance.linksPriority = items.linksPriority;
      instance.sameDomainPolicy = items.sameDomainPolicy;
      instance.autoEnabled = false;
      instance.autoAction = items.autoAction;
      instance.autoTimes = items.autoTimes;
      instance.autoSeconds = items.autoSeconds;
      instance.autoWait = items.autoWait;
      instance.downloadEnabled = false;
      instance.downloadStrategy = items.downloadStrategy;
      instance.downloadTypes = items.downloadTypes;
      instance.downloadSelector = items.downloadSelector;
      instance.downloadIncludes = items.downloadIncludes;
      instance.downloadMinBytes = items.downloadMinBytes;
      instance.downloadMaxBytes = items.downloadMaxBytes;
      instance.downloadLimit = items.downloadLimit;
    }
    instance.tabId = tab.id;
    instance.url = tab.url;
    instance.selection = selectionProps.selection;
    instance.selectionStart = selectionProps.selectionStart;
    instance.leadingZeros = items.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1;
    return instance;
  }

  /**
   * Updates the instance's tab based on the desired action.
   * 
   * @param instance the instance for this tab
   * @param action   the operation (e.g. increment or decrement)
   * @param caller   String indicating who called this function (e.g. command)
   * @param callback the function callback (optional)
   * @public
   */
  function updateTab2(instance, action, caller, callback) {
    var urlProps;
    // Icon Feedback
    chrome.storage.sync.get(null, function(items) {
      var text = action === "increment" ? "+" : action === "decrement" ? "-" : action === "next" ? ">" : action === "prev" ? "<" : ".";
      if (items.iconFeedbackEnabled) {
        chrome.browserAction.setBadgeText({text: text, tabId: instance.tabId});
        setTimeout(function () { chrome.browserAction.setBadgeText({text: "", tabId: instance.tabId}); }, 2000);
      }
    });
    switch (action) {
      case "increment":
      case "decrement":
        // If URLI didn't find a selection, don't update the tab
        if (instance.selection !== "" && instance.selectionStart >= 0) {
          urlProps = URLI.IncrementDecrement.modifyURL(instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros, action);
          instance.url = urlProps.urlmod;
          instance.selection = urlProps.selectionmod;
          chrome.tabs.update(instance.tabId, {url: instance.url});
        }
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
          var code = "URLI.NextPrev.getURL(" + JSON.stringify(action) + ", " + JSON.stringify(instance.linksPriority) + ", " + JSON.parse(instance.sameDomainPolicy) + ");";
          chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results) {
            if (results && results[0]) {
              instance.url = results[0];
              chrome.tabs.update(instance.tabId, {url: instance.url});
            }
            if (callback) {
              callback(instance);
            }
          });
        });
        break;
    }
  }

  function updateTab(instance, action, caller, callback) {
    if (instance && instance.enabled && instance.downloadEnabled) {
      chrome.tabs.executeScript(instance.tabId, {file: "js/download.js", runAt: "document_end"}, function() {
        code = "URLI.Download.findDownloadURLs(" + JSON.stringify(instance.downloadSelector) + ");";
        console.log("code=" + code);
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
          if (results && results[0]) {
            console.log("results=" + results);
            console.log("results[0]" + results[0]);
            console.log("resuls length" + results[0].length);
            var urls = results[0];
            for (var i = 0; i < urls.length; i++ ) {
              var url = urls[i];
              console.log("downloading url=" + url);
              chrome.downloads.download({url: url}, function(downloadId) {
                chrome.downloads.search({id: downloadId}, function(results) {
                  const downloadItem = results ? results[0] : undefined;
                  console.log(downloadItem);
                  console.log("totalBytes=" + downloadItem.totalBytes);
                 // if (downloadItem && (downloadItem.totalBytes < 500 || downloadItem.totalBytes > 5000000)) {
                 //   console.log("Canceling!!! because totalbytes is " + downloadItem.totalBytes);
                 //   chrome.downloads.cancel(downloadId);
                 // }
                });
              });
            }
          } else {
            console.log("no results");
          }
          updateTab2(instance, action, caller, callback);
        });
      });
    }
    else {
      updateTab2(instance, action, caller, callback)
    }
  }

  // Return Public Functions
  return {
    getSDV: getSDV,
    getInstances: getInstances,
    getInstance: getInstance,
    setInstance: setInstance,
    deleteInstance: deleteInstance,
    buildInstance: buildInstance,
    updateTab: updateTab
  };
}();

// Listen for installation changes and do storage/extension initialization work
chrome.runtime.onInstalled.addListener(function(details) {
  // New Installations: Setup storage and open Options Page in a new tab
  if (details.reason === "install") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set(URLI.Background.getSDV(), function() {
        chrome.runtime.openOptionsPage();
      });
    });
  }
  // Update Installations (Version 4.0 and Below): Reset storage and remove all optional permissions
  if (details.reason === "update") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set(URLI.Background.getSDV(), function() {
        if (chrome.declarativeContent) {
          chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
        }
        chrome.permissions.remove({ permissions: ["declarativeContent"], origins: ["<all_urls>"]}, function(removed) { });
      });
    });
  }
});

// Listen for requests from chrome.runtime.sendMessage (Content Scripts Environment auto.js, shortcuts.js)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var instance;
  switch (request.greeting) {
    case "getInstance":
      sendResponse({instance: URLI.Background.getInstance(sender.tab.id)});
      break;
    case "setInstance":
      URLI.Background.setInstance(sender.tab.id, request.instance);
      break;
    case "deleteInstance":
      URLI.Background.deleteInstance(sender.tab.id);
      break;
    case "updateTab":
      chrome.storage.sync.get(null, function(items) {
        instance = URLI.Background.getInstance(sender.tab.id);
        if (!instance && sender.tab) {
          instance = URLI.Background.buildInstance(undefined, sender.tab, items);
        }
        URLI.Background.updateTab(instance, request.action);
      });
      break;
    case "closePopup":
      chrome.extension.getViews({type: "popup", windowId: sender.tab.windowId}).forEach(function(popup) { popup.close(); });
      break;
    default:
      break;
  }
  sendResponse({});
});

// Listen for commands (Chrome shortcuts) and perform the command's action
chrome.commands.onCommand.addListener(function(command) {
  chrome.storage.sync.get(null, function(items) {
    if (!items.internalShortcutsEnabled && (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "clear")) {
      chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        var instance = URLI.Background.getInstance(tabs[0].id);
        if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") && (items.quickEnabled || (instance && instance.enabled))) {
          if (!instance && items.quickEnabled) {
            instance = URLI.Background.buildInstance(undefined, tabs[0], items);
          }
          URLI.Background.updateTab(instance, command);
        } else if (command === "clear" && instance && instance.enabled) {
          URLI.Background.deleteInstance(tabs[0].id);
        }
      });
    }
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log("tabs.onUpdated!");
  console.log(changeInfo);
  if (changeInfo.status === "complete") {
  var instance = URLI.Background.getInstance(tabId);
    // If auto is enabled for this instance ...
    if (instance && instance.enabled && instance.autoEnabled) {
      // Subtract from autoTimes and if it's still greater than 0, continue auto action, else clear the instance
      if (instance.autoTimes-- > 0) {
        URLI.Background.setInstance(tabId, instance);
        // If auto wait is enabled, only add the window load listener if the document hasn't finished loading, or it will never fire 
        //if (instance.autoWait && document.readyState !== "complete") {
       //   window.addEventListener("load", function() { setAutoTimeout(); });
       // } else {
       //   setAutoTimeout();
      //  }
      
          instance.autoTimeout = setTimeout(function () {
              URLI.Background.updateTab(instance, instance.autoAction);
    }, instance.autoSeconds * 1000);
      
      } else {
        clearTimeout(instance.autoTimeout);
        URLI.Background.deleteInstance(tabId);
        chrome.extension.getViews({type: "popup", windowId: tab.windowId}).forEach(function(popup) { popup.close(); });
      }
    }
  }
});