/**
 * URL Incrementer Background
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Background = function () {

  // The sync storage default values
  // Note: Storage.set can only set top-level JSON objects, do not use nested JSON objects (instead, prefix keys that should be grouped together)
  const STORAGE_DEFAULT_VALUES = {
    /* permissions */ "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
    /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
    /* popup */       "popupButtonSize": 32, "popupAnimationsEnabled": true, "popupOpenSetup": true, "popupSettingsCanOverwrite": true,
    /* shortcuts */   "quickEnabled": true,
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [6, "ArrowUp"], "keyDecrement": [6, "ArrowDown"], "keyNext": [6, "ArrowRight"], "keyPrev": [6, "ArrowLeft"], "keyClear": [6, "KeyX"], "keyAuto": [6, "KeyA"],
    /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1, "mouseAuto": -1,
    /* incdec */      "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "randomizeThreshold": 1000,  "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    /* error skip */  "errorSkip": 0, "errorCodes": ["404", "", "", ""], "errorCodesCustomEnabled": false, "errorCodesCustom": [],
    /* nextprev */    "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    /* toolkit */     "toolkitTool": "open-tabs", "toolkitAction": "increment", "toolkitQuantity": 1,
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times", "autoRepeat": false,
    /* download */    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null, "downloadPreview": ["thumb", "extension", "tag", "compressed"],
    /* fun */         "urli": "loves incrementing for you"
  },

  // The local storage default values
  LOCAL_STORAGE_DEFAULT_VALUES = {
    /* profiles */    "profilePreselect": false, "profiles": []
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "increment":  { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement":  { "text": "-",    "backgroundColor": "#1779BA" },
    "next":       { "text": ">",    "backgroundColor": "#05854D" },
    "prev":       { "text": "<",    "backgroundColor": "#05854D" },
    "clear":      { "text": "X",    "backgroundColor": "#FF0000" },
    "auto":       { "text": "AUTO", "backgroundColor": "#FF6600" },
    "autotimes":  { "text": "",     "backgroundColor": "#FF6600" },
    "autopause":  { "text": "❚❚",    "backgroundColor": "#FF6600" },
    "autorepeat": { "text": "REP",  "backgroundColor": "#FF6600" },
    "download":   { "text": "DL",   "backgroundColor": "#663399" },
    "skip":       { "text": "",     "backgroundColor": "#000028" }, //"#FFCC22" },
    "toolkit":    { "text": "TOOL", "backgroundColor": "#000028" },
    "default":    { "text": "",     "backgroundColor": [0,0,0,0] }
  },

  // The individual tab instances in Background memory
  // Note: We never save instances in storage due to URLs being a privacy concern
  instances = new Map();

  // The sync storage and local storage items caches
  let items_ = {},
      localItems_ = {};

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
   * Gets the local storage default values (LSDV).
   *
   * @return the storage default values (LSDV)
   * @public
   */
  function getLSDV() {
    return LOCAL_STORAGE_DEFAULT_VALUES;
  }

  /**
   * Gets the sync storage items.
   *
   * @returns {{}} the sync storage items
   */
  function getItems() {
    return items_;
  }

  /**
   * Gets the local storage items.
   *
   * @returns {{}} the local storage items
   */
  function getLocalItems() {
    return localItems_;
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
   * Builds an instance with default values: either an existing saved profile or by using the storage items defaults.
   * 
   * @param tab the tab properties (id, url) to set this instance with
   * @return instance the newly built instance
   * @public
   */
  async function buildInstance(tab) {
    let props;
    // Search for profile first:
    if (localItems_ && localItems_.profiles && localItems_.profiles.length > 0 ) {
      // How to handle async/await in for loops:
      // https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
      for (let profile of localItems_.profiles) {
        const result = await profileMatchesURL(profile, tab.url);
        if (result.matches) {
          console.log("URLI.Background.buildInstance() - found a profile for this tab's url, profile.urlhash1=" + profile.urlhash1);
          props = profile; // selectionStart, interval, base, baseCase, leadingZeros
          props.profileFound = true;
          props.selection = result.selection;
          break;
        }
      }
    }
    // If no profile found, use storage items:
    if (!props) {
      props = URLI.IncrementDecrement.findSelection(tab.url, items_.selectionPriority, items_.selectionCustom); // selection, selectionStart
      props.profileFound = false;
      props.interval = items_.interval;
      props.base = items_.base;
      props.baseCase = items_.baseCase;
      props.leadingZeros = items_.leadingZerosPadByDetection && props.selection.charAt(0) === '0' && props.selection.length > 1;
    }
    // Return newly built instance using props and items:
    return {
      "enabled": false, "autoEnabled": false, "downloadEnabled": false, "autoPaused": false,
      "tabId": tab.id, "url": tab.url, "startingURL": tab.url,
      "profileFound": props.profileFound,
      "selection": props.selection, "selectionStart": props.selectionStart, "startingSelection": props.selection, "startingSelectionStart": props.selectionStart,
      "leadingZeros": props.leadingZeros,
      "interval": props.interval,
      "base": props.base, "baseCase": props.baseCase,
      "randomizeSequence": false, "randomizeThreshold": items_.randomizeThreshold,
      "errorSkip": items_.errorSkip, "errorCodes": items_.errorCodes, "errorCodesCustomEnabled": items_.errorCodesCustomEnabled, "errorCodesCustom": items_.errorCodesCustom,
      "nextPrevLinksPriority": items_.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items_.nextPrevSameDomainPolicy,
      "toolkitTool": items_.toolkitTool, "toolkitAction": items_.toolkitAction, "toolkitQuantity": items_.toolkitQuantity,
      "autoAction": items_.autoAction, "autoTimesOriginal": items_.autoTimes, "autoTimes": items_.autoTimes, "autoSeconds": items_.autoSeconds, "autoWait": items_.autoWait, "autoBadge": items_.autoBadge, "autoRepeat": items_.autoRepeat, "autoRepeatCount": 0,
      "downloadStrategy": items_.downloadStrategy, "downloadExtensions": items_.downloadExtensions, "downloadTags": items_.downloadTags, "downloadAttributes": items_.downloadAttributes, "downloadSelector": items_.downloadSelector,
      "downloadIncludes": items_.downloadIncludes, "downloadExcludes": items_.downloadExcludes,
      "downloadMinMB": items_.downloadMinMB, "downloadMaxMB": items_.downloadMaxMB,
      "downloadPreview": items_.downloadPreview
    };
  }

  /**
   * Checks if the saved profile's hashed URL matches the URL.
   *
   * @param profile the saved profile with url hashes to check
   * @param url     the current URL to check
   * @returns {Promise<{matches: boolean, selection: string}>}
   * @public
   */
  async function profileMatchesURL(profile, url) {
    console.log("URLI.Background.checkProfile() - profile of current url is url=" + url);
    const url1 = url.substring(0, profile.selectionStart),
      url2 = url.slice(-profile.url2length);
    const urlhash1 = await URLI.Encryption.calculateHash(url1, profile.urlsalt1);
    const urlhash2 = await URLI.Encryption.calculateHash(url2, profile.urlsalt2);
    const selection = url.substring(profile.selectionStart, profile.url2length > 0 ? url.lastIndexOf(url2) : url.length);
    const selectionParsed = parseInt(selection, profile.base).toString(profile.base);
    // Test for alphanumeric in the case where url2length is 0 but current url has a part 2
    // Test base matches selection for same reason
    return {
      "matches":
      urlhash1 === profile.urlhash1 &&
      (profile.url2length > 0 ? urlhash2 === profile.urlhash2 : true) &&
      /^[a-z0-9]+$/i.test(selection) &&
      !(isNaN(parseInt(selection, profile.base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionParsed.length) + selectionParsed.toUpperCase())),
      "selection": selection
    };
  }

  /**
   * Sets the browser action badge for this tabId. Can either be temporary or for an indefinite time. Note that when the tab is updated, the browser removes the badge.
   *
   * @param tabId           the tab ID to set this badge for
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
      console.log("URLI.Background.installedListener() - details.reason === install");
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          chrome.storage.local.clear(function() {
            chrome.storage.local.set(LOCAL_STORAGE_DEFAULT_VALUES, function() {
              items_ = STORAGE_DEFAULT_VALUES;
              localItems_ = LOCAL_STORAGE_DEFAULT_VALUES;
              chrome.runtime.openOptionsPage();
            });
          });
        });
      });
    }
    // Update Installations Version 5.1: Remove declarativeContent if internal shortcuts not enabled (this was erroneously set for download and enhanced mode):
    else if (details.reason === "update" && details.previousVersion === "5.1") {
      console.log("URLI.Background.installedListener() - details.reason === update, details.previousVersion === 5.1, actual previousVersion=" + details.previousVersion);
      chrome.storage.sync.get(null, function(olditems) {
        if (olditems && !olditems.permissionsInternalShortcuts) {
          chrome.permissions.remove({ permissions: ["declarativeContent"]});
        }
      });
    }
    // Update Installations Version 5.0 and Below: Reset storage and re-save old increment values and remove all permissions for a clean slate
    else if (details.reason === "update" && details.previousVersion <= "5.0") {
      console.log("URLI.Background.installedListener() - details.reason === update, previousVersion <= 5.0, actual previousVersion=" + details.previousVersion);
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
            }, function() {
              chrome.storage.sync.get(null, function(items) {
                items_ = items;
                chrome.storage.local.clear(function() {
                  chrome.storage.local.set(LOCAL_STORAGE_DEFAULT_VALUES, function() {
                    localItems_ = LOCAL_STORAGE_DEFAULT_VALUES;
                  });
                });
              });
            });
          });
        });
      });
      if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined);
      }
      chrome.permissions.remove({ permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]});
    }
    // Update Installations Version 5.1 and 5.2 only: storage sync new storage additions/updates
    if (details.reason === "update" && details.previousVersion === "5.1" || details.previousVersion === "5.2") {
      chrome.storage.sync.set({
        "errorCodesCustomEnabled": false,
        "errorCodesCustom": [],
        "urli": "loves incrementing for you"
      });
    }
    // Update Installations Version 5.1, 5.2, and 5.3 only: Storage updates for new features: Toolkit and Profiles
    if (details.reason === "update" && details.previousVersion >= "5.1" && details.previousVersion <= "5.3") {
      console.log("URLI.Background.installedListener() - details.reason === update, details.previousVersion >= 5.1 && <= 5.3, actual previousVersion=" + details.previousVersion);
      chrome.storage.sync.set({
        "toolkitTool": "open-tabs",
        "toolkitAction": "increment",
        "toolkitQuantity": 1
      });
      chrome.storage.local.set({
        "profilePreselect": false,
        "profiles": []
      });
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
  async function messageListener(request, sender, sendResponse) {
    console.log("URLI.Background.messageListener() - request.greeting=" + request.greeting + " sender.tab.id=" + sender.tab.id);
    switch (request.greeting) {
      case "getInstance":
        sendResponse({instance: getInstance(sender.tab.id), items: getItems()});
        break;
      case "performAction":
        let instance = getInstance(sender.tab.id);
        if (!instance && request.action !== "auto") {
          instance = await buildInstance(sender.tab);
        }
        if (instance) {
          URLI.Action.performAction(instance, request.action, "shortcuts.js");
        }
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
  async function messageExternalListener(request, sender, sendResponse) {
    console.log("URLI.Background.messageExternalListener() - request.action=" + request.action + " sender.id=" + sender.id);
    const URL_INCREMENT_BUTTON_EXTENSION_ID = "decebmdlceenceecblpfjanoocfcmjai",
          URL_DECREMENT_BUTTON_EXTENSION_ID = "nnmjbfglinmjnieblelacmlobabcenfk";
    if (sender && (sender.id === URL_INCREMENT_BUTTON_EXTENSION_ID || sender.id === URL_DECREMENT_BUTTON_EXTENSION_ID)) {
      switch (request.greeting) {
        case "performAction":
          let instance = getInstance(request.tab.id);
          if (!instance && request.action !== "auto") {
            instance = await buildInstance(request.tab);
          }
          if (instance && (request.action === "increment" || request.action === "decrement")) {
            URLI.Action.performAction(instance, request.action, "externalExtension");
          }
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
      if (!items_.permissionsInternalShortcuts) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, async function(tabs) {
          if (tabs && tabs[0]) { // for example, tab may not exist if command is called while in popup window
            let instance = getInstance(tabs[0].id);
            if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") && (items_.quickEnabled || (instance && instance.enabled)) ||
                (command === "auto" && instance && instance.autoEnabled) ||
                (command === "clear" && instance && (instance.enabled || instance.autoEnabled || instance.downloadEnabled))) {
              if (!instance && items_.quickEnabled) {
                instance = await buildInstance(tabs[0]);
              }
              URLI.Action.performAction(instance, command, "command");
            }
          }
        });
      }
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
    console.log("URLI.Background.tabUpdatedListener() - the chrome.tabs.onUpdated download preview listener is on!");
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
   * The storage changed listener that listens for changes in both sync and local storage
   * and then updates the Background's items and localItems storage caches.
   *
   * @param changes  Object mapping each key that changed to its corresponding storage.StorageChange for that item
   * @param areaName the name of the storage area("sync", "local" or "managed") the changes are for
   */
  function storageChangedListener(changes, areaName) {
    switch (areaName) {
      case "sync":
        for (let key in changes) {
          console.log("URLI.Background.storageChangedListener() - change in storage." + areaName + "." + key + ", oldValue=" + changes[key].oldValue + ", newValue=" + changes[key].newValue);
          if (changes[key].newValue !== undefined) { // Avoids potential bug with clear > set (e.g. reset, new install)
            items_[key] = changes[key].newValue;
          }
        }
        break;
      case "local":
        for (let key in changes) {
          console.log("URLI.Background.storageChangedListener() - change in storage." + areaName + "." + key + ", oldValue=" + changes[key].oldValue + ", newValue=" + changes[key].newValue);
          if (changes[key].newValue !== undefined) { // Avoids potential bug with clear > set (e.g. reset, new install)
            localItems_[key] = changes[key].newValue;
          }
        }
        break;
      default:
        break;
    }
  }

  /**
   * The extension's background startup listener that is run the first time the extension starts.
   * For example, when Chrome is started, when the extension is installed or updated, or when the
   * extension is re-enabled after being disabled.
   *
   * 1) Caches the sync storage and local storage items into items_ and localItems_
   * 2) Ensures the toolbar icon and declarativeContent rules are set (due to Chrome sometimes not re-setting them)
   */
  function startupListener() {
    console.log("URLI.Background.startupListener()");
    chrome.storage.sync.get(null, function(items) {
      items_ = items;
      // Ensure the chosen toolbar icon is set
      if (items && ["dark", "light", "rainbow", "urli"].includes(items.iconColor)) {
        console.log("URLI.Background.startupListener() - setting chrome.browserAction.setIcon() to " + items.iconColor);
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
                console.log("URLI.Background.startupListener() - internal shortcuts enabled, found shortcuts.js rule!");
                shortcutsjsRule = true;
                break;
              }
            }
            if (!shortcutsjsRule) {
              console.log("URLI.Background.startupListener() - oh no, something went wrong. internal shortcuts enabled, but shortcuts.js rule not found!");
              chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
                chrome.declarativeContent.onPageChanged.addRules([{
                  conditions: [new chrome.declarativeContent.PageStateMatcher()],
                  actions: [new chrome.declarativeContent.RequestContentScript({js: ["js/shortcuts.js"]})]
                }], function(rules) {
                  console.log("URLI.Background.startupListener() - successfully added declarativeContent rules:" + rules);
                });
              });
            }
          });
        }
      }
    });
    chrome.storage.local.get(null, function(localItems) {
      localItems_ = localItems;
    });
  }

  // Return Public Functions
  return {
    getSDV: getSDV,
    getLSDV: getLSDV,
    getItems: getItems,
    getLocalItems: getLocalItems,
    getInstances: getInstances,
    getInstance: getInstance,
    setInstance: setInstance,
    deleteInstance: deleteInstance,
    buildInstance: buildInstance,
    profileMatchesURL: profileMatchesURL,
    setBadge: setBadge,
    installedListener: installedListener,
    messageListener: messageListener,
    messageExternalListener: messageExternalListener,
    commandListener: commandListener,
    tabRemovedListener: tabRemovedListener,
    tabUpdatedListener: tabUpdatedListener,
    storageChangedListener: storageChangedListener,
    startupListener: startupListener
  };
}();

// Background Listeners
chrome.runtime.onInstalled.addListener(URLI.Background.installedListener);
chrome.runtime.onMessage.addListener(URLI.Background.messageListener);
chrome.runtime.onMessageExternal.addListener(URLI.Background.messageExternalListener);
chrome.commands.onCommand.addListener(URLI.Background.commandListener);
chrome.tabs.onRemoved.addListener(URLI.Background.tabRemovedListener);
chrome.storage.onChanged.addListener(URLI.Background.storageChangedListener);
URLI.Background.startupListener();