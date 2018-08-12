/**
 * URL Increment Button Background
 *
 * @author Roy Six
 * @namespace
 */

var URLIncrementButton = URLIncrementButton || {};

URLIncrementButton.Background = function () {

  const URL_INCREMENTER_EXTENSION_ID = "hjgllnccfndbjbedlecgdedlikohgbko";

  // The sync storage default values
  // Note: Storage.set can only set top-level JSON objects, do not use nested JSON objects (instead, prefix keys that should be grouped together)
  const items_ = {
      /* permissions */ "permissionsInternalShortcuts": false, "permissionsDownload": false, "permissionsEnhancedMode": false,
      /* icon */        "iconColor": "dark", "iconFeedbackEnabled": false,
      /* popup */       "popupButtonSize": 32, "popupAnimationsEnabled": true, "popupOpenSetup": true, "popupSettingsCanOverwrite": true,
      /* shortcuts */   "quickEnabled": true, "shortcutsMixedMode": false,
      /* key */         "keyEnabled": true, "keyQuickEnabled": true, "keyIncrement": [6, "ArrowUp"], "keyDecrement": [6, "ArrowDown"], "keyNext": [6, "ArrowRight"], "keyPrev": [6, "ArrowLeft"], "keyClear": [6, "KeyX"], "keyReturn": [6, "KeyB"], "keyAuto": [6, "KeyA"],
      /* mouse */       "mouseEnabled": false, "mouseQuickEnabled": false, "mouseFIncrement": -1, "mouseFDecrement": -1, "mouseIncrement": -1, "mouseDecrement": -1, "mouseNext": -1, "mousePrev": -1, "mouseClear": -1, "mouseReturn": -1, "mouseAuto": -1,
      /* inc dec */     "selectionPriority": "prefixes", "interval": 1, "leadingZerosPadByDetection": true, "base": 10, "baseCase": "lowercase", "baseDateFormat": "", "shuffleLimit": 1000, "selectionCustom": { "url": "", "pattern": "", "flags": "", "group": 0, "index": 0 },
      /* error skip */  "errorSkip": 0, "errorCodes": ["404", "", "", ""], "errorCodesCustomEnabled": false, "errorCodesCustom": [],
      /* next prev */   "nextPrevLinksPriority": "attributes", "nextPrevSameDomainPolicy": true, "nextPrevPopupButtons": false,
      /* keywords */    "nextPrevKeywordsNext": ["pnnext", "next page", "next", "forward", "次", "&gt;", ">", "newer"], "nextPrevKeywordsPrev": ["pnprev", "previous page", "prev", "previous", "前", "&lt;", "<", "‹", "back", "older"], "nextPrevStartsWithExcludes": ["&gt;", ">", "new", "&lt;", "<", "‹", "back", "old"],
      /* auto */        "autoAction": "increment", "autoTimes": 10, "autoSeconds": 5, "autoWait": true, "autoBadge": "times", "autoRepeat": false,
      /* download */    "downloadStrategy": "extensions", "downloadExtensions": [], "downloadTags": [], "downloadAttributes": [], "downloadSelector": "", "downloadIncludes": [], "downloadExcludes": [], "downloadMinMB": null, "downloadMaxMB": null, "downloadPreview": ["thumb", "extension", "tag", "url", "compressed"],
      /* toolkit */     "toolkitTool": "open-tabs", "toolkitAction": "increment", "toolkitQuantity": 1,
      /* fun */         "urli": "loves incrementing for you"
  };

  /**
   * Listen for browser action (extension icon) clicks and then sends a message to
   * URL Incrementer to perform an action. Must have activeTab permission to send tab with tab.url.
   *
   * @param tab the tab in which this click occurred
   * @public
   */
  function clickListener(tab) {
    //console.log("URLIncrementButton.Background.clickListener() - about to send message with tab.id=" + tab.id);
    chrome.runtime.sendMessage(URL_INCREMENTER_EXTENSION_ID, {"greeting": "performAction", "action": "increment", "tab": tab}, function(response) {
      if (!response || !response.received) {
        console.log("No response, performing standalone action");
        buildInstance(tab);
      }
    });
  }


  /**
   * Builds an instance with default values: either an existing saved profile or by using the storage items defaults.
   *
   * @param tab the tab properties (id, url) to set this instance with
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(tab) {
    // const profiles = localItems_.profiles;
    // let props;
    // // First search for a profile to build an instance from:
    // if (profiles && profiles.length > 0) {
    //   for (let profile of profiles) {
    //     const result = await URLI.SaveURLs.matchesURL(profile, tab.url);
    //     if (result.matches) {
    //       console.log("URLI.Background.buildInstance() - found a profile for this tab's url");
    //       props = buildProps("profile", profile, result);
    //       break;
    //     }
    //   }
    // }
    // If no profile found, build using storage items:
    // if (!props) {
    //   const selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items_.selectionPriority, items_.selectionCustom); // selection, selectionStart
    //   props = buildProps("items", items_, selectionProps);
    // }
    // // StartingURL: Check if a skeleton instance exists only containing the Starting URL, otherwise use tab.url (for Quick Shortcuts)
    // props.startingURL = getInstance(tab.id) && getInstance(tab.id).startingURL ? getInstance(tab.id).startingURL : tab.url;
    // Return newly built instance using props and items:

    const selectionProps = URLI.IncrementDecrement.findSelection(tab.url, items_.selectionPriority, items_.selectionCustom); // selection, selectionStart
    //props = buildProps("items", items_, selectionProps);
    const instance = {
      "enabled": false, "incrementDecrementEnabled": false, "autoEnabled": false, "downloadEnabled": false, "multiEnabled": false, "toolkitEnabled": false, "autoPaused": false,
      "tabId": tab.id, "url": tab.url, "startingURL": tab.url, //props.startingURL,
      "profileFound": false, //props.profileFound,
      "selection": selectionProps.selection, "selectionStart": selectionProps.selectionStart, "startingSelection": selectionProps.selection, "startingSelectionStart": selectionProps.selectionStart,
      "leadingZeros": items_.leadingZerosPadByDetection && selectionProps.selection.charAt(0) === '0' && selectionProps.selection.length > 1,
      "interval": items_.interval,
      "base": items_.base, "baseCase": items_.baseCase, "baseDateFormat": items_.baseDateFormat,
      "errorSkip": items_.errorSkip, "errorCodes": items_.errorCodes, "errorCodesCustomEnabled": items_.errorCodesCustomEnabled, "errorCodesCustom": items_.errorCodesCustom,
      "multi": {"1": {}, "2": {}, "3": {}}, "multiCount": 0,
      "urls": [], "customURLs": false, "shuffleURLs": false, "shuffleLimit": items_.shuffleLimit,
      "nextPrevLinksPriority": items_.nextPrevLinksPriority, "nextPrevSameDomainPolicy": items_.nextPrevSameDomainPolicy,
      "autoAction": items_.autoAction, "autoTimesOriginal": items_.autoTimes, "autoTimes": items_.autoTimes, "autoSeconds": items_.autoSeconds, "autoWait": items_.autoWait, "autoBadge": items_.autoBadge, "autoRepeat": items_.autoRepeat, "autoRepeatCount": 0,
      "downloadStrategy": items_.downloadStrategy, "downloadExtensions": items_.downloadExtensions, "downloadTags": items_.downloadTags, "downloadAttributes": items_.downloadAttributes, "downloadSelector": items_.downloadSelector,
      "downloadIncludes": items_.downloadIncludes, "downloadExcludes": items_.downloadExcludes,
      "downloadMinMB": items_.downloadMinMB, "downloadMaxMB": items_.downloadMaxMB,
      "downloadPreview": items_.downloadPreview,
      "toolkitTool": items_.toolkitTool, "toolkitAction": items_.toolkitAction, "toolkitQuantity": items_.toolkitQuantity
    };
    URLI.Action.performAction("increment", "externalExtension", instance);
  }

  function getItems() {
    return items_;
  }

  // Return Public Functions
  return {
    clickListener: clickListener,
    getItems: getItems
  };
}();

// Background Listeners
chrome.browserAction.onClicked.addListener(URLIncrementButton.Background.clickListener);