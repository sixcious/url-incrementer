/**
 * URL Incrementer
 * @file background.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var URLI = URLI || {};

URLI.Background = function () {

  // The sync storage default values. Note: Storage.set can only set top-level JSON objects, avoid using nested JSON objects (instead, prefix keys that should be grouped together with a label e.g. "auto")
  const STORAGE_DEFAULT_VALUES = {
    "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
    "iconColor": "dark", "iconFeedbackEnabled": false,
    "popupButtonSize": 32, "popupAnimationsEnabled": true,
    "actions": [{"increment": "Increment"}, {"decrement": "Decrement"}, {"next": "Next"}, {"prev": "Prev"}, {"clear": "Clear"}, {"return": "Return"}, {"auto": "Auto"}],
    "commandsQuickEnabled": true,
    "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": {"modifiers": 6, "code": "ArrowUp"}, "keyDecrement": {"modifiers": 6, "code": "ArrowDown"}, "keyNext": {"modifiers": 6, "code": "ArrowRight"}, "keyPrev": {"modifiers": 6, "code": "ArrowLeft"}, "keyClear": {"modifiers": 6, "code": "KeyX"}, "keyReturn": {"modifiers": 6, "code": "KeyB"}, "keyAuto": {"modifiers": 6, "code": "KeyA"},
    "mouseEnabled": true, "mouseQuickEnabled": true, "mouseClickSpeed": 400, "mouseIncrement": {"button": 3, "clicks": 2}, "mouseDecrement": {"button": 3, "clicks": 3}, "mouseNext": null, "mousePrev": null, "mouseClear": null, "mouseReturn": null, "mouseAuto": null,
    "interval": 1, "shuffleLimit": 1000, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "baseDateFormat": "", "baseCustom": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", "selectionPriority": "prefixes", "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    "errorSkip": 0, "errorCodes": ["404", "", "", ""], "errorCodesCustomEnabled": false, "errorCodesCustom": [],
    "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    "nextPrevKeywordsNext": ["pnnext", "next page", "next", "forward", "次", "&gt;", ">", "newer"], "nextPrevKeywordsPrev": ["pnprev", "previous page", "prev", "previous", "前", "&lt;", "<", "‹", "back", "older"],
    "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "auto",
    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null, "downloadPreview": ["thumb", "extension", "tag", "url", "compressed"],
    "toolkitTool": "crawl", "toolkitAction": "increment", "toolkitQuantity": 10, "toolkitSeconds": 1
  },

  // The local storage default values
  LOCAL_STORAGE_DEFAULT_VALUES = {
    "saves": [], "savePreselect": false
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "increment":  { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement":  { "text": "-",    "backgroundColor": "#1779BA" },
    "increment1": { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement1": { "text": "-",    "backgroundColor": "#1779BA" },
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
    "toolkit":    { "text": "TOOL", "backgroundColor": "#000028" },
    "skip":       { "text": "SKIP", "backgroundColor": "#000000" },
    "default":    { "text": "",     "backgroundColor": [0,0,0,0] }
  },

  // The individual tab instances in Background memory. Note: We never save instances in storage due to URLs being a privacy concern
  instances = new Map();

  // A boolean flag to dynamically make the background temporarily persistent (when an instance is enabled)
  let persistent = false;

  /**
   * Gets the storage default values (SDV).
   *
   * @returns {{}} the storage default values (SDV)
   * @public
   */
  function getSDV() {
    return STORAGE_DEFAULT_VALUES;
  }

  /**
   * Gets the local storage default values (LSDV).
   *
   * @returns {{}} the local storage default values (LSDV)
   * @public
   */
  function getLSDV() {
    return LOCAL_STORAGE_DEFAULT_VALUES;
  }

  /**
   * Gets all the instances.
   *
   * @returns {Map<tabId, instance>} the tab instances
   * @public
   */
  function getInstances() {
    return instances;
  }

  /**
   * Gets the instance.
   * 
   * @param tabId the tab id to lookup this instance by
   * @returns instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    return instances.get(tabId);
  }

  /**
   * Sets the instance. (Note: This is the only time we need to make the background persistent.)
   * 
   * @param tabId    the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    instances.set(tabId, JSON.parse(JSON.stringify(instance))); // Firefox: Set a deep-copy of the instance via serialization to avoid the Firefox "can't access dead object" error
    if (!persistent) {
      makePersistent();
    }
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
   * Builds an instance with default values (from either an existing save or by using the storage items).
   * 
   * @param tab        the tab properties (id, url) to set this instance with
   * @param items      the sync storage items
   * @param localItems the local storage items
   * @returns instance the newly built instance
   * @public
   */
  async function buildInstance(tab, items, localItems) {
    items = items ? items : await EXT.Promisify.getItems();
    localItems = localItems ? localItems : await EXT.Promisify.getItems("local");
    const saves = localItems.saves;
    let via = "items",
        object = items,
        selection = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom);
    // First search for a save to build an instance from:
    if (saves && saves.length > 0) {
      for (const save of saves) {
        const result = await URLI.SaveURLs.matchesURL(save, tab.url);
        if (result.matches) {
          console.log("URLI.Background.buildInstance() - found a " + save.type + " save for this tab's url");
          via = save.type;
          object = save;
          selection = save.type === "url" ? result.selection : URLI.IncrementDecrement.findSelection(tab.url, save.selectionPriority, save.selectionCustom);
          break;
        }
      }
    }
    // Return the newly built instance using tab, via, selection, object, and items:
    return {
      "enabled": false, "incrementDecrementEnabled": false, "autoEnabled": false, "downloadEnabled": false, "toolkitEnabled": false, "multiEnabled": false,
      "tabId": tab.id, "url": tab.url, "startingURL": tab.url,
      "saveFound": via === "url" || via === "wildcard", "saveType": via === "items" ? "none" : via,
      "selection": selection.selection, "selectionStart": selection.selectionStart,
      "startingSelection": selection.selection, "startingSelectionStart": selection.selectionStart,
      "leadingZeros": via === "url" ? object.leadingZeros : object.leadingZerosPadByDetection && selection.selection.charAt(0) === '0' && selection.selection.length > 1,
      "interval": object.interval,
      "base": object.base, "baseCase": object.baseCase, "baseDateFormat": object.baseDateFormat, "baseCustom": object.baseCustom,
      "errorSkip": object.errorSkip, "errorCodes": object.errorCodes, "errorCodesCustomEnabled": object.errorCodesCustomEnabled, "errorCodesCustom": object.errorCodesCustom,
      "multi": {"1": {}, "2": {}, "3": {}}, "multiCount": 0,
      "urls": [], "customURLs": false, "shuffleURLs": false, "shuffleLimit": items.shuffleLimit,
      "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
      "autoAction": items.autoAction, "autoTimesOriginal": items.autoTimes, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait, "autoBadge": items.autoBadge, "autoRepeat": false, "autoRepeatCount": 0, "autoPaused": false,
      "downloadStrategy": items.downloadStrategy, "downloadExtensions": items.downloadExtensions, "downloadTags": items.downloadTags, "downloadAttributes": items.downloadAttributes, "downloadSelector": items.downloadSelector,
      "downloadIncludes": items.downloadIncludes, "downloadExcludes": items.downloadExcludes,
      "downloadMinMB": items.downloadMinMB, "downloadMaxMB": items.downloadMaxMB,
      "downloadPreview": items.downloadPreview,
      "toolkitTool": items.toolkitTool, "toolkitAction": items.toolkitAction, "toolkitQuantity": items.toolkitQuantity, "toolkitSeconds": items.toolkitSeconds
    };
  }

  /**
   * Sets the browser action badge for this tabId. Can either be temporary or for an indefinite time.
   * Note that when the tab is updated, the browser removes the badge.
   *
   * @param tabId           the tab ID to set this badge for
   * @param badge           the badge key to set from BROWSER_ACTION_BADGES
   * @param temporary       boolean indicating whether the badge should be displayed temporarily (true) or not (false)
   * @param text            (optional) the text to use instead of the the badge text
   * @param backgroundColor (optional) the backgroundColor to use instead of the badge backgroundColor
   * @public
   */
  function setBadge(tabId, badge, temporary, text, backgroundColor) {
    // Firefox Android: chrome.browserAction.setBadge* not supported
    if (!chrome.browserAction.setBadgeText || !chrome.browserAction.setBadgeBackgroundColor) {
      return;
    }
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
  async function installedListener(details) {
    // New Installations: Setup storage and open Options Page in a new tab
    // Update Installations Old Versions (5.2 and Below): Reset storage and remove all permissions for a clean slate
    // 5.3 - 5.8 only: Storage and Permission changes for 6.0
    if (details.reason === "install" || (details.reason === "update" && details.previousVersion < "6.0")) {
      console.log("URLI.Background.installedListener() - details.reason=" + details.reason);
      const items = details.previousVersion && details.previousVersion >= "5.3" ? await EXT.Promisify.getItems() : undefined;
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          chrome.storage.local.clear(function() {
            chrome.storage.local.set(LOCAL_STORAGE_DEFAULT_VALUES, function() {
              if (details.reason === "install") {
                chrome.runtime.openOptionsPage();
              } else if (details.previousVersion <= "5.2") {
                URLI.Permissions.removeAllPermissions();
              } else if (details.previousVersion >= "5.3") {
                // TODO items
              }
            });
          });
        });
      });
    }
  }

  /**
   * The extension's background startup listener that is run the first time the extension starts.
   * For example, when Chrome is started, when the extension is installed or updated, or when the
   * extension is re-enabled after being disabled.
   *
   * @public
   */
  async function startupListener() {
    console.log("URLI.Background.startupListener()");
    const items = await EXT.Promisify.getItems();
    // Ensure the chosen toolbar icon is set. Firefox Android: chrome.browserAction.setIcon() not supported
    if (chrome.browserAction.setIcon && items && ["dark", "light", "rainbow", "urli"].includes(items.iconColor)) {
      console.log("URLI.Background.startupListener() - setting browserAction icon to " + items.iconColor);
      chrome.browserAction.setIcon({
        path : {
          "16": "/img/16-" + items.iconColor + ".png",
          "24": "/img/24-" + items.iconColor + ".png",
          "32": "/img/32-" + items.iconColor + ".png"
        }
      });
    }
    // Ensure Internal Shortcuts declarativeContent rule is added (it sometimes gets lost when the extension is updated re-enabled)
    if (items && items.permissionsInternalShortcuts) {
      URLI.Permissions.checkDeclarativeContent();
    }
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (e.g. Content Scripts). Note: sender contains tab
   * 
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tab
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @public
   */
  async function messageListener(request, sender, sendResponse) {
    console.log("URLI.Background.messageListener() - request.greeting=" + request.greeting);
    sender.tab.url = sender.url; // Firefox: sender.tab.url is undefined in FF due to not having tabs permissions (even though we have <all_urls>!), so use sender.url, which should be identical in 99% of cases (e.g. iframes may be different)
    if (request && request.greeting === "performAction") {
      const items = await EXT.Promisify.getItems();
      const instance = getInstance(sender.tab.id) || await buildInstance(sender.tab, items);
      if ((request.shortcut === "key" && items.keyEnabled && (items.keyQuickEnabled || (instance && (instance.enabled && instance.saveFound)))) ||
        (request.shortcut === "mouse" && items.mouseEnabled && (items.mouseQuickEnabled || (instance && (instance.enabled && instance.saveFound))))) {
        URLI.Action.performAction(request.action, "message", instance, items);
      }
    }
  }

  /**
   * Listen for external requests from external extensions: URL Increment and URL Decrement. Note: request contains tab.
   *
   * @param request      the request containing properties to parse (e.g. greeting message) and tab
   * @param sender       the sender who sent this message
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @public
   */
  async function messageExternalListener(request, sender, sendResponse) {
    console.log("URLI.Background.messageExternalListener() - request.action=" + request.action + ", sender.id=" + sender.id);
    const URL_INCREMENT_EXTENSION_ID = "nlenihiahcecfodmnplonckfbilgegcg", //"decebmdlceenceecblpfjanoocfcmjai",
          URL_DECREMENT_EXTENSION_ID = "nnmjbfglinmjnieblelacmlobabcenfk";
    if (sender && (sender.id === URL_INCREMENT_EXTENSION_ID || sender.id === URL_DECREMENT_EXTENSION_ID) &&
        request && request.tab && (request.action === "increment" || request.action === "decrement")) {
      sendResponse({received: true});
      const items = await EXT.Promisify.getItems();
      const instance = getInstance(request.tab.id) || await buildInstance(request.tab, items);
      URLI.Action.performAction(request.action, "external", instance, items);
    }
  }

  /**
   * Listen for commands (Browser Extension shortcuts) and perform the command's action.
   * 
   * @param command the shortcut command that was performed
   * @public
   */
  async function commandListener(command) {
    if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "clear" || command === "return" || command === "auto")  {
      const items = await EXT.Promisify.getItems();
      if (!items.permissionsInternalShortcuts) {
        const tabs = await EXT.Promisify.getTabs();
        if (tabs && tabs[0]) { // The tab may not exist if command is called while in popup window
          const instance = getInstance(tabs[0].id) || await buildInstance(tabs[0], items);
          if (items.commandsQuickEnabled || (instance && (instance.enabled || instance.saveFound))) {
            URLI.Action.performAction(command, "command", instance, items);
          }
        }
      }
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
    if (changeInfo.status === "complete") {
      console.log("URLI.Background.tabUpdatedListener() - the chrome.tabs.onUpdated listener is on (download preview)!");
      const instance = URLI.Background.getInstance(tabId);
      // If download enabled auto not enabled, send a message to the popup to update the download preview (if it's open)
      if (instance && instance.downloadEnabled && !instance.autoEnabled) {
        chrome.runtime.sendMessage({greeting: "updatePopupDownloadPreview", instance: instance});
      }
      chrome.tabs.onUpdated.removeListener(tabUpdatedListener);
    }
  }

  /**
   * Makes the background persistent by calling chrome.tabs.query() every few seconds using a setTimeout() recursively.
   * If no instance exists when checking for tabs, the recursion stops and the background is no longer made persistent.
   *
   * @returns {Promise<void>}
   * @private
   */
  async function makePersistent() {
    const tabs = await EXT.Promisify.getTabs({}),
          tabIds = tabs.map(tab => tab.id);
    console.log("URLI.Background.makePersistent() - tabIds=" + tabIds);
    [...instances.keys()].forEach(function(key) {
      if (!tabIds.includes(key)) {
        URLI.Action.performAction("clear", "tabRemovedListener", getInstance(key)); // Tab was removed so clear instance
      }
    });
    if ([...instances.values()].some(instance => instance && instance.enabled)) {
      persistent = true;
      setTimeout(makePersistent, 3000); // Checking every 3 seconds keeps the background persistent
    } else {
      persistent = false;
    }
  }

  // Return Public Functions
  return {
    getSDV: getSDV,
    getLSDV: getLSDV,
    getInstances: getInstances,
    getInstance: getInstance,
    setInstance: setInstance,
    deleteInstance: deleteInstance,
    buildInstance: buildInstance,
    setBadge: setBadge,
    installedListener: installedListener,
    startupListener: startupListener,
    messageListener: messageListener,
    messageExternalListener: messageExternalListener,
    commandListener: commandListener,
    tabUpdatedListener: tabUpdatedListener
  };
}();

// Background Listeners
chrome.runtime.onInstalled.addListener(URLI.Background.installedListener);
chrome.runtime.onStartup.addListener(URLI.Background.startupListener);
chrome.runtime.onMessage.addListener(URLI.Background.messageListener);
chrome.runtime.onMessageExternal.addListener(URLI.Background.messageExternalListener);
if (chrome.commands) { chrome.commands.onCommand.addListener(URLI.Background.commandListener); } // Firefox Android: chrome.commands is unsupported