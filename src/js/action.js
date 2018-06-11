/**
 * URL Incrementer Action
 *
 * @author Roy Six
 * @namespace
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
    console.log("performAction instance=" + instance + ", action=" + action + ", caller=" + caller);
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
      // Rare race condition: If the user tries to manually perform the auto action when times is at 0 but before the page has loaded and auto has cleared itself
      if (instance.autoTimes < 0) { //|| instance.autoPaused && instance.autoTimes === 0) {
        console.log("performAction autoTimes < 0 rare case... bug?");
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

    switch (action) {
      case "increment":
      case "decrement":
        actionPerformed = incrementDecrement(instance, action, caller, callback);
        break;
      case "next":
      case "prev":
        actionPerformed = nextPrev(instance, action, caller, callback);
        break;
      case "clear":
        actionPerformed = clear(instance, action, caller, callback);
        break;
      case "auto": // the auto action is always pause or resume
        actionPerformed = auto(instance, action, caller, callback);
        break;
      case "download":
        actionPerformed = download(instance, action, caller, callback);
        break;
      default:
        break;
    }
    iconFeedback(instance, action, caller, callback, actionPerformed);
  }

  function incrementDecrement(instance, action, caller, callback) {
    let actionPerformed = false,
        urlProps;
    // If URLI didn't find a selection, we can't increment or decrement
    if (instance.selection !== "" && instance.selectionStart >= 0) {
      actionPerformed = true;
      // Handle Error Skipping:
      if ((instance.errorSkip > 0 && instance.errorCodes && instance.errorCodes.length > 0) && (!(caller === "popupClickActionButton" || caller === "auto") || instance.enhancedMode)) {
        console.log("doing error skipping");
        chrome.tabs.executeScript(instance.tabId, {file: "js/increment-decrement.js", runAt: "document_start"}, function() {
          const code = "URLI.IncrementDecrement.modifyURLAndSkipErrors(" +
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
          URLI.Background.setInstance(instance.tabId, instance);
        }
        chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
      }
    }
    return actionPerformed;
  }
  
  function nextPrev(instance, action, caller, callback) {
    let actionPerformed = true;
    chrome.tabs.executeScript(instance.tabId, {file: "js/next-prev.js", runAt: "document_end"}, function() {
      const code = "URLI.NextPrev.findNextPrevURL(" +
        JSON.stringify(action) + ", " + 
        JSON.stringify(instance.nextPrevLinksPriority) + ", " + 
        JSON.parse(instance.nextPrevSameDomainPolicy) + ");";
      chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results) {
        if (results && results[0]) {
          instance.url = results[0];
          chrome.tabs.update(instance.tabId, {url: instance.url});
        }
        if (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) {
          URLI.Background.setInstance(instance.tabId, instance);
        }
        chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
      });
    });
    return actionPerformed;
  }
  
  function clear(instance, action, caller, callback) {
    let actionPerformed = true;
    chrome.storage.sync.get(null, function(items) {
      if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
      }
      if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
      }
      if (instance.autoEnabled) {
        URLI.Auto.stopAutoTimer(instance, caller);
      }
      URLI.Background.deleteInstance(instance.tabId);
      // for callers like popup that still need the instance, disable all states and reset autoTimes
      instance.enabled = instance.downloadEnabled = instance.autoEnabled = instance.autoPaused = false;
      instance.autoTimes = instance.autoTimesOriginal;
      if (callback) {
        callback(instance);
      } else {
        chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
      }
    });
    return actionPerformed;
  }
  
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
          JSON.stringify(instance.downloadExcludes) + ");"
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
          if (results && results[0]) {
            var downloads = results[0];
            for (let download of downloads) {
              console.log("downloading url=" + download.url);
              chrome.downloads.download({url: download.url}, function(downloadId) {
                chrome.downloads.search({id: downloadId}, function(results) {
                  const downloadItem = results ? results[0] : undefined;
                  if (downloadItem) {
                    console.log(downloadItem);
                    console.log("totalBytes=" + downloadItem.totalBytes);
                    if (instance.downloadStrategy !== "page") {
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
          } else {
            console.log("no results");
          }
          if (callback) {
            callback(instance);
          }
        });
      });
    }
    return actionPerformed;
  }

  function iconFeedback(instance, action, caller, callback, actionPerformed) {
    // Icon Feedback
    if (actionPerformed && !(instance.autoEnabled || caller === "popupClearBeforeSet" || caller === "tabRemovedListener")) {
      chrome.storage.sync.get(null, function(items) {
        if (items.iconFeedbackEnabled) {
          URLI.Background.setBadge(instance.tabId, action, true);
        }
      });
    }
  }

  // Return Public Functions
  return {
    performAction: performAction
  };
}();