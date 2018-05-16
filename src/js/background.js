/**
 * URL Incrementer Background
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Background = URLI.Background || function () {

//TODO: Remove "Enabled"s from keys
  // The storage default values. Note: Storage.set can only set top-level JSON objects, do not use nested JSON objects
  const STORAGE_DEFAULT_VALUES = {
    /* permissions */ "permissionsInternalShortcuts": false, "permissionsNextPrevEnhanced": false, "permissionsDownload": false,
    /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
    /* popup */       "popupButtonSize": 24, "popupAnimationsEnabled": true, "popupOpenSetup": true, "popupSettingsCanOverwrite": true,
    /* nextPrev */    "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times",
    /* download */    "downloadStrategy": "types", "downloadTypes": [], "downloadSelector": "", "downloadIncludes": "", "downloadLimit": 10, "downloadMinBytes": 0, "downloadMaxBytes": 0,  "downloadSameDomain": true,
    /* shortcuts */   "quickEnabled": true,
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [5, "ArrowUp"], "keyDecrement": [5, "ArrowDown"], "keyNext": [], "keyPrev": [], "keyClear": [5, "KeyX"],
    /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1,
    /* increment */   "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase",
    /* selection */   "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    /* fun */         "urliClickCount": 0
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "increment": { "text": "+",    "backgroundColor": [0,0,0,0] },
    "decrement": { "text": "-",    "backgroundColor": [0,0,0,0] },
    "next":      { "text": ">",    "backgroundColor": [0,0,0,0] },
    "prev":      { "text": "<",    "backgroundColor": [0,0,0,0] },
    "download":  { "text": "DL",   "backgroundColor": [0,0,0,0] },
    "auto":      { "text": "AUTO", "backgroundColor": "#FF6600" },
    "autotimes": { "text": "",     "backgroundColor": "#FF6600" },
    "clear":     { "text": "X",    "backgroundColor": "#FF0000" },
    "default":   { "text": "",     "backgroundColor": [0,0,0,0] }
  },

  // The individual tab instances. Note: Never save instances due to URLs being a privacy concern
  instances = new Map();

  /**
   * Gets the storage default values (SDV).
   *
   * @return the storage default values (SDV)
   * @public
   */
  function getSDV() {
    return STORAGE_DEFAULT_VALUES;
  }

  /**
   * Gets all instances.
   *
   * @return {Map<tabId, instance>} the tab instances
   * @public
   */
  function getInstances() {
    return instances;
  }

  /**
   * Gets the instance.
   * 
   * @param tabId the tab id to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    return instances.get(tabId);
  }

  /**
   * Sets the instance.
   * 
   * @param tabId    the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    instances.set(tabId, instance);
  }

  /**
   * Deletes the instance.
   *
   * @param tabId the tab id to lookup this instance by
   * @public
   */
  function deleteInstance(tabId) {
    instances.delete(tabId);
  }

  /**
   * Builds an instance with default values.
   * 
   * @param tab   the tab properties (id, url) to set this instance with
   * @param items the storage items to help build a default instance
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(tab, items, callback) {
    var selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom),
        instance = {
        "enabled": false, "autoEnabled": false, "downloadEnabled": false,
        "tabId": tab.id, "url": tab.url,
        "selection": selectionProps.selection, "selectionStart": selectionProps.selectionStart,
        "leadingZeros": items.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1,
        "interval": items.interval,
        "base": items.base, "baseCase": items.baseCase,
        "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
        "autoAction": items.autoAction, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait, "autoBadge": items.autoBadge,
        "downloadStrategy": items.downloadStrategy, "downloadTypes": items.downloadTypes, "downloadSelector": items.downloadSelector,"downloadIncludes": items.downloadIncludes,
        "downloadMinBytes": items.downloadMinBytes, "downloadMaxBytes": items.downloadMaxBytes, "downloadLimit": items.downloadLimit, "downloadSameDomain": items.downloadSameDomain
    };
    if (callback) {
      callback(instance);
    }
    return instance;
  }

  /**
   * Sets the browser action badge for this tabId. Can either be temporary or for an indefinite time.
   *
   * @param tabId     the tab ID to set this badge to
   * @param badge     the badge key to set from BROWSER_ACTION_BADGES
   * @param temporary boolean indicating whether the badge should be displayed temporarily
   */
  function setBadge(tabId, badge, temporary) {
    chrome.browserAction.setBadgeText({text: (badge === "autotimes" && getInstance(tabId) ? getInstance(tabId).autoTimes - 1 + " " : "") + BROWSER_ACTION_BADGES[badge].text, tabId: tabId});
    chrome.browserAction.setBadgeBackgroundColor({color: BROWSER_ACTION_BADGES[badge].backgroundColor, tabId: tabId});
    if (temporary) {
      setTimeout(function () {
        chrome.browserAction.setBadgeText({text: BROWSER_ACTION_BADGES["default"].text, tabId: tabId});
        chrome.browserAction.setBadgeBackgroundColor({color: BROWSER_ACTION_BADGES["default"].backgroundColor, tabId: tabId});
      }, 2000);
    }
  }

  /**
   * Performs the instance's action.
   * 
   * @param instance the instance for this tab
   * @param action   the action (e.g. increment or decrement)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @public
   */
  function performAction(instance, action, caller, callback) {
    var actionPerformed = false,
        urlProps;
    switch (action) {
      case "increment":
      case "decrement":
        // If URLI didn't find a selection, don't update the tab
        if (instance.selection !== "" && instance.selectionStart >= 0) {
          actionPerformed = true;
          urlProps = URLI.IncrementDecrement.modifyURL(instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros, action);
          instance.url = urlProps.urlmod;
          instance.selection = urlProps.selectionmod;
          chrome.tabs.update(instance.tabId, {url: instance.url});
        }
        if (instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
          setInstance(instance.tabId, instance);
        }
        if (callback) {
          callback(instance);
        }
        break;
      case "next":
      case "prev":
        actionPerformed = true;
        chrome.tabs.executeScript(instance.tabId, {file: "js/next-prev.js", runAt: "document_end"}, function() {
          var code = "URLI.NextPrev.getURL(" + JSON.stringify(action) + ", " + JSON.stringify(instance.nextPrevLinksPriority) + ", " + JSON.parse(instance.nextPrevSameDomainPolicy) + ");";
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
      case "download":
        if (instance && instance.downloadEnabled) {
          actionPerformed = true;
          chrome.tabs.executeScript(instance.tabId, {file: "js/download.js", runAt: "document_end"}, function() {
            var code = "URLI.Download.findDownloadURLs(" + 
              JSON.stringify(instance.downloadStrategy) + ", " +
              JSON.stringify(instance.downloadTypes) + ", " +
              JSON.stringify(instance.downloadSelector) + ", " +
              JSON.stringify(instance.downloadIncludes) + ", " +
              JSON.parse(instance.downloadSameDomain) + ");";
            chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
              if (results && results[0]) {
                for (let url of results[0]) {
                  console.log("downloading url=" + url);
                  chrome.downloads.download({url: url}, function(downloadId) {
                    chrome.downloads.search({id: downloadId}, function(results) {
                      const downloadItem = results ? results[0] : undefined;
                      if (downloadItem) {
                        console.log(downloadItem);
                        console.log("totalBytes=" + downloadItem.totalBytes);
                        if (instance.downloadRestrictSize && downloadItem.totalBytes > 0 && 
                           (instance.downloadMinBytes ? downloadItem.totalBytes >= instance.downloadMinBytes : false) &&
                           (instance.downloadMaxBytes ? downloadItem.totalBytes <= instance.downloadMaxBytes : false)) {
                          console.log("Canceling!!! because totalbytes is " + downloadItem.totalBytes);
                          chrome.downloads.cancel(downloadId);
                        }
                      }
                    });
                  });
                }
              } else { console.log("no results"); }
              if (callback) { callback(instance); }
            });
          });
        }
        break;
      case "auto":
        URLI.Auto.clearAutoTimeout(instance);
        URLI.Auto.setAutoTimeout(instance);
        URLI.Auto.addAutoListener();
        setBadge(instance.tabId, "auto", false);
        break;
      case "clear":
        actionPerformed = true;
        chrome.storage.sync.get(null, function(items) {
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
            setBadge(instance.tabId, "clear", true);
          }
           // for callers like popup that still need the instance, disable all states
          instance.enabled = instance.downloadEnabled = instance.autoEnabled = false;
          if (callback) {
            callback(instance);
          }
          deleteInstance(instance.tabId);
        });
        break;
      default:
        break;
    }
    // Icon Feedback
    if (actionPerformed) {
      chrome.storage.sync.get(null, function(items) {
        if (items.iconFeedbackEnabled && !instance.autoEnabled) {
          setBadge(instance.tabId, action, true);
        }
      });
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
    setBadge: setBadge,
    performAction: performAction
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
  else if (details.reason === "update") {
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
    case "performAction":
      chrome.storage.sync.get(null, function(items) {
        instance = URLI.Background.getInstance(sender.tab.id);
        if (!instance) {
          instance = URLI.Background.buildInstance(sender.tab, items);
        }
        URLI.Background.performAction(instance, request.action, "internal-shortcuts");
      });
      break;
    default:
      break;
  }
  sendResponse({});
});

// Listen for commands (Chrome shortcuts) and perform the command's action
chrome.commands.onCommand.addListener(function(command) {
  if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "download" || command === "clear")  {
    chrome.storage.sync.get(null, function(items) {
      if (!items.permissionsInternalShortcuts) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
          var instance = URLI.Background.getInstance(tabs[0].id);
          if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") && (items.quickEnabled || (instance && instance.enabled)) ||
              (command === "download" && instance && instance.enabled && instance.downloadEnabled) ||
              (command === "clear" && instance && instance.enabled)) {
            if (!instance && items.quickEnabled) {
              instance = URLI.Background.buildInstance(tabs[0], items);
            }
            URLI.Background.performAction(instance, command, "commands");
          }
        });
      }
    });
  }
});

// Listen for when tabs are removed and clear the instances if they exist
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  var instance = URLI.Background.getInstance(tabId);
  if (instance) {
    URLI.Background.performAction(instance, "clear", "tabs.onRemoved");
  }
});