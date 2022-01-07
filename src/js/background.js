/**
 * URL Incrementer
 * @copyright © 2020 Roy Six
 * @license https://github.com/sixcious/url-incrementer/blob/main/LICENSE
 */

var URLI = URLI || {};

URLI.Background = function () {

  // The storage default values
  // Note: Storage.set can only set top-level JSON objects, do not use nested JSON objects (instead, prefix keys that should be grouped together)
  const STORAGE_DEFAULT_VALUES = {
    /* permissions */ "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
    /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
    /* popup */       "popupButtonSize": 32, "popupAnimationsEnabled": true, "popupOpenSetup": true, "popupSettingsCanOverwrite": true,
    /* shortcuts */   "quickEnabled": true,
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [6, "ArrowUp"], "keyDecrement": [6, "ArrowDown"], "keyNext": [6, "ArrowRight"], "keyPrev": [6, "ArrowLeft"], "keyClear": [6, "KeyX"], "keyAuto": [6, "KeyA"],
    /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1, "mouseAuto": -1,
    /* incdec */      "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "errorSkip": 0, "errorCodes": ["404", "", "", ""], "errorCodesCustomEnabled": false, "errorCodesCustom": [], "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    /* nextprev */    "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times",
    /* download */    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null, "downloadPreview": ["thumb", "extension", "tag", "compressed"],
    /* fun */         "urli": "loves incrementing for you"
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
    "skip":      { "text": "",     "backgroundColor": "#000028" }, //"#FFCC22" },
    "default":   { "text": "",     "backgroundColor": [0,0,0,0] }
  },

  // The individual tab instances in Background memory
  // Note: We never save instances in storage due to URLs being a privacy concern
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
    const selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom);
    return {
          "enabled": false, "autoEnabled": false, "downloadEnabled": false, "autoPaused": false, "enhancedMode": items.permissionsEnhancedMode,
          "tabId": tab.id, "url": tab.url,
          "selection": selectionProps.selection, "selectionStart": selectionProps.selectionStart,
          "leadingZeros": items.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1,
          "interval": items.interval,
          "base": items.base, "baseCase": items.baseCase,
          "errorSkip": items.errorSkip, "errorCodes": items.errorCodes, "errorCodesCustomEnabled": items.errorCodesCustomEnabled, "errorCodesCustom": items.errorCodesCustom,
          "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
          "autoAction": items.autoAction, "autoTimesOriginal": items.autoTimes, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait, "autoBadge": items.autoBadge,
          "downloadStrategy": items.downloadStrategy, "downloadExtensions": items.downloadExtensions, "downloadTags": items.downloadTags, "downloadAttributes": items.downloadAttributes, "downloadSelector": items.downloadSelector,
          "downloadIncludes": items.downloadIncludes, "downloadExcludes": items.downloadExcludes,
          "downloadMinMB": items.downloadMinMB, "downloadMaxMB": items.downloadMaxMB,
          "downloadPreview": items.downloadPreview
    };
  }

  /**
   * Sets the browser action badge for this tabId. Can either be temporary or for an indefinite time. Note that when the tab is updated, the browser removes the badge.
   *
   * @param tabId           the tab ID to set this badge to
   * @param badge           the badge key to set from BROWSER_ACTION_BADGES
   * @param temporary       boolean indicating whether the badge should be displayed temporarily
   * @param text            (optional) the text to use instead of the the badge text
   * @param backgroundColor (optional) the backgroundColor to use instead of the badge backgroundColor
   * @public
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
   * Listen for installation changes and do storage/extension initialization work.
   * 
   * @param details the installation details
   * @public
   */
  function installedListener(details) {
    // New Installations: Setup storage and open Options Page in a new tab
    if (details.reason === "install") {
      //console.log("URLI.Background.installedListener() - details.reason === install");
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          chrome.runtime.openOptionsPage();
        });
      });
    }
    // Update Installations Version 5.2 and Below: Reset storage and re-save old increment values and remove all permissions for a clean slate
    else if (details.reason === "update" && details.previousVersion <= "5.2") {
      //console.log("URLI.Background.installedListener() - details.reason === update, previousVersion <= 5.2, actual previousVersion=" + details.previousVersion);
      chrome.storage.sync.get(null, function(olditems) {
        chrome.storage.sync.clear(function() {
          chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
            chrome.storage.sync.set({
              "selectionPriority": olditems && olditems.selectionPriority ? olditems.selectionPriority : STORAGE_DEFAULT_VALUES.selectionPriority,
              "interval": olditems && olditems.interval ? olditems.interval : STORAGE_DEFAULT_VALUES.interval,
              "leadingZerosPadByDetection": olditems && olditems.leadingZerosPadByDetection ? olditems.leadingZerosPadByDetection : STORAGE_DEFAULT_VALUES.leadingZerosPadByDetection,
              "base": olditems && olditems.base ? olditems.base : STORAGE_DEFAULT_VALUES.base,
              "baseCase": olditems && olditems.baseCase ? olditems.baseCase : STORAGE_DEFAULT_VALUES.baseCase,
              "selectionCustom": olditems && olditems.selectionCustom ? olditems.selectionCustom : STORAGE_DEFAULT_VALUES.selectionCustom
            });
          });
        });
      });
      if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined);
      }
      chrome.permissions.remove({ permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]});
    }
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (e.g. Content Scripts).
   * 
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tabId
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @public
   */
  function messageListener(request, sender, sendResponse) {
    //console.log("URLI.Background.messageListener() - request=" + request + " sender=" + sender);
    switch (request.greeting) {
      case "getInstance":
        sendResponse({instance: URLI.Background.getInstance(sender.tab.id)});
        break;
      case "performAction":
        chrome.storage.sync.get(null, function(items) {
          let instance = getInstance(sender.tab.id);
          if (!instance && request.action !== "auto") {
            instance = buildInstance(sender.tab, items);
          }
          if (instance) {
            URLI.Action.performAction(instance, request.action, "shortcuts.js");
          }
        });
        break;
      case "incrementDecrementSkipErrors":
        if (request.instance) {
          chrome.tabs.update(request.instance.tabId, {url: request.instance.url});
          if (request.instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
            URLI.Background.setInstance(request.instance.tabId, request.instance);
          }
          chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: request.instance});
        }
        break;
      case "setBadgeSkipErrors":
        if (request.errorCode && request.instance && !request.instance.autoEnabled) {
          setBadge(sender.tab.id, "skip", true, request.errorCode + "");
        }
        break;
      default:
        break;
    }
    sendResponse({});
  }

  /**
   * Listen for external requests from external extensions: Increment Button and Decrement Button for URLI.
   *
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tabId
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @public
   */
  function messageExternalListener(request, sender, sendResponse) {
    //console.log("URLI.Background.messageExternalListener() - request.action=" + request.action + " sender.id=" + sender.id);
    const URL_INCREMENT_BUTTON_EXTENSION_ID = "decebmdlceenceecblpfjanoocfcmjai",
          URL_DECREMENT_BUTTON_EXTENSION_ID = "nnmjbfglinmjnieblelacmlobabcenfk";
    if (sender && (sender.id === URL_INCREMENT_BUTTON_EXTENSION_ID || sender.id === URL_DECREMENT_BUTTON_EXTENSION_ID)) {
      switch (request.greeting) {
        case "performAction":
          chrome.storage.sync.get(null, function(items) {
            let instance = getInstance(request.tab.id);
            if (!instance && request.action !== "auto") {
              instance = buildInstance(request.tab, items);
            }
            if (instance && (request.action === "increment" || request.action === "decrement")) {
              URLI.Action.performAction(instance, request.action, "externalExtension");
            }
          });
          break;
        default:
          break;
      }
      sendResponse({});
    }
  }

  /**
   * Listen for commands (Browser Extension shortcuts) and perform the command's action.
   * 
   * @param command the shortcut command that was performed
   * @public
   */
  function commandListener(command) {
    if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "auto" || command === "clear")  {
      chrome.storage.sync.get(null, function(items) {
        if (!items.permissionsInternalShortcuts) {
          chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
            if (tabs && tabs[0]) { // for example, tab may not exist if command is called while in popup window
              let instance = getInstance(tabs[0].id);
              if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") && (items.quickEnabled || (instance && instance.enabled)) ||
                  (command === "auto" && instance && instance.autoEnabled) ||
                  (command === "clear" && instance && (instance.enabled || instance.autoEnabled || instance.downloadEnabled))) {
                if (!instance && items.quickEnabled) {
                  instance = buildInstance(tabs[0], items);
                }
                URLI.Action.performAction(instance, command, "command");
              }
            }
          });
        }
      });
    }
  }

  /**
   * Listen for when tabs are removed and clear the instances if they exist.
   * 
   * @param tabId      the tab ID
   * @param removeInfo information about how the tab is being removed (e.g. window closed)
   * @public
   */
  function tabRemovedListener(tabId, removeInfo) {
    const instance = URLI.Background.getInstance(tabId);
    if (instance) {
      URLI.Action.performAction(instance, "clear", "tabRemovedListener");
    }
  }

  /**
   * The chrome.tabs.onUpdated listener that is temporarily added (then removed) for certain events.
   *
   * @param tabId      the tab ID
   * @param changeInfo the status (either complete or loading)
   * @param tab        the tab object
   * @public
   */
  function tabUpdatedListener(tabId, changeInfo, tab) {
    //console.log("URLI.Background.tabUpdatedListener() - the chrome.tabs.onUpdated download preview listener is on!");
    if (changeInfo.status === "complete") {
      const instance = URLI.Background.getInstance(tabId);
      // If download enabled auto not enabled, send a message to the popup to update the download preview (if it's open)
      if (instance && instance.downloadEnabled && !instance.autoEnabled) {
        chrome.runtime.sendMessage({greeting: "updatePopupDownloadPreview", instance: instance});
      }
      chrome.tabs.onUpdated.removeListener(tabUpdatedListener);
    }
  }

  /**
   * The extension's background startup listener that is run the first time the extension starts.
   * For example, when Chrome is started, when the extension is installed or updated, or when the
   * extension is re-enabled after being disabled.
   *
   * Ensures the toolbar icon and declarativeContent rules are set (due to Chrome sometimes not re-setting them).
   *
   * @public
   */
  function startupListener() {
    //console.log("URLI.Background.startupListener()");
    chrome.storage.sync.get(null, function(items) {
      // Ensure the chosen toolbar icon is set
      if (items && ["dark", "light", "rainbow", "urli"].includes(items.iconColor)) {
        //console.log("URLI.Background.startupListener() - setting chrome.browserAction.setIcon() to " + items.iconColor);
        chrome.browserAction.setIcon({
          path : {
            "16": "/img/icons/" + items.iconColor + "/16.png",
            "24": "/img/icons/" + items.iconColor + "/24.png",
            "32": "/img/icons/" + items.iconColor + "/32.png"
          }
        });
      }
      // Ensure Internal Shortcuts declarativeContent rule is added
      // The declarativeContent rule sometimes gets lost when the extension is updated or when the extension is enabled after being disabled
      if (items && items.permissionsInternalShortcuts) {
        if (chrome.declarativeContent) {
          chrome.declarativeContent.onPageChanged.getRules(undefined, function(rules) {
            let shortcutsjsRule = false;
            for (let rule of rules) {
              if (rule.actions[0].js[0] === "js/shortcuts.js") {
                //console.log("URLI.Background.startupListener() - internal shortcuts enabled, found shortcuts.js rule!");
                shortcutsjsRule = true;
                break;
              }
            }
            if (!shortcutsjsRule) {
              //console.log("URLI.Background.startupListener() - oh no, something went wrong. internal shortcuts enabled, but shortcuts.js rule not found!");
              chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
                chrome.declarativeContent.onPageChanged.addRules([{
                  conditions: [new chrome.declarativeContent.PageStateMatcher()],
                  actions: [new chrome.declarativeContent.RequestContentScript({js: ["js/shortcuts.js"]})]
                }], function(rules) {
                  //console.log("URLI.Background.startupListener() - successfully added declarativeContent rules:" + rules);
                });
              });
            }
          });
        }
      }
    });
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
    installedListener: installedListener,
    messageListener: messageListener,
    messageExternalListener: messageExternalListener,
    commandListener: commandListener,
    tabRemovedListener: tabRemovedListener,
    tabUpdatedListener: tabUpdatedListener,
    startupListener: startupListener
  };
}();

// Background Listeners
chrome.runtime.onInstalled.addListener(URLI.Background.installedListener);
chrome.runtime.onMessage.addListener(URLI.Background.messageListener);
chrome.runtime.onMessageExternal.addListener(URLI.Background.messageExternalListener);
chrome.commands.onCommand.addListener(URLI.Background.commandListener);
chrome.tabs.onRemoved.addListener(URLI.Background.tabRemovedListener);
URLI.Background.startupListener();