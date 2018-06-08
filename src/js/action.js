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
    var actionPerformed = true;

    // Reject the action if the instance doesn't exist        
    if (!instance) {
      return;
    }
        
    // Get the most recent instance from Background in case auto has been paused
    if (instance.autoEnabled) {
      instance = URLI.Background.getInstance(instance.tabId);
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
    
    // If download enabled auto not enabled, send a message to the popup to update the download preview (if it's open)
    if (instance && instance.downloadEnabled && !instance.autoEnabled && (["increment", "decrement", "next", "prev"].includes(action))) {
      chrome.tabs.onUpdated.addListener(URLI.Background.tabUpdatedListener);
    }

    switch (action) {
      case "increment":
      case "decrement":
        incrementDecrement(instance, action, caller, callback);
        break;
      case "incrementDecrementSkipErrors":
        incrementDecrementSkipErrors(instance, action, caller, callback);
        break;
      case "next":
      case "prev":
        nextPrev(instance, action, caller, callback);
        break;
      case "clear":
        clear(instance, action, caller, callback);
        break;
      case "auto": // the auto action is always pause or resume
        auto(instance, action, caller, callback);
        break;
      case "download":
        download(instance, action, caller, callback);
        break;
      default:
        break;
    }
    // Icon Feedback
    if (actionPerformed && !(instance.autoEnabled || caller === "popupClearBeforeSet" || caller === "tabRemovedListener")) {
      chrome.storage.sync.get(null, function(items) {
        if (items.iconFeedbackEnabled) {
          URLI.Background.setBadge(instance.tabId, action, true);
        }
      });
    }
  }

  function incrementDecrement(instance, action, caller, callback) {
    var urlProps;
    // If URLI didn't find a selection, don't update the tab
    if (instance.selection !== "" && instance.selectionStart >= 0) {
      actionPerformed = true;
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
  }
  
  function incrementDecrementSkipErrors(instance, action, caller, callback) {
    chrome.tabs.update(instance.tabId, {url: instance.url});
    if (instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
      URLI.Background.setInstance(instance.tabId, instance);
    }
    chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
  }
  
  function nextPrev(instance, action, caller, callback) {
    //actionPerformed = true;
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
  }
  
  function clear(instance, action, caller, callback) {
    //actionPerformed = true;
    chrome.storage.sync.get(null, function(items) {
      if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
      }
      if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
      }
      if (instance && instance.autoEnabled) {
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
  }
  
  function auto(instance, action, caller, callback) {
    console.log("in auto action in background.js");
    console.log("caller=" + caller + " instance.autoPaused=" + instance.autoPaused);
    console.log(instance);
    URLI.Auto.pauseOrResumeAutoTimer(instance);
    instance = URLI.Background.getInstance(instance.tabId); // Get the updated pause or resume state set by auto
    if (callback) {
      callback(instance);
    } else {
    chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
    }
  }
  
  function download(instance, action, caller, callback) {
    if (instance && instance.downloadEnabled) {
      //actionPerformed = true;
      chrome.tabs.executeScript(instance.tabId, {file: "js/download.js", runAt: "document_end"}, function() {
        const code = "URLI.Download.findDownloadURLs(" +
          JSON.stringify(instance.downloadStrategy) + ", " +
          JSON.stringify(instance.downloadTypes) + ", " +
          JSON.stringify(instance.downloadTags) + ", " +
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
                    console.log("downloadMime=" + download.mime + " downloadItem.mime=" + downloadItem.mime);
                    console.log("totalBytes=" + downloadItem.totalBytes);
                    if (instance.downloadStrategy !== "page") {
                      if (instance.downloadEnforceMime) {
                        console.log("download -- enforcing mime!");
                        if (download.mime && downloadItem.mime && download.mime.toLowerCase() !== downloadItem.mime.toLowerCase()) {
                          console.log("Cancelking@@@ because mime isn't equal! downloadMime=" + download.mime + " downloadItem.mime=" + downloadItem.mime);
                          chrome.downloads.cancel(downloadId);
                        } else {
                          console.log("Checked the mimes and they are EQUAL... phew!");
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
  }

  // Return Public Functions
  return {
    performAction: performAction
  };
}();