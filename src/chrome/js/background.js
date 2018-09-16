/**
 * URL Incrementer Background
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Background = function () {

  // The sync storage default values
  // Note: Storage.set can only set top-level JSON objects, avoid using nested JSON objects (instead, prefix keys that should be grouped together with a label e.g. "auto")
  const STORAGE_DEFAULT_VALUES = {
    /* permissions */ "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
    /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
    /* popup */       "popupButtonSize": 32, "popupAnimationsEnabled": true,
    /* commands */    "commandsQuickEnabled": true,
    /* actions */     "actions": [{"increment": "Increment"}, {"decrement": "Decrement"}, {"next": "Next"}, {"prev": "Prev"}, {"clear": "Clear"}, {"return": "Return"}, {"auto": "Auto"}],
    /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": {"modifiers": 6, "code": "ArrowUp"}, "keyDecrement": {"modifiers": 6, "code": "ArrowDown"}, "keyNext": {"modifiers": 6, "code": "ArrowRight"}, "keyPrev": {"modifiers": 6, "code": "ArrowLeft"}, "keyClear": {"modifiers": 6, "code": "KeyX"}, "keyReturn": {"modifiers": 6, "code": "KeyB"}, "keyAuto": {"modifiers": 6, "code": "KeyA"},
    /* mouse */       "mouseEnabled": true, "mouseQuickEnabled": true, "mouseClickSpeed": 400, "mouseIncrement": {"button": 3, "clicks": 2}, "mouseDecrement": {"button": 3, "clicks": 3}, "mouseNext": null, "mousePrev": null, "mouseClear": null, "mouseReturn": null, "mouseAuto": null,
    /* inc dec */     "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "baseDateFormat": "", "baseCustom": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", "shuffleLimit": 1000, "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    /* error skip */  "errorSkip": 0, "errorCodes": ["404", "", "", ""], "errorCodesCustomEnabled": false, "errorCodesCustom": [],
    /* next prev */   "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    /* keywords */    "nextPrevKeywordsNext": ["pnnext", "next page", "next", "forward", "次", "&gt;", ">", "newer"], "nextPrevKeywordsPrev": ["pnprev", "previous page", "prev", "previous", "前", "&lt;", "<", "‹", "back", "older"],
    /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times",
    /* download */    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null, "downloadPreview": ["thumb", "extension", "tag", "url", "compressed"],
    /* toolkit */     "toolkitTool": "open-tabs", "toolkitAction": "increment", "toolkitQuantity": 1,
    /* fun */         "urli": "loves incrementing for you"
  },

  // The local storage default values
  LOCAL_STORAGE_DEFAULT_VALUES = {
    /* saves */ "saves": [], "savePreselect": false
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "increment":  { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement":  { "text": "-",    "backgroundColor": "#1779BA" },
    "increment1": { "text": "+",    "backgroundColor": "#004687" },
    "decrement1": { "text": "-",    "backgroundColor": "#004687" },
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

  // The individual tab instances in Background memory
  // Note: We never save instances in storage due to URLs being a privacy concern
  instances = new Map();

  // A boolean flag to dynamically make the background temporarily persistent (when an instance is enabled or auto is on)
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
   * Sets the instance.
   * 
   * @param tabId    the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    // Firefox: Set a deep-copy of the instance via serialization to avoid the Firefox "can't access dead object" error
    instances.set(tabId, JSON.parse(JSON.stringify(instance)));
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
    let props;
    // First search for a save to build an instance from:
    if (saves && saves.length > 0) {
      for (let save of saves) {
        const result = await URLI.SaveURLs.matchesURL(save, tab.url);
        if (result.matches) {
          console.log("URLI.Background.buildInstance() - found a " + save.type + " save for this tab's url");
          props = buildProps(save.type, tab, save, save.type === "exact" ? result : URLI.IncrementDecrement.findSelection(tab.url, save.selectionPriority, save.selectionCustom));
          break;
        }
      }
    }
    // If no save found, build using storage items:
    if (!props) {
      const selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom); // selection, selectionStart
      props = buildProps("items", tab, items, selectionProps);
    }
    // StartingURL: Check if a skeleton instance exists only containing the Starting URL, otherwise use tab.url (for Quick Shortcuts)
    const instance = getInstance(tab.id);
    if (instance && instance.isSkeleton) {
      props.startingURL = instance.startingURL;
      props.startingSelection = instance.startingSelection;
      props.startingSelectionStart = instance.startingSelectionStart;
    }
    // Return newly built instance using props and items:
    return {
      "enabled": false, "incrementDecrementEnabled": false, "autoEnabled": false, "downloadEnabled": false, "multiEnabled": false, "toolkitEnabled": false,
      "tabId": props.tabId, "url": props.url, "startingURL": props.startingURL,
      "saveFound": props.saveFound, "saveType": props.saveType,
      "selection": props.selection, "selectionStart": props.selectionStart, "startingSelection": props.startingSelection, "startingSelectionStart": props.startingSelectionStart,
      "leadingZeros": props.leadingZeros,
      "interval": props.interval,
      "base": props.base, "baseCase": props.baseCase, "baseDateFormat": props.baseDateFormat, "baseCustom": props.baseCustom,
      "errorSkip": props.errorSkip, "errorCodes": props.errorCodes, "errorCodesCustomEnabled": props.errorCodesCustomEnabled, "errorCodesCustom": props.errorCodesCustom,
      "multi": {"1": {}, "2": {}, "3": {}}, "multiCount": 0,
      "urls": [], "customURLs": false, "shuffleURLs": false, "shuffleLimit": items.shuffleLimit,
      "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
      "autoAction": items.autoAction, "autoTimesOriginal": items.autoTimes, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait, "autoBadge": items.autoBadge, "autoRepeat": false, "autoRepeatCount": 0, "autoPaused": false,
      "downloadStrategy": items.downloadStrategy, "downloadExtensions": items.downloadExtensions, "downloadTags": items.downloadTags, "downloadAttributes": items.downloadAttributes, "downloadSelector": items.downloadSelector,
      "downloadIncludes": items.downloadIncludes, "downloadExcludes": items.downloadExcludes,
      "downloadMinMB": items.downloadMinMB, "downloadMaxMB": items.downloadMaxMB,
      "downloadPreview": items.downloadPreview,
      "toolkitTool": items.toolkitTool, "toolkitAction": items.toolkitAction, "toolkitQuantity": items.toolkitQuantity
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
  function installedListener(details) {
    // New Installations: Setup storage and open Options Page in a new tab
    if (details.reason === "install") {
      console.log("URLI.Background.installedListener() - details.reason === install");
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(STORAGE_DEFAULT_VALUES, function() {
          chrome.storage.local.clear(function() {
            chrome.storage.local.set(LOCAL_STORAGE_DEFAULT_VALUES, function() {
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
            });
          });
        });
      });
      if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined);
      }
      chrome.permissions.remove({ permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]});
    }
    // 5.3 - 5.5 only: Storage and Permission changes for 6.0
    else if (details.reason === "update" && details.previousVersion >= "5.3" && details.previousVersion <= "5.5") {
      console.log("URLI.Background.installedListener() - details.reason === update, details.previousVersion 5.3 - 5.5, actual previousVersion=" + details.previousVersion);
      chrome.storage.sync.get(null, function(items) {
        chrome.storage.sync.set({
          // TODO
          "toolkitTool": "open-tabs", "toolkitAction": "increment", "toolkitQuantity": 1
        });
      });
      chrome.storage.local.clear(function() {
        chrome.storage.local.set(LOCAL_STORAGE_DEFAULT_VALUES);
      });
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
  async function startupListener() {
    const items = await EXT.Promisify.getItems();
    console.log("URLI.Background.startupListener()");
    // Ensure the chosen toolbar icon is set. Firefox Android: chrome.browserAction.setIcon() not supported
    if (chrome.browserAction.setIcon && items && ["dark", "light", "rainbow", "urli"].includes(items.iconColor)) {
      console.log("URLI.Background.startupListener() - setting browserAction icon to " + items.iconColor);
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
    if (items && items.permissionsInternalShortcuts && chrome.declarativeContent) {
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

  /**
   * Listen for requests from chrome.runtime.sendMessage (e.g. Content Scripts).
   * 
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tabId
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @public
   */
  async function messageListener(request, sender, sendResponse) {
    console.log("URLI.Background.messageListener() - request.greeting=" + request.greeting);
    let instance, items;
    switch (request.greeting) {
      case "performAction":
        items = await EXT.Promisify.getItems();
        let tab;
        // if sender.tab, messageListener, else if request.tab messageExternalListener
        // Firefox: sender tab.url is undefined in FF due to not having tabs permissions (even though we have <all_urls>!), so use sender.url, which should be identical in 99% of cases (e.g. iframes may be different)
        if (sender && sender.tab && sender.tab.id) {
          tab = sender.tab;
          tab.url = sender.url;
        } else {
          tab = request.tab;
        }
        instance = getInstance(tab.id);
        if ((!instance || !instance.enabled)) { // && request.action !== "auto") {
          instance = await buildInstance(tab, items);
          if (request.shortcut && request.shortcut === "key") {
            if (!(items.keyEnabled && (items.keyQuickEnabled || (instance && (instance.enabled || instance.autoEnabled || instance.saveFound))))) {
              instance = undefined;
            }
          } else if (request.shortcut && request.shortcut === "mouse") {
            if (!(items.mouseEnabled && (items.mouseQuickEnabled || (instance && (instance.enabled || instance.autoEnabled || instance.saveFound))))) {
              instance = undefined;
            }
          }
        }
        if (instance) {
          URLI.Action.performAction(request.action, "content-script", instance, items);
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
      case "setBadge":
        if (request.instance && !request.instance.autoEnabled) {
          setBadge(request.tabId, request.badge, request.temporary, request.text, request.backgroundColor);
        }
        break;
      default:
        break;
    }
    //sendResponse({});
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
    console.log("URLI.Background.messageExternalListener() - request.action=" + request.action + " sender.id=" + sender.id);
    const URL_INCREMENT_EXTENSION_ID = "mehmeedmngjlehllbpncbjokegfhnfmg", //"decebmdlceenceecblpfjanoocfcmjai",
          URL_DECREMENT_EXTENSION_ID = "nnmjbfglinmjnieblelacmlobabcenfk";
    if (sender && (sender.id === URL_INCREMENT_EXTENSION_ID || sender.id === URL_DECREMENT_EXTENSION_ID) &&
        request && (request.action === "increment" || request.action === "decrement")) {
      sendResponse({"received": true});
      messageListener(request, sender);
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
        if (tabs && tabs[0]) { // for example, tab may not exist if command is called while in popup window
          let instance = getInstance(tabs[0].id);
          // TODO: Check instance.saveFound
          if (((command === "increment" || command === "decrement" || command === "next" || command === "prev") && (items.commandsQuickEnabled || (instance && instance.enabled))) ||
              (command === "auto" && instance && instance.autoEnabled) ||
              ((command === "clear") && instance && (instance.enabled || instance.autoEnabled || instance.downloadEnabled)) ||
              (command === "return" && instance && instance.startingURL)) {
            if (items.commandsQuickEnabled && (!instance || !instance.enabled)) {
              instance = await buildInstance(tabs[0], items);
            }
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
   * Builds properties for an instance using either a base of a saved URL or storage items.
   *
   * @param via   string indicating how the props are being built (one of "exact", "partial" (saves), or "items" (storage))
   * @param tab   the tab to build from (id and url)
   * @param object  the base object to build from (saved url or storage items)
   * @param sobject the selection base object to build from
   * @returns {{}} the built properties from the bases
   * @private
   */
  function buildProps(via, tab, object, sobject) {
    const props = {};
    props.tabId = tab.id;
    props.url = props.startingURL = tab.url;
    props.saveFound = via === "exact" || via === "partial";
    props.saveType = via === "items" ? "none" : via;
    props.selection = props.startingSelection = sobject.selection;
    props.selectionStart = props.startingSelectionStart = via === "exact" ? object.selectionStart : sobject.selectionStart;
    props.interval = object.interval;
    props.base = object.base;
    props.baseCase = object.baseCase;
    props.baseDateFormat = object.baseDateFormat;
    props.baseCustom = object.baseCustom;
    props.leadingZeros = via === "exact" ? object.leadingZeros : object.leadingZerosPadByDetection && props.selection.charAt(0) === '0' && props.selection.length > 1;
    props.errorSkip = object.errorSkip;
    props.errorCodes = object.errorCodes;
    props.errorCodesCustomEnabled = object.errorCodesCustomEnabled;
    props.errorCodesCustom = object.errorCodesCustom;
    return props;
  }

  /**
   * Makes the background persistent by calling chrome.tabs.query() and using a setTimeout() recursively.
   * If no instance exists when checking for tabs, the recursion stops.
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
        URLI.Action.performAction("clear", "tabRemovedListener", getInstance(key));
      }
    });
    if ([...instances.values()].some(instance => instance && instance.enabled)) {
      persistent = true;
      console.log("URLI.Background.makePersistent() - making persistent because an instance currently exists");
      setTimeout(makePersistent, 3000); // Checking every few seconds keep the background persistent
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
if (chrome.commands && chrome.commands.onCommand) { chrome.commands.onCommand.addListener(URLI.Background.commandListener); } // Firefox Android: chrome.commands is unsupported