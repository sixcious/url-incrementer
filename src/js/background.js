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
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyFIncrement": [0, "ArrowRight"], "keyFDecrement": [0, "ArrowLeft"], "keyIncrement": [6, "ArrowUp"], "keyDecrement": [6, "ArrowDown"], "keyNext": [6, "ArrowRight"], "keyPrev": [6, "ArrowLeft"], "keyClear": [6, "KeyX"], "keyAuto": [6, "KeyA"],
    /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseFIncrement": -1, "mouseFDecrement": -1, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1, "mouseAuto": -1,
    /* inc dec */     "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "shuffleLimit": 1000, "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    /* error skip */  "errorSkip": 0, "errorCodes": ["404", "", "", ""], "errorCodesCustomEnabled": false, "errorCodesCustom": [],
    /* next prev */   "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    /* keywords */    "nextPrevNextKeywords": ["next", "forward", "次", "&gt;", ">", "newer", "new"], "nexPrevPrevKeywords": ["prev", "previous", "前", "&lt;", "<", "‹", "back", "older", "old"], "nextPrevStartsWithExcludes": ["&gt;", ">", "new", "&lt;", "<", "‹", "back", "old"],
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times", "autoRepeat": false,
    /* download */    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null, "downloadPreview": ["thumb", "extension", "tag", "compressed"],
    /* toolkit */     "toolkitTool": "open-tabs", "toolkitAction": "increment", "toolkitQuantity": 1,
    /* fun */         "urli": "loves incrementing for you"
  },

  // The local storage default values
  LOCAL_STORAGE_DEFAULT_VALUES = {
    /* profiles */    "profilePreselect": true, "profileQuick": true, "profiles": []
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "increment":  { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement":  { "text": "-",    "backgroundColor": "#1779BA" },
    "increment2": { "text": "+",    "backgroundColor": "#004687" },
    "decrement2": { "text": "-",    "backgroundColor": "#004687" },
    "increment3": { "text": "+",    "backgroundColor": "#001354" },
    "decrement3": { "text": "-",    "backgroundColor": "#001354" },
    "next":       { "text": ">",    "backgroundColor": "#05854D" },
    "prev":       { "text": "<",    "backgroundColor": "#05854D" },
    "clear":      { "text": "X",    "backgroundColor": "#FF0000" },
    "return":     { "text": "BACK", "backgroundColor": "#FFCC22" },
    "auto":       { "text": "AUTO", "backgroundColor": "#FF6600" },
    "autotimes":  { "text": "",     "backgroundColor": "#FF6600" },
    "autopause":  { "text": "❚❚",    "backgroundColor": "#FF6600" },
    "autorepeat": { "text": "REP",  "backgroundColor": "#FF6600" },
    "download":   { "text": "DL",   "backgroundColor": "#663399" },
    "skip":       { "text": "",     "backgroundColor": "#000028" },
    "toolkit":    { "text": "TOOL", "backgroundColor": "#000028" },
    "default":    { "text": "",     "backgroundColor": [0,0,0,0] }
  },

  // The individual tab instances in Background memory
  // Note: We never save instances in storage due to URLs being a privacy concern
  instances = new Map();

  // The sync storage and local storage items caches and a boolean flag indicating if the content scripts listener has been added (to prevent adding multiple listeners)
  let items_ = {},
      localItems_ = {},
      contentScriptListenerAdded = false,
      webRequestOnHeadersReceivedListenerAdded = false;

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
    // Firefox: Set a deep-copy of the instance via serialization to avoid the Firefox "can't access dead object" error
    instances.set(tabId, JSON.parse(JSON.stringify(instance)));
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
          props = profile; // selectionStart, interval, base, baseCase, leadingZeros, errorSkip, errorCodes, errorCodesCustomEnabled, errorCodesCustom
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
      props.errorSkip = items_.errorSkip;
      props.errorCodes = items_.errorCodes;
      props.errorCodesCustomEnabled = items_.errorCodesCustomEnabled;
      props.errorCodesCustom = items_.errorCodesCustom;
    }
    // Return newly built instance using props and items:
    return {
      "enabled": props.profileFound, "autoEnabled": false, "downloadEnabled": false, "autoPaused": false,
      "tabId": tab.id, "url": tab.url, "startingURL": tab.url,
      "profileFound": props.profileFound,
      "selection": props.selection, "selectionStart": props.selectionStart, "startingSelection": props.selection, "startingSelectionStart": props.selectionStart,
      "leadingZeros": props.leadingZeros,
      "interval": props.interval,
      "base": props.base, "baseCase": props.baseCase,
      "errorSkip": props.errorSkip, "errorCodes": props.errorCodes, "errorCodesCustomEnabled": props.errorCodesCustomEnabled, "errorCodesCustom": props.errorCodesCustom,
      "multi": 0,
      "urls": [], "customURLs": false, "shuffleURLs": false, "shuffleLimit": items_.shuffleLimit,
      "nextPrevLinksPriority": items_.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items_.nextPrevSameDomainPolicy,
      "autoAction": items_.autoAction, "autoTimesOriginal": items_.autoTimes, "autoTimes": items_.autoTimes, "autoSeconds": items_.autoSeconds, "autoWait": items_.autoWait, "autoBadge": items_.autoBadge, "autoRepeat": items_.autoRepeat, "autoRepeatCount": 0,
      "downloadStrategy": items_.downloadStrategy, "downloadExtensions": items_.downloadExtensions, "downloadTags": items_.downloadTags, "downloadAttributes": items_.downloadAttributes, "downloadSelector": items_.downloadSelector,
      "downloadIncludes": items_.downloadIncludes, "downloadExcludes": items_.downloadExcludes,
      "downloadMinMB": items_.downloadMinMB, "downloadMaxMB": items_.downloadMaxMB,
      "downloadPreview": items_.downloadPreview,
      "toolkitTool": items_.toolkitTool, "toolkitAction": items_.toolkitAction, "toolkitQuantity": items_.toolkitQuantity
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
    // Update Installations Old Versions (5.2 and Below): Reset storage and remove all permissions for a clean slate
    else if (details.reason === "update" && details.previousVersion <= "5.2") {
      console.log("URLI.Background.installedListener() - details.reason === update, previousVersion <= 5.2, actual previousVersion=" + details.previousVersion);
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          chrome.storage.local.clear(function() {
            chrome.storage.local.set(LOCAL_STORAGE_DEFAULT_VALUES, function() {
              items_ = STORAGE_DEFAULT_VALUES;
              localItems_ = LOCAL_STORAGE_DEFAULT_VALUES;
            });
          });
        });
      });
      if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined);
      }
      chrome.permissions.remove({ permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]});
    }
    // 5.3 only: Storage updates for new features: Toolkit and Profiles
    else if (details.reason === "update" && details.previousVersion === "5.3") {
      console.log("URLI.Background.installedListener() - details.reason === update, details.previousVersion === 5.3, actual previousVersion=" + details.previousVersion);
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
    console.log("URLI.Background.messageListener() - request.greeting=" + request.greeting + ", sender.tab.id=" + sender.tab.id + ", sender.tab.url=" + sender.tab.url + ", sender.url=" + sender.url);
    switch (request.greeting) {
      case "getInstance":
        sendResponse({instance: getInstance(sender.tab.id), items: getItems()});
        break;
      case "performAction":
        let instance = getInstance(sender.tab.id);
        if (!instance && request.action !== "auto") {
          sender.tab.url = sender.url; // Firefox: sender.tab.url is undefined in FF due to not having tabs permissions (even though we have <all_urls>!), so use sender.url, which should be identical in 99% of cases (e.g. iframes may be different)
          instance = await buildInstance(sender.tab);
        }
        if (instance) {
          URLI.Action.performAction(instance, request.action, "content-script");
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
    if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "auto" || command === "return" || command === "clear")  {
      if (!items_.permissionsInternalShortcuts) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, async function(tabs) {
          if (tabs && tabs[0]) { // for example, tab may not exist if command is called while in popup window
            let instance = getInstance(tabs[0].id);
            if ((command === "increment" || command === "decrement" || command === "next" || command === "prev") || //&& (items_.quickEnabled || (instance && instance.enabled)) ||
                (command === "auto" && instance && instance.autoEnabled) ||
                ((command === "clear" || command === "return") && instance && (instance.enabled || instance.autoEnabled || instance.downloadEnabled))) {
              if (!instance) { //&& items_.quickEnabled) {
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
   * @public
   */
  function storageChangedListener(changes, areaName) {
    switch (areaName) {
      case "sync":
        for (const key in changes) {
          console.log("URLI.Background.storageChangedListener() - change in storage." + areaName + "." + key + ", oldValue=" + changes[key].oldValue + ", newValue=" + changes[key].newValue);
          if (changes[key].newValue !== undefined) { // Avoids potential bug with clear > set (e.g. reset, new install)
            items_[key] = changes[key].newValue;
            // We must handle the contentScriptListener depending on the storage change for permissionsInternalShortcuts
            if (key === "permissionsInternalShortcuts") {
              if (changes[key].newValue === true && !contentScriptListenerAdded) {
                chrome.tabs.onUpdated.addListener(contentScriptListener);
                contentScriptListenerAdded = true;
              } else if (changes[key].newValue === false) {
                chrome.tabs.onUpdated.removeListener(contentScriptListener);
                contentScriptListenerAdded = false;
              }
            }
          }
        }
        break;
      case "local":
        for (const key in changes) {
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
   * @public
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
      if (items && items.permissionsInternalShortcuts && !contentScriptListenerAdded) {
        chrome.tabs.onUpdated.addListener(contentScriptListener);
        contentScriptListenerAdded = true;
      }
    });
    chrome.storage.local.get(null, function(localItems) {
      localItems_ = localItems;
    });
  }

  /**
   * The chrome.tabs.onUpdated content script listener that is added if a content script is enabled (e.g. internal shortcuts).
   * Note: This is required for Firefox only because it does not support the chrome.declarativeContent API.
   * When FF gets declarativeContent, consider removing this and switching to dC.
   *
   * @param tabId      the tab ID
   * @param changeInfo the status (either complete or loading)
   * @param tab        the tab object
   * @private
   */
  function contentScriptListener(tabId, changeInfo, tab) {
    console.log("URLI.Background.contentScriptListener() - the chrome.tabs.onUpdated content script listener is on! changeInfo.status=" + changeInfo.status);
    if (changeInfo.status === "loading") {
      if (items_.permissionsInternalShortcuts) {
        chrome.tabs.executeScript(tabId, {file: "/js/shortcuts.js", runAt: "document_start"}, function(result) {
          if (chrome.runtime.lastError) {
            console.log("URLI.Background.contentScriptListener() - shortcuts.js chrome.runtime.lastError=" + chrome.runtime.lastError)
          }
        });
      }
    }
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