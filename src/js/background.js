/**
 * URL Incrementer Background
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Background = function () {

  // The storage default values
  // Note: Storage.set can only set top-level JSON objects, do not use nested JSON objects (instead, prefix keys that should be grouped together)
  const STORAGE_DEFAULT_VALUES = {
    /* permissions */ "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
    /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
    /* popup */       "popupButtonSize": 32, "popupAnimationsEnabled": true, "popupOpenSetup": true, "popupSettingsCanOverwrite": true,
    /* nextprev */    "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times",
    /* download */    "downloadStrategy": "types", "downloadTypes": [], "downloadSelector": "", "downloadSameDomain": true, "downloadEnforceMime": true, "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null,
    /* shortcuts */   "quickEnabled": true,
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [3, "ArrowUp"], "keyDecrement": [3, "ArrowDown"], "keyNext": [3, "ArrowRight"], "keyPrev": [3, "ArrowLeft"], "keyClear": [3, "KeyX"], "keyAuto": [3, "KeyA"], "keyDownload": [],
    /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1, "mouseAuto": -1, "mouseDownload": -1,
    /* increment */   "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "errorSkip": 0, "errorCodes": ["404", "", "", ""],
    /* selection */   "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    /* fun */         "urli": 0
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "increment": { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement": { "text": "-",    "backgroundColor": "#1779BA" },
    "next":      { "text": ">",    "backgroundColor": "#05854D" },
    "prev":      { "text": "<",    "backgroundColor": "#05854D" },
    "clear":     { "text": "X",    "backgroundColor": "#FF0000" },
    "auto":      { "text": "AUTO", "backgroundColor": "#FF6600" },
    "autotimes": { "text": "",     "backgroundColor": "#FF6600" },
    "autopause": { "text": "❚❚",    "backgroundColor": "#FF6600" },
    "download":  { "text": "DL",   "backgroundColor": "#663399" },
    "skip":      { "text": "",     "backgroundColor": "#000000" }, //"#FFCC22" },
    "default":   { "text": "",     "backgroundColor": [0,0,0,0] }
  },

  // The individual tab instances. Note: We never save instances due to URLs being a privacy concern
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
  function buildInstance(tab, items) {
    var selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom),
        instance = {
          "enabled": false, "autoEnabled": false, "downloadEnabled": false, "autoPaused": false, "enhancedMode": items.permissionsEnhancedMode,
          "tabId": tab.id, "url": tab.url,
          "selection": selectionProps.selection, "selectionStart": selectionProps.selectionStart,
          "leadingZeros": items.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1,
          "interval": items.interval,
          "base": items.base, "baseCase": items.baseCase,
          "errorSkip": items.errorSkip, "errorCodes": items.errorCodes,
          "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
          "autoAction": items.autoAction, "autoTimesOriginal": items.autoTimes, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait, "autoBadge": items.autoBadge,
          "downloadStrategy": items.downloadStrategy, "downloadTypes": items.downloadTypes, "downloadSelector": items.downloadSelector,
          "downloadSameDomain": items.downloadSameDomain, "downloadEnforceMime": items.downloadEnforceMime,
          "downloadIncludes": items.downloadIncludes, "downloadExcludes": items.downloadExcludes,
          "downloadMinMB": items.downloadMinMB, "downloadMaxMB": items.downloadMaxMB
    };
    return instance;
  }

  /**
   * Sets the browser action badge for this tabId. Can either be temporary or for an indefinite time.
   *
   * @param tabId           the tab ID to set this badge to
   * @param badge           the badge key to set from BROWSER_ACTION_BADGES
   * @param temporary       boolean indicating whether the badge should be displayed temporarily
   * @param text            (optional) the text to use instead of the the badge text
   * @param backgroundColor (optional) the backgroundColor to use instead of the badge backgroundColor
   */
  function setBadge(tabId, badge, temporary, text, backgroundColor) {
    chrome.browserAction.setBadgeText({text: text ? text : BROWSER_ACTION_BADGES[badge].text, tabId: tabId});
    chrome.browserAction.setBadgeBackgroundColor({color: backgroundColor ? backgroundColor : BROWSER_ACTION_BADGES[badge].backgroundColor, tabId: tabId});
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

    // Reject the action if the instance doesn't exist        
    if (!instance) {
      return;
    }
        
    // Get the most recent instance from Background in case auto has been paused
    if (instance.autoEnabled) {
      instance = getInstance(instance.tabId);
    }

    // Handle autoTimes
    if (instance.autoEnabled && !instance.autoPaused) {
      if (instance.autoAction === action) {
        instance.autoTimes--;
      } else if ((instance.autoTimes < instance.autoTimesOriginal) &&
        ((instance.autoAction === "increment" || instance.autoAction === "decrement") && (action === "increment" || action === "decrement")) ||
        ((instance.autoAction === "next" || instance.autoAction === "prev") && (action === "next" || action === "prev"))) {
        instance.autoTimes++;
      }
    }
        
    switch (action) {
      case "increment":
      case "decrement":
        // If URLI didn't find a selection, don't update the tab
        if (instance.selection !== "" && instance.selectionStart >= 0) {
          actionPerformed = true;
          if ((instance.errorSkip > 0 && instance.errorCodes && instance.errorCodes.length > 0) && (!(caller === "popupClickActionButton" || caller === "auto") || instance.enhancedMode)) {
            console.log("doing error skipping");
            chrome.tabs.executeScript(instance.tabId, {file: "js/increment-decrement.js", runAt: "document_start"}, function() {
              var code = "URLI.IncrementDecrement.modifyURLAndSkipErrors(" + 
                JSON.stringify(action) + ", " +
                JSON.stringify(instance) + ", " +
                JSON.parse(instance.errorSkip) + ");";
              // No callback because this will be executing async code and then sending a message back to the background
              chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_start"});
            });
          } else {
            console.log("NOT  doing error skipping");
            urlProps = URLI.IncrementDecrement.modifyURL(action, instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros);
            instance.url = urlProps.urlmod;
            instance.selection = urlProps.selectionmod;
            chrome.tabs.update(instance.tabId, {url: instance.url});
            if (instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
              setInstance(instance.tabId, instance);
            }
            chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
          }
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
            if (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) {
              setInstance(instance.tabId, instance);
            }
            chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
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
              JSON.stringify(instance.downloadExcludes) + ", " +
              JSON.parse(instance.downloadSameDomain) + ");";
            chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
              if (results && results[0]) {
                var urls = results[0];
                for (let url of urls) {
                  console.log("downloading url=" + url);
                  chrome.downloads.download({url: url}, function(downloadId) {
                    chrome.downloads.search({id: downloadId}, function(results) {
                      const downloadItem = results ? results[0] : undefined;
                      const MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "video/webm", "audio/mpeg", "audio/mp3", "video/mp4", "application/zip"];
                      if (downloadItem) {
                        console.log(downloadItem);
                        console.log("mime=" + downloadItem.mime);
                        console.log("totalBytes=" + downloadItem.totalBytes);
                        if (instance.downloadStrategy !== "page") {
                          if (instance.downloadEnforceMime && instance.downloadStrategy === "types") {
                            if (!MIME_TYPES.includes(downloadItem.mime)) {
                              console.log("Cancelking@@@ because download mime isnt in mmime types, it is=" + downloadItem.mime);
                              chrome.downloads.cancel(downloadId);
                            }
                          }
                          if (downloadItem.totalBytes > 0 && (
                              (!isNaN(instance.downloadMinMB) && instance.downloadMinMB > 0 ? (instance.downloadMinMB * 1048576) >= downloadItem.totalBytes : false) ||
                              (!isNaN(instance.downloadMaxMB) && instance.downloadMaxMB > 0 ? (instance.downloadMaxMB * 1048576) <= downloadItem.totalBytes : false)
                            )) {
                            console.log("Canceling!!! because totalbytes is " + downloadItem.totalBytes);
                            console.log("instance min bytes=" + (instance.downloadMinMB * 1048576) + " --- max bytes=" + (instance.downloadMaxMB * 1048576));
                            chrome.downloads.cancel(downloadId);
                          }
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
      console.log("in auto action in background.js");
      console.log("caller=" + caller + " instance.autoPaused=" + instance.autoPaused);
      console.log(instance);
      //instance = getInstance(instance.tabId); // popup...bad data?
        URLI.Auto.pauseOrResumeAutoTimeout(instance);
        if (callback) {
          callback(instance);
        } else {
        chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
        }
        
        break;
      case "clear":
        actionPerformed = true;
        chrome.storage.sync.get(null, function(items) {
          if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
            chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
          }
          if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
            chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
          }
          if (instance && instance.autoEnabled) {
            instance.autoEnabled = false;
            URLI.Auto.clearAutoTimeout(instance);
            URLI.Auto.removeAutoListener();
            // Don't set the clear badge if popup is just updating the instance (ruins auto badge if auto is re-set)
            if (caller !== "tabRemovedListener") {
              if (caller !== "popupClearBeforeSet") {
                setBadge(instance.tabId, "clear", true);
              } else {
                setBadge(instance.tabId, "default", false);
              }
            }
          }
           deleteInstance(instance.tabId);
           // for callers like popup that still need the instance, disable all states
          instance.enabled = instance.downloadEnabled = instance.autoEnabled = false;
          instance.autoTimes = items.autoTimes;
          if (callback) {
            callback(instance);
          } else {
             chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
          }

        });
        break;
      default:
        break;
    }
    // Icon Feedback
    if (actionPerformed && !(caller === "popupClearBeforeSet" || caller === "tabRemovedListener" || instance.autoEnabled)) {
      chrome.storage.sync.get(null, function(items) {
        if (items.iconFeedbackEnabled) {
          setBadge(instance.tabId, action, true);
        }
      });
    }
  }

  /**
   * Listen for installation changes and do storage/extension initialization work.
   */
  function installedListener(details) {
    // New Installations: Setup storage and open Options Page in a new tab
    if (details.reason === "install") {
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          chrome.runtime.openOptionsPage();
        });
      });
    }
    // Update Installations (Below Version 5.0): Reset storage and remove all optional permissions
    else if (details.reason === "update") {
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          if (chrome.declarativeContent) {
            chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
          }
          chrome.permissions.remove({ permissions: ["declarativeContent"], origins: ["<all_urls>"]}, function(removed) {});
        });
      });
    }
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (e.g. Content Scripts).
   */
  function messageListener(request, sender, sendResponse) {
    var instance;
    switch (request.greeting) {
      case "getInstance":
        sendResponse({instance: URLI.Background.getInstance(sender.tab.id)});
        break;
      case "performAction":
        chrome.storage.sync.get(null, function(items) {
          instance = getInstance(sender.tab.id);
          if (!instance && request.action !== "auto") {
            instance = buildInstance(sender.tab, items);
          }
          if (instance) {
            performAction(instance, request.action, "internal-shortcuts");
          }
        });
        break;
      case "incrementDecrementSkipErrors":
        //instance = getInstance(sender.tab.id);
        if (request.instance) {
            chrome.tabs.update(request.instance.tabId, {url: request.instance.url});
            if (request.instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
              setInstance(request.instance.tabId, request.instance);
            }
            chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: request.instance});
        }
        break;
      case "setBadgeSkipErrors":
        //instance = getInstance(sender.tab.id);
        console.log("setBadgeSkipErrors!!");
        console.log("urlprops should have errrocode...");
        console.log(request.errorCode);
        if (request.errorCode && request.instance && !request.instance.autoEnabled) {
          console.log("setting badge!");
          setBadge(sender.tab.id, "skip", true, request.errorCode + "");
        }
        break;
      default:
        break;
    }
    sendResponse({});
  }

  /**
   * Listen for commands (Browser Extension shortcuts) and perform the command's action.
   */
  function commandListener(command) {
    if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "auto" || command === "clear")  {
      chrome.storage.sync.get(null, function(items) {
        if (!items.permissionsInternalShortcuts) {
          chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
            var instance = getInstance(tabs[0].id);
            if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") && (items.quickEnabled || (instance && instance.enabled)) ||
                (command === "auto" && instance && instance.autoEnabled) ||
                (command === "clear" && instance && (instance.enabled || instance.autoEnabled || instance.downloadEnabled))) {
              if (!instance && items.quickEnabled) {
                instance = buildInstance(tabs[0], items);
              }
              performAction(instance, command, "command");
            }
          });
        }
      });
    }
  }

  /**
   * Listen for when tabs are removed and clear the instances if they exist.
   */
  function tabRemovedListener(tabId, removeInfo) {
    var instance = URLI.Background.getInstance(tabId);
    if (instance) {
      performAction(instance, "clear", "tabRemovedListener");
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
    performAction: performAction,
    installedListener: installedListener,
    messageListener: messageListener,
    commandListener: commandListener,
    tabRemovedListener: tabRemovedListener
  };
}();

// Background Listeners
chrome.runtime.onInstalled.addListener(URLI.Background.installedListener);
chrome.runtime.onMessage.addListener(URLI.Background.messageListener);
chrome.commands.onCommand.addListener(URLI.Background.commandListener);
chrome.tabs.onRemoved.addListener(URLI.Background.tabRemovedListener);