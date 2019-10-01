/**
 * URL Incrementer
 * @file background.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Background = (() => {

  // The storage default values. Note: Storage.set can only set top-level JSON objects, avoid using nested JSON objects (instead, prefix keys that should be grouped together with a label e.g. "auto")
  const STORAGE_DEFAULT_VALUES = {
    "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
    "iconColor": "dark", "iconFeedbackEnabled": false,
    "popupButtonSize": 32, "popupAnimationsEnabled": true,
    "decodeURIEnabled": true, "commandsQuickEnabled": true, "shortcutsEditableDisabled": true,
    "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": {"modifiers": 6, "code": "ArrowUp"}, "keyDecrement": {"modifiers": 6, "code": "ArrowDown"}, "keyNext": {"modifiers": 6, "code": "ArrowRight"}, "keyPrev": {"modifiers": 6, "code": "ArrowLeft"}, "keyClear": {"modifiers": 6, "code": "KeyX"}, "keyReturn": {"modifiers": 6, "code": "KeyZ"}, "keyAuto": {"modifiers": 6, "code": "Space"}, "keyDownload": null,
    "mouseEnabled": true, "mouseQuickEnabled": true, "mouseClickSpeed": 400, "mouseIncrement": {"button": 3, "clicks": 2}, "mouseDecrement": {"button": 4, "clicks": 2}, "mouseNext": null, "mousePrev": null, "mouseClear": null, "mouseReturn": null, "mouseAuto": null, "mouseDownload": null,
    "interval": 1, "leadingZerosPadByDetection": true, "shuffleLimit": 1000, "shuffleStart": false,
    "base": 10, "baseCase": "lowercase", "baseDateFormat": "", "baseRoman": "latin", "baseCustom": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    "selectionPriority": "prefixes", "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
    "errorSkip": 0, "errorCodes": ["404", "3XX"], "errorCodesCustom": [],
    "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
    // TODO (From Infy):
    // "nextType": "selector", "nextSelector": "[rel=\"next\"]", "nextXpath": "//*[@rel=\"next\"]", "nextAttribute": ["href"],
    // "prevType": "selector", "prevSelector": "[rel=\"prev\"],[rel=\"previous\"]", "prevXpath": "//*[@rel=\"prev\"]|//*[@rel=\"previous\"]", "prevAttribute": ["href"],
    // "nextKeywords":         ["pnnext", "next page", "next >", "next »", "next", "more results", "older posts", "older post", "older", "forward", "次", "&gt;", ">", "›", "→", "»"],
    // "prevKeywords":         ["pnprev", "previous page", "< prev", "« prev", "prev", "previous", "newer posts", "newer post", "newer", "前", "&lt;", "<", "‹", "←", "«"],
    "nextPrevKeywordsNext": ["pnnext", "next page", "next >", "next »", "next", "more results", "older posts", "older", "forward", "次", "&gt;", ">", "›", "→"],
    "nextPrevKeywordsPrev": ["pnprev", "previous page", "< prev", "« prev", "prev", "previous", "newer posts", "newer", "前", "&lt;", "<", "‹", "←"],
    "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "auto", "autoStart": false, "autoRepeatStart": false,
    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadSubfolder": "", "downloadSubfolderIncrement": false, "downloadPreview": ["thumb", "extension", "tag", "url", "compressed"], "downloadStart": false,
    "toolkitTool": "crawl", "toolkitAction": "increment", "toolkitQuantity": 10, "toolkitSeconds": 1, "toolkitScrape": false, "toolkitCrawlCheckboxes": ["url", "response", "code", "info", "ok", "error", "redirected", "other", "exception"], "toolkitStart": false,
    "scrapeMethod": "selector", "scrapeSelector": "", "scrapeProperty": [],
    "saves": [], "savePreselect": false, "saveKey": Cryptography.salt().substring(0,16)
  },

  // The browser action badges that will be displayed against the extension icon
  BROWSER_ACTION_BADGES = {
    "incrementm": { "text": "+",    "backgroundColor": "#4AACED" },
    "decrementm": { "text": "-",    "backgroundColor": "#4AACED" },
    "increment":  { "text": "+",    "backgroundColor": "#1779BA" },
    "decrement":  { "text": "-",    "backgroundColor": "#1779BA" },
    "increment2": { "text": "+",    "backgroundColor": "#004687" },
    "decrement2": { "text": "-",    "backgroundColor": "#004687" },
    "increment3": { "text": "+",    "backgroundColor": "#001354" },
    "decrement3": { "text": "-",    "backgroundColor": "#001354" },
    "next":       { "text": ">",    "backgroundColor": "#05854D" },
    "prev":       { "text": "<",    "backgroundColor": "#05854D" },
    "clear":      { "text": "X",    "backgroundColor": "#FF0000" },
    "return":     { "text": "RET",  "backgroundColor": "#FFCC22" },
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

  // A boolean flag to dynamically make the background temporarily persistent when an instance is enabled
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
   * @param tab   the tab properties (id, url) to set this instance with
   * @param items (optional) the storage items
   * @returns instance the newly built instance
   * @public
   */
  async function buildInstance(tab, items) {
    items = items ? items : await Promisify.getItems();
    if (items.decodeURIEnabled) {
      try {
        tab.url = decodeURI(tab.url);
      } catch(e) {
        console.log("buildInstance() - exception decoding URI, e=" + e + ", tab.url=" + (tab ? tab.url : ""));
      }
    }
    let via = "items",
        object = items,
        selection = IncrementDecrement.findSelection(tab.url, items.selectionPriority, items.selectionCustom);
    // First search for a save to build an instance from:
    for (const save of items.saves) {
      save.key = items.saveKey;
      const result = await Saves.matchesSave(save, tab.url);
      if (result.matches) {
        console.log("buildInstance() - found a " + save.type + " save for this tab's url");
        via = save.type;
        object = save;
        selection = save.type === "url" ? result.selection : IncrementDecrement.findSelection(tab.url, save.selectionPriority, save.selectionCustom);
        break;
      }
    }
    // Return the newly built instance using tab, via, selection, object, and items:
    return {
      "enabled": false, "autoEnabled": false, "downloadEnabled": false, "toolkitEnabled": false, "multiEnabled": false, "listEnabled": false,
      "tabId": tab.id, "url": tab.url,
      "saveFound": via !== "items", "saveType": via === "items" ? "none" : via,
      "selection": selection.selection, "selectionStart": selection.selectionStart,
      "leadingZeros": via === "url" ? object.leadingZeros : object.leadingZerosPadByDetection && selection.selection.charAt(0) === '0' && selection.selection.length > 1,
      "interval": object.interval,
      "base": object.base, "baseCase": object.baseCase, "baseDateFormat": object.baseDateFormat, "baseRoman": object.baseRoman, "baseCustom": object.baseCustom,
      "errorSkip": object.errorSkip, "errorCodes": object.errorCodes, "errorCodesCustom": object.errorCodesCustom,
      "fetchMethod": "HEAD",
      "multi": {"1": {}, "2": {}, "3": {}}, "multiCount": 0,
      "list": "",
      "urls": [],
      "shuffleURLs": false, "shuffleLimit": items.shuffleLimit, "shuffleStart": items.shuffleStart,
      "nextPrevKeywordsNext": items.nextPrevKeywordsNext, "nextPrevKeywordsPrev": items.nextPrevKeywordsPrev, "nextPrevLinksPriority": items.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items.nextPrevSameDomainPolicy,
      "autoAction": items.autoAction, "autoTimes": items.autoTimes, "autoSeconds": items.autoSeconds, "autoWait": items.autoWait, "autoBadge": items.autoBadge, "autoPaused": false, "autoRepeat": false, "autoRepeating": false, "autoRepeatCount": 0, "autoStart": items.autoStart, "autoRepeatStart": items.autoRepeatStart,
      "downloadStrategy": items.downloadStrategy, "downloadExtensions": items.downloadExtensions, "downloadTags": items.downloadTags, "downloadAttributes": items.downloadAttributes, "downloadSelector": items.downloadSelector,
      "downloadSubfolder": items.downloadSubfolder, "downloadSubfolderIncrement": items.downloadSubfolderIncrement, "downloadIncludes": items.downloadIncludes, "downloadExcludes": items.downloadExcludes, "downloadPreview": items.downloadPreview,  "downloadStart": items.downloadStart,
      "toolkitTool": items.toolkitTool, "toolkitAction": items.toolkitAction, "toolkitQuantity": items.toolkitQuantity, "toolkitSeconds": items.toolkitSeconds, "toolkitScrape": items.toolkitScrape, "toolkitStart": items.toolkitStart,
      "scrapeMethod": items.scrapeMethod, "scrapeSelector": items.scrapeSelector, "scrapeProperty": items.scrapeProperty
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
   * @private
   */
  async function installedListener(details) {
    // install: Open Options Page, 1.0-5.2: Reset storage and remove permissions, 5.3-5.8: 6.0 storage migration
    if (details.reason === "install" || (details.reason === "update" && details.previousVersion < "6.0")) {
      console.log("installedListener() - details.reason=" + details.reason);
      const sitems = details.reason === "update" ? await Promisify.getItems("sync") : undefined,
            litems = details.reason === "update" ? await Promisify.getItems("local") : undefined;
      chrome.storage.sync.clear(function() {
        chrome.storage.local.clear(function() {
          chrome.storage.local.set(STORAGE_DEFAULT_VALUES, function() {
            if (details.reason === "install") {
              chrome.runtime.openOptionsPage();
            } else if (details.reason === "update") {
              if (details.previousVersion >= "1.0" && details.previousVersion <= "5.2") {
                Permissions.removeAllPermissions();
              } else if (details.previousVersion === "0.0" || details.previousVersion >= "5.3" && details.previousVersion <= "5.8") {
                if (litems && litems.saves && litems.saves.length > 0) { chrome.storage.local.set({"saves": litems.saves}); }
                if (sitems && sitems.interval) { chrome.storage.local.set({"interval": sitems.interval}); }
              }
            }
          });
        });
      });
    }
    startupListener();
  }

  /**
   * The extension's background startup listener that is run the first time the extension starts.
   * For example, when Chrome is started, when the extension is installed or updated, or when the
   * extension is re-enabled after being disabled.
   *
   * @private
   */
  async function startupListener() {
    console.log("startupListener()");
    const items = await Promisify.getItems();
    // Ensure the chosen toolbar icon is set. Firefox Android: chrome.browserAction.setIcon() not supported
    if (chrome.browserAction.setIcon && items && ["dark", "light", "confetti", "urli"].includes(items.iconColor)) {
      console.log("startupListener() - setting browserAction icon to " + items.iconColor);
      chrome.browserAction.setIcon({
        path : {
          "16": "/img/16-" + items.iconColor + ".png",
          "24": "/img/24-" + items.iconColor + ".png",
          "32": "/img/32-" + items.iconColor + ".png"
        }
      });
    }
    // Firefox: Set badge text color to white always instead of using default color-contrasting introduced in FF 63
    if (typeof browser !== "undefined" && browser.browserAction && browser.browserAction.setBadgeTextColor) {
      browser.browserAction.setBadgeTextColor({color: "white"});
    }
    // Ensure Internal Shortcuts declarativeContent rule is added (it sometimes gets lost when the extension is updated re-enabled)
    if (items && items.permissionsInternalShortcuts) {
      Permissions.checkDeclarativeContent();
    }
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (e.g. Content Scripts). Note: sender contains tab
   * 
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tab
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @private
   */
  async function messageListener(request, sender, sendResponse) {
    console.log("messageListener() - request.greeting=" + request.greeting);
    if (request && request.greeting === "performAction") {
      // Firefox: sender.tab.url is undefined in FF due to not having tabs permissions (even though we have <all_urls>!), so use sender.url, which should be identical in 99% of cases (e.g. iframes may be different)
      sender.tab.url = sender.url;
      const items = await Promisify.getItems();
      const instance = getInstance(sender.tab.id) || await buildInstance(sender.tab, items);
      if ((request.shortcut === "key" && items.keyEnabled && (items.keyQuickEnabled || (instance && (instance.enabled || instance.saveFound)))) ||
        (request.shortcut === "mouse" && items.mouseEnabled && (items.mouseQuickEnabled || (instance && (instance.enabled || instance.saveFound))))) {
        Action.performAction(request.action, "message", instance, items);
      }
    }
  }

  /**
   * Listen for external requests from external extensions: URL Increment/Decrement Buttons. Note: request contains tab.
   *
   * @param request      the request containing properties to parse (e.g. greeting message) and tab
   * @param sender       the sender who sent this message
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @private
   */
  async function messageExternalListener(request, sender, sendResponse) {
    console.log("messageExternalListener() - request.action=" + request.action + ", sender.id=" + sender.id);
    const URL_INCREMENT_BUTTON_EXTENSION_ID = "pkmcgelkkkkcbnfcfnjpcbdgncoiflli",
          URL_DECREMENT_BUTTON_EXTENSION_ID = "ookjnpojpifnkgfcfofkdjbeejbacakj";
    if (sender && (sender.id === URL_INCREMENT_BUTTON_EXTENSION_ID || sender.id === URL_DECREMENT_BUTTON_EXTENSION_ID) &&
        request && request.tab && (request.action === "increment" || request.action === "decrement")) {
      sendResponse({received: true});
      const items = await Promisify.getItems();
      const instance = getInstance(request.tab.id) || await buildInstance(request.tab, items);
      Action.performAction(request.action, "external", instance, items);
    }
  }

  /**
   * Listen for commands (Browser Extension shortcuts) and perform the command's action.
   * 
   * @param command the shortcut command that was performed
   * @private
   */
  async function commandListener(command) {
    if (command === "increment" || command === "decrement" || command === "next" || command === "prev" || command === "clear" || command === "return" || command === "auto")  {
      const items = await Promisify.getItems();
      if (!items.permissionsInternalShortcuts) {
        const tabs = await Promisify.getTabs();
        // The tab may not exist if command is called while in popup window
        if (tabs && tabs[0]) {
          const instance = getInstance(tabs[0].id) || await buildInstance(tabs[0], items);
          if (items.commandsQuickEnabled || (instance && (instance.enabled || instance.saveFound))) {
            Action.performAction(command, "command", instance, items);
          }
        }
      }
    }
  }

  /**
   * Makes the background persistent by calling chrome.tabs.query() every few seconds using a setTimeout() recursively.
   * If no instance exists when checking for tabs, the recursion stops and the background is no longer made persistent.
   *
   * @private
   */
  async function makePersistent() {
    const tabs = await Promisify.getTabs({}),
          tabIds = tabs.map(tab => tab.id);
    [...instances.keys()].forEach(function(key) {
      if (!tabIds.includes(key)) {
        // Tab was removed so clear instance
        Action.performAction("clear", "tabRemovedListener", getInstance(key));
      }
    });
    if ([...instances.values()].some(instance => instance && instance.enabled)) {
      persistent = true;
      // Checking every 2.0 seconds keeps the background persistent
      setTimeout(makePersistent, 2000);
    } else {
      persistent = false;
    }
  }

  // Background Listeners
  chrome.runtime.onInstalled.addListener(installedListener);
  chrome.runtime.onStartup.addListener(startupListener);
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { messageListener(request, sender, sendResponse); if (request.async) { return true; } });
  chrome.runtime.onMessageExternal.addListener(messageExternalListener);
  // Firefox Android: chrome.commands is unsupported
  if (chrome.commands) { chrome.commands.onCommand.addListener(commandListener); }

  // Return Public Functions
  return {
    getSDV: getSDV,
    getInstances: getInstances,
    getInstance: getInstance,
    setInstance: setInstance,
    deleteInstance: deleteInstance,
    buildInstance: buildInstance,
    setBadge: setBadge
  };

})();