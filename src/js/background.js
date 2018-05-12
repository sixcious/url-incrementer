/**
 * URL Incrementer Background
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Background = URLI.Background || function () {

  // SDV: Storage Default Values Note: Storage.sync can only set top-level JSON objects, do not use nested JSON objects
  const SDV = {
    /* permissions */ "permissionsAllURLs": false, "permissionsInternalShortcuts": false, "permisssionsDownload": false,
    /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
    /* popup */       "popupButtonSize": 24, "popupAnimationsEnabled": true, "popupOpenSetup": true, "popupSettingsCanOverwrite": true,
    /* nextPrev */    "nextPrevPopupButtons": false, "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true,
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true,
    /* download */    "downloadStrategy": "types", "downloadTypes": ["jpg"], "downloadSelector": "[src*='.jpg' i],[href*='jpg' i]", "downloadIncludes": "", "downloadMinBytes": 0.0, "downloadMaxBytes": 10.0, "downloadLimit": 10,
    /* shortcuts */   "quickEnabled": true,
    /* internalShortcuts */
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [5, "ArrowUp"], "keyDecrement": [5, "ArrowDown"], "keyNext": [], "keyPrev": [], "keyClear": [5, "KeyX"],
    /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1,
    /* incrementDecrement */
      "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase",
      "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
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
      if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(tabId, {greeting: "removeKeyListener"});
      }
      if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(tabId, {greeting: "removeMouseListener"});
      }
      if (instance && instance.autoEnabled) {
        instance.autoEnabled = false;
        URLI.Auto.clearAutoTimeout(instance);
        URLI.Auto.removeAutoListener();
      }
      if (items.iconFeedbackEnabled) {
        chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000", tabId: tabId});
        chrome.browserAction.setBadgeText({text: "x", tabId: tabId});
        setTimeout(function () {
          chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0], tabId: tabId});
          chrome.browserAction.setBadgeText({text: "", tabId: tabId});
        }, 2000);
      }
      instances.delete(tabId);
    });
  }

  /**
   * Builds an instance with default values.
   * 
   * @param tab      the tab properties (id, url) to set this instance with
   * @param items    the storage items to help build a default instance
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(tab, items) {
    var selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom),
        instance = {
        "enabled": false, "autoEnabled": false, "downloadEnabled": false,
        "tabId": tab.id, "url": tab.url,
        "selection": selectionProps.selection, "selectionStart": selectionProps.selectionStart,
        "leadingZeros": items.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1,
        "interval": items.interval,
        "base": items.base, "baseCase": items.baseCase,
        "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
        "autoAction": items.autoAction, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait,
        "downloadStrategy": items.downloadStrategy, "downloadTypes": items.downloadTypes, "downloadSelector": items.downloadSelector, "downloadIncludes": items.downloadIncludes, "downloadMinBytes": items.downloadMinBytes, "downloadMaxBytes": items.downloadMaxBytes, "downloadLimit": items.downloadLimit
    };
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
  // Update Installations (Below Version 4.4): Reset storage and remove all optional permissions
  if (details.reason === "update") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set(URLI.Background.getSDV(), function() {
        if (chrome.declarativeContent) {
          chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
        }
        chrome.permissions.remove({ permissions: ["declarativeContent"], origins: ["<all_urls>"]}, function(removed) {});
      });
    });
  }
});

// Listen for requests from chrome.runtime.sendMessage (Content Scripts)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var instance;
  switch (request.greeting) {
    case "getInstance":
      sendResponse({instance: URLI.Background.getInstance(sender.tab.id)});
      break;
    case "deleteInstance":
      URLI.Background.deleteInstance(sender.tab.id);
      break;
    case "updateTab":
      chrome.storage.sync.get(null, function(items) {
        instance = URLI.Background.getInstance(sender.tab.id);
        if (!instance && sender.tab) {
          instance = URLI.Background.buildInstance(sender.tab, items);
        }
        URLI.Background.updateTab(instance, request.action);
      });
      break;
    default:
      break;
  }
  sendResponse({});
});

// Listen for commands (Chrome shortcuts) and perform the command's action
chrome.commands.onCommand.addListener(function(command) {
  if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "clear") {
    chrome.storage.sync.get(null, function(items) {
      if (!items.permissionsInternalShortcuts) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
          var instance = URLI.Background.getInstance(tabs[0].id);
          if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") && 
              (items.shortcuts.quickEnabled || (instance && instance.enabled))) {
            if (!instance && items.shortcuts.quickEnabled) {
              instance = URLI.Background.buildInstance(tabs[0], items);
            }
            URLI.Background.updateTab(instance, command);
          } else if (command === "clear" && instance && instance.enabled) {
            URLI.Background.deleteInstance(tabs[0].id);
          }
        });
      }
    });
  }
});

// Listen for when tabs are removed and delete their instances if they exist
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (URLI.Background.getInstance(tabId)) {
    URLI.Background.deleteInstance(tabId);
  }
});