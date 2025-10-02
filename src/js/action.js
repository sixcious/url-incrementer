/**
 * URL Incrementer
 * @copyright © 2020 Six
 * @license https://github.com/sixcious/url-incrementer/blob/main/LICENSE
 */

var URLI = URLI || {};

URLI.Action = function () {

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
    //console.log("URLI.Action.performAction() - instance=" + instance + ", action=" + action + ", caller=" + caller);
    let actionPerformed = false;
    // Handle AUTO
    if (instance.autoEnabled) {
      // Get the most recent instance from Background in case auto has been paused
      instance = URLI.Background.getInstance(instance.tabId);
      // Handle autoTimes
      if (!instance.autoPaused) {
        if (instance.autoAction === action) {
          instance.autoTimes--;
        } else if ((instance.autoTimes < instance.autoTimesOriginal) &&
          ((instance.autoAction === "increment" || instance.autoAction === "decrement") && (action === "increment" || action === "decrement")) ||
          ((instance.autoAction === "next" || instance.autoAction === "prev") && (action === "next" || action === "prev"))) {
          instance.autoTimes++;
        }
      }
      // Prevents a rare race condition:
      // If the user tries to manually perform the auto action when times is at 0 but before the page has loaded and auto has cleared itself
      if (instance.autoTimes < 0) {
        //console.log("URLI.Action.performAction() - auto rare race condition encountered, about to clear. instance.autoTimes=" + instance.autoTimes);
        actionPerformed = clear(instance, action, caller, callback);
        return;
      }
    }
    // Handle DOWNLOAD
    if (instance.downloadEnabled) {
      // If download enabled auto not enabled, send a message to the popup to update the download preview (if it's open)
      if (!instance.autoEnabled && (["increment", "decrement", "next", "prev"].includes(action))) {
        chrome.tabs.onUpdated.addListener(URLI.Background.tabUpdatedListener);
      }
    }
    // Perform Action
    switch (action) {
      case "increment":
      case "decrement":
        if ((instance.errorSkip > 0 && (instance.errorCodes && instance.errorCodes.length > 0) || (instance.errorCodesCustomEnabled && instance.errorCodesCustom && instance.errorCodesCustom.length > 0)) && (!(caller === "popupClickActionButton" || caller === "auto" || caller === "externalExtension") || instance.enhancedMode)) {
          actionPerformed = incrementDecrementSkipErrors(instance, action, caller, callback);
        } else {
          actionPerformed = incrementDecrement(instance, action, caller, callback);
        }
        break;
      case "next":
      case "prev":
        actionPerformed = nextPrev(instance, action, caller, callback);
        break;
      case "clear":
        actionPerformed = clear(instance, action, caller, callback);
        break;
      case "auto": // the auto action is always a pause or resume
        actionPerformed = auto(instance, action, caller, callback);
        break;
      case "download":
        actionPerformed = download(instance, action, caller, callback);
        break;
      default:
        break;
    }
    // Icon Feedback if action was performed and other conditions are met (e.g. we don't show feedback if auto is enabled)
    if (actionPerformed && !(instance.autoEnabled || caller === "popupClearBeforeSet" || caller === "tabRemovedListener")) {
      chrome.storage.sync.get(null, function(items) {
        if (items.iconFeedbackEnabled) {
          URLI.Background.setBadge(instance.tabId, action, true);
        }
      });
    }
  }

  /**
   * Performs an increment or decrement action.
   * 
   * @param instance the instance for this tab
   * @param action   the action (increment or decrement)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @private
   */
  function incrementDecrement(instance, action, caller, callback) {
    let actionPerformed = false;
    // If URLI didn't find a selection, we can't increment or decrement
    if (instance.selection !== "" && instance.selectionStart >= 0) {
      actionPerformed = true;
      const urlProps = URLI.IncrementDecrement.modifyURL(action, instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros);
      instance.url = urlProps.urlmod;
      instance.selection = urlProps.selectionmod;
      chrome.tabs.update(instance.tabId, {url: instance.url});
      if (instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
        URLI.Background.setInstance(instance.tabId, instance);
      }
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
    }
    return actionPerformed;
  }

  /**
   * Performs an increment or decrement action while also skipping errors.
   *
   * @param instance the instance for this tab
   * @param action   the action (increment or decrement)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @private
   */
  function incrementDecrementSkipErrors(instance, action, caller, callback) {
    let actionPerformed = false;
    // If URLI didn't find a selection, we can't increment or decrement
    if (instance.selection !== "" && instance.selectionStart >= 0) {
      actionPerformed = true;
      //console.log("URLI.Action.incrementDecrementSkipErrors() - performing error skipping, about to execute increment-decrement.js script...");
      chrome.tabs.executeScript(instance.tabId, {
        file: "js/increment-decrement.js",
        runAt: "document_start"
      }, function () {
        // This covers a very rare case where the user might be trying to increment the domain and where we lose permissions to execute the script. Fallback to doing a normal increment/decrement operation
        if (chrome.runtime.lastError) {
          //console.log("URLI.Action.incrementDecrementSkipErrors() - chrome.runtime.lastError.message:" + chrome.runtime.lastError.message);
          return incrementDecrement(instance, action, caller, callback);
        }
        const code = "URLI.IncrementDecrement.modifyURLAndSkipErrors(" +
          JSON.stringify(action) + ", " +
          JSON.stringify(instance) + ", " +
          JSON.parse(instance.errorSkip) + ");";
        // No callback because this will be executing async code and then sending a message back to the background
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_start"});
      });
    }
    return actionPerformed;
  }

  /**
   * Performs a next or prev action.
   * 
   * @param instance the instance for this tab
   * @param action   the action (e.g. next or prev)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @private
   */
  function nextPrev(instance, action, caller, callback) {
    let actionPerformed = true;
    chrome.tabs.executeScript(instance.tabId, {file: "js/next-prev.js", runAt: "document_end"}, function() {
      const code = "URLI.NextPrev.findNextPrevURL(" +
        JSON.stringify(action) + ", " + 
        JSON.stringify(instance.nextPrevLinksPriority) + ", " + 
        JSON.parse(instance.nextPrevSameDomainPolicy) + ");";
      chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results) {
        if (results && results[0]) {
          const url = results[0];
          chrome.tabs.update(instance.tabId, {url: url});
          if (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) {
            //console.log("URLI.Action.nextPrev() - setting instance in background");
            instance.url = url;
            URLI.Background.setInstance(instance.tabId, instance);
          }
          chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
        }
      });
    });
    return actionPerformed;
  }

  /**
   * Performs a clear action.
   * 
   * @param instance the instance for this tab
   * @param action   the action (clear)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @private
   */
  function clear(instance, action, caller, callback) {
    let actionPerformed = false;
    // Prevents a clear badge from displaying if there is no instance (e.g. in quick shortcuts mode)
    if (instance.enabled || instance.autoEnabled || instance.downloadEnabled) {
      actionPerformed = true;
    }
    URLI.Background.deleteInstance(instance.tabId);
    if (caller !== "popupClearBeforeSet") { // Don't remove key/mouse listeners if popup clear before set
      chrome.storage.sync.get(null, function (items) {
        if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
        }
        if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
        }
      });
    }
    if (instance.autoEnabled) {
      URLI.Auto.stopAutoTimer(instance, caller);
    }
    // for callers like popup that still need the instance, disable all states and reset autoTimes
    instance.enabled = instance.downloadEnabled = instance.autoEnabled = instance.autoPaused = false;
    instance.autoTimes = instance.autoTimesOriginal;
    if (callback) {
      callback(instance);
    } else {
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
    }
    return actionPerformed;
  }

  /**
   * Performs an auto action (pause or resume only).
   * 
   * @param instance the instance for this tab
   * @param action   the action (auto pause/resume)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @private
   */
  function auto(instance, action, caller, callback) {
    let actionPerformed = false;
    if (instance && instance.autoEnabled) {
      URLI.Auto.pauseOrResumeAutoTimer(instance);
      instance = URLI.Background.getInstance(instance.tabId); // Get the updated pause or resume state set by auto
      if (callback) {
        callback(instance);
      } else {
        chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
      }
      actionPerformed = true;
    }
    return actionPerformed;
  }

  /**
   * Performs a download action.
   * 
   * @param instance the instance for this tab
   * @param action   the action (download)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param callback the function callback (optional)
   * @private
   */
  function download(instance, action, caller, callback) {
    let actionPerformed = false;
    if (instance.downloadEnabled) {
      actionPerformed = true;
      chrome.tabs.executeScript(instance.tabId, {file: "js/download.js", runAt: "document_end"}, function() {
        const code = "URLI.Download.findDownloadURLs(" +
          JSON.stringify(instance.downloadStrategy) + ", " +
          JSON.stringify(instance.downloadExtensions) + ", " +
          JSON.stringify(instance.downloadTags) + ", " +
          JSON.stringify(instance.downloadAttributes) + ", " +
          JSON.stringify(instance.downloadSelector) + ", " +
          JSON.stringify(instance.downloadIncludes) + ", " +
          JSON.stringify(instance.downloadExcludes) + ");";
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
          if (results && results[0]) {
            const downloads = results[0];
            for (let download of downloads) {
              //console.log("URLI.Action.download() - downloading url=" + download.url + " ... ");
              chrome.downloads.download({url: download.url}, function(downloadId) {
                chrome.downloads.search({id: downloadId}, function(results) {
                  const downloadItem = results ? results[0] : undefined;
                  if (downloadItem) {
                    if (downloadItem.totalBytes > 0 && (
                        (!isNaN(instance.downloadMinMB) && instance.downloadMinMB > 0 ? (instance.downloadMinMB * 1048576) > downloadItem.totalBytes : false) ||
                        (!isNaN(instance.downloadMaxMB) && instance.downloadMaxMB > 0 ? (instance.downloadMaxMB * 1048576) < downloadItem.totalBytes : false)
                      )) {
                      //console.log("URLI.Action.download() - canceling download because downloadItem.totalbytes=" + downloadItem.totalBytes + " and instance.MinMB=" + (instance.downloadMinMB * 1048576) + " or instance.MaxMB=" + (instance.downloadMaxMB * 1048576));
                      chrome.downloads.cancel(downloadId);
                    }
                  }
                });
              });
            }
          }
          if (callback) {
            callback(instance);
          }
        });
      });
    }
    return actionPerformed;
  }

  // Return Public Functions
  return {
    performAction: performAction
  };
}();