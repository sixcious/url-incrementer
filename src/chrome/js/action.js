/**
 * URL Incrementer
 * @file action.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Action = (() => {

  /**
   * Performs an action.
   *
   * @param action   the action (e.g. "increment")
   * @param caller   String indicating who called this function (e.g. command, popup, message)
   * @param instance the instance for this tab
   * @param items    (optional) the storage items
   * @param callback (optional) the function callback
   * @public
   */
  async function performAction(action, caller, instance, items, callback) {
    console.log("performAction() - action=" + action + ", caller=" + caller);
    items = items ? items : await Promisify.getItems();
    let actionPerformed = false;
    // Pre-Perform Action - First, Handle Auto:
    if (instance.autoEnabled) {
      // In case auto has been paused, get the most recent instance from Background
      instance = Background.getInstance(instance.tabId) || instance;
      // Handle autoTimes
      if (instance.autoAction === action) {
        instance.autoTimes--;
      } else if ((instance.autoTimes < instance.autoTimesOriginal) &&
        ((instance.autoAction === "increment" || instance.autoAction === "decrement") && (action === "increment" || action === "decrement")) ||
        ((instance.autoAction === "next" || instance.autoAction === "prev") && (action === "next" || action === "prev"))) {
        instance.autoTimes++;
      }
      // Prevents a rare race condition: If the user tries to manually perform the auto action when times is at 0 but before the page has loaded and auto has cleared itself
      if (instance.autoTimes < 0) {
        console.log("performAction() - auto rare race condition encountered, about to clear. instance.autoTimes=" + instance.autoTimes);
        action = "clear";
      }
    }
    // If download enabled and the action is updating the tab, send a message to the popup to update the download preview (assuming it's open)
    if (instance.downloadEnabled && ["increment", "decrement", "next", "prev"].includes(action)) {
      chrome.tabs.onUpdated.addListener(function downloadPreviewListener(tabId, changeInfo, tab) {
        // Send this message at "complete" because it doesn't refresh properly at "loading" sometimes (even though the download script runs at document_end)
        if (changeInfo.status === "complete") {
          console.log("downloadPreviewListener() - the chrome.tabs.onUpdated download preview listener is on!");
          chrome.runtime.sendMessage({greeting: "updatePopupDownloadPreview", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
          chrome.tabs.onUpdated.removeListener(downloadPreviewListener);
        }
      });
    }
    // Action:
    switch (action) {
      case "increment":  case "decrement":
      case "increment1": case "decrement1":
      case "increment2": case "decrement2":
      case "increment3": case "decrement3":
        actionPerformed = incrementDecrement(action, instance, items);
        break;
      case "next": case "prev":
        actionPerformed = nextPrev(action, instance);
        break;
      case "clear":
        actionPerformed = clear(caller, instance, items);
        break;
      case "return":
        actionPerformed = returnToStart(caller, instance);
        break;
      case "toolkit":
        actionPerformed = toolkit(instance);
        break;
      case "auto":
        actionPerformed = auto(instance);
        break;
      case "download":
        actionPerformed = download(instance, callback);
        break;
      default:
        break;
    }
    // Post-Perform Action - Icon Feedback if action was performed and other conditions are met (e.g. we don't show feedback if auto is enabled):
    if (items.iconFeedbackEnabled && actionPerformed && !(instance.autoEnabled || (caller === "auto" && instance.autoRepeat) || caller === "popupClearBeforeSet" || caller === "tabRemovedListener")) {
      // Reset Multi Action to the appropriate badge (increment becomes "incrementm", increment1 becomes "increment")
      action = instance.multiEnabled ? action === "increment" || action === "decrement" ? action + "m" : action === "increment1" || action === "decrement1" ? action.slice(0, -1) : action : action;
      Background.setBadge(instance.tabId, action, true);
    }
  }

  /**
   * Updates the tab, sets the instance in the background, and sends a message to the popup with the instance.
   *
   * @param instance the instance for this tab
   * @private
   */
  function updateTab(instance) {
    // If Infy Scroll, send a message to the tab to concatenate the page, else if URLI update the tab normally
    if (instance.scrollEnabled) {
      chrome.tabs.sendMessage(instance.tabId, {greeting: "concatenatePage", instance: instance});
    } else {
      chrome.tabs.update(instance.tabId, {url: instance.url});
    }
    // Don't store Quick Instances (Instance is never enabled in quick mode)
    if (instance.enabled) {
      Background.setInstance(instance.tabId, instance);
    }
    chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
  }

  /**
   * Performs an increment or decrement action; if error skipping is enabled, delegates to another function.
   *
   * @param action   the action (increment or decrement)
   * @param instance the instance for this tab
   * @param items    the storage items
   * @private
   */
  function incrementDecrement(action, instance, items) {
    let actionPerformed = false;
    // If incrementDecrementEnabled (can't increment or decrement if no selection was found or not stepping thru the URLs array)
    if ((instance.selection !== "" && instance.selectionStart >= 0) || (instance.urls && instance.urls.length > 0)) {
      actionPerformed = true;
      // Error Skipping:
      if (instance.errorSkip > 0 && (instance.errorCodes && instance.errorCodes.length > 0) && items.permissionsEnhancedMode) {
        incrementDecrementErrorSkip(action, instance, instance.errorSkip);
      }
      // Regular:
      else {
        IncrementDecrement.incrementDecrement(action, instance);
        updateTab(instance);
      }
    }
    return actionPerformed;
  }

  /**
   * Performs an increment or decrement action with error skipping.
   *
   * @param action             the action to perform (increment or decrement)
   * @param instance           the instance containing the URL and parameters used to increment or decrement
   * @param errorSkipRemaining the number of times left to skip while performing this action
   * @param retrying           (optional) boolean indicating whether the fetch method was switched to retry the URL
   * @private
   */
  function incrementDecrementErrorSkip(action, instance, errorSkipRemaining, retrying) {
    console.log("incrementDecrementErrorSkip() - instance.fetchMethod=" + instance.fetchMethod + ", instance.errorCodes=" + instance.errorCodes + ", instance.errorCodesCustom=" + instance.errorCodesCustom  + ", errorSkipRemaining=" + errorSkipRemaining + ", retrying=" + retrying);
    let status,
        exception = false,
        redirected = false,
        error = false;
    // If the fetch method was just switched to GET, don't increment again to allow retrying with the same instance URL
    if (!retrying) {
      IncrementDecrement.incrementDecrement(action, instance);
    }
    if (errorSkipRemaining <= 0) {
      console.log("incrementDecrementErrorSkip() - exhausted the errorSkip attempts. aborting and updating tab");
      updateTab(instance);
      return;
    }
    // fetch using credentials: same-origin to keep session/cookie state alive (to avoid redirect false flags e.g. after a user logs in to a website)
    fetch(instance.url, { method: instance.fetchMethod, credentials: "same-origin" }).then(response => {
      status = response.status;
      redirected = response.redirected;
      if (response && response.status &&
        ((instance.errorCodes && (
          (instance.errorCodes.includes("404") && response.status === 404) ||
          // Note: 301,302,303,307,308 return response.status of 200 and must be checked by response.redirected
          (instance.errorCodes.includes("3XX") && ((response.status >= 300 && response.status <= 399) || response.redirected)) ||
          (instance.errorCodes.includes("4XX") && response.status >= 400 && response.status <= 499) ||
          (instance.errorCodes.includes("5XX") && response.status >= 500 && response.status <= 599))) ||
          (instance.errorCodes.includes("CUS") && instance.errorCodesCustom &&
          // response.status + "" because custom array stores string inputs
          (instance.errorCodesCustom.includes(response.status + "") || (response.redirected && ["301", "302", "303", "307", "308"].some(redcode => instance.errorCodesCustom.includes(redcode))))))) {
        console.log("incrementDecrementErrorSkip() - skipping this URL because response.status was in errorCodes or response.redirected, response.status=" + response.status + ", response.redirected=" + response.redirected + ", response.ok=" + response.ok);
        error = true;
      }
    }).catch(e => {
      console.log("incrementDecrementErrorSkip() - a fetch() exception was caught:" + e);
      if (instance.errorCodes.includes("EXC")) {
        exception = true;
      }
    }).finally(() => {
      // If the server disallows HEAD requests, switch to GET and retry this request using the same errorSkipRemaining
      if (status === 405 && instance.fetchMethod === "HEAD") {
        console.log("incrementDecrementErrorSkip() - switching fetch method from HEAD to GET and retrying because server disallows HEAD (status 405)");
        instance.fetchMethod = "GET";
        incrementDecrementErrorSkip(action, instance, errorSkipRemaining, true);
      } else if (!error && !exception) {
        console.log("incrementDecrementErrorSkip() - not attempting to skip this URL because response.status=" + status  + " and it was not in errorCodes. aborting and updating tab");
        updateTab(instance);
      } else {
        if (!instance.autoEnabled) {
          Background.setBadge(instance.tabId, "skip", true, exception ? "EXC" : redirected ? "RED" : status + "");
        }
        // Recursively call this method again to perform the action again and skip this URL, decrementing errorSkipRemaining
        incrementDecrementErrorSkip(action, instance, errorSkipRemaining - 1);
      }
    });
  }

  /**
   * Performs a next or prev action.
   *
   * @param action   the action (e.g. next or prev)
   * @param instance the instance for this tab
   * @private
   */
  function nextPrev(action, instance) {
    let actionPerformed = true;
    chrome.tabs.executeScript(instance.tabId, {file: "/js/next-prev.js", runAt: "document_end"}, function() {
      const code = "NextPrev.findNextPrevURL(" +
        JSON.stringify(action === "next" ? instance.nextPrevKeywordsNext : instance.nextPrevKeywordsPrev) + "," +
        JSON.stringify(instance.nextPrevLinksPriority) + ", " +
        JSON.stringify(instance.nextPrevSameDomainPolicy) + ", " +
        JSON.stringify(instance.domId) + ");";
      chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results) {
        if (results && results[0] && results[0].url) {
          instance.url = results[0].url;
          updateTab(instance);
        }
      });
    });
    return actionPerformed;
  }

  /**
   * Performs a clear action.
   *
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param items    the storage items
   * @private
   */
  function clear(caller, instance, items) {
    let actionPerformed = false;
    // Handle AUTO Repeat
    if (instance.autoEnabled && instance.autoRepeat && caller === "auto") {
      // Create a new deep copy of the instance for the repeat
      Auto.repeatAutoTimer(JSON.parse(JSON.stringify(instance)));
      return actionPerformed;
    }
    // Prevents a clear badge from displaying if there is no instance (e.g. in quick shortcuts mode)
    if (instance.enabled || instance.autoEnabled || instance.downloadEnabled) {
      actionPerformed = true;
    }
    Background.deleteInstance(instance.tabId);
    // If caller is not a manual clear by the user, don't remove key/mouse listeners or reset multi or delete save
    if (caller !== "popupClearBeforeSet" && caller !== "tabRemovedListener" && caller !== "auto") {
      if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
      }
      if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
      }
      // Infy Scroll: Remove scroll listener
      if (instance.scrollEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeScrollListener"});
      }
      // Don't delete saved URLs if the instance is also enabled
      if (!instance.enabled && instance.saveFound) {
        instance.saveFound = false;
        Saves.deleteSave(instance.url, "clear");
      }
    }
    if (instance.autoEnabled) {
      Auto.stopAutoTimer(instance, caller);
    }
    // For callers like popup that still need the instance, disable all states and reset auto, multi, and urls array
    instance.enabled = instance.multiEnabled = instance.downloadEnabled = instance.autoEnabled = instance.autoPaused = instance.autoRepeat = instance.shuffleURLs = false;
    instance.autoTimes = instance.autoTimesOriginal;
    instance.multi = {"1": {}, "2": {}, "3": {}};
    instance.multiCount = instance.autoRepeatCount = 0;
    instance.urls = [];
    if (caller !== "popupClearBeforeSet") {
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
    }
    return actionPerformed;
  }

  /**
   * Performs a return action, returning back to the instance's starting URL.
   *
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @private
   */
  function returnToStart(caller, instance) {
    let actionPerformed = false;
    if (instance.enabled && instance.startingURL) {
      actionPerformed = true;
      instance.url = instance.startingURL;
      instance.selection = instance.startingSelection;
      instance.selectionStart = instance.startingSelectionStart;
      // Multi
      if (instance.multiEnabled) {
        for (let i = 1; i <= instance.multiCount; i++) {
          instance.multi[i].selection = instance.multi[i].startingSelection;
          instance.multi[i].selectionStart = instance.multi[i].startingSelectionStart;
        }
      }
      // Auto
      if (instance.autoEnabled) {
        instance.autoRepeating = false;
        instance.autoTimes = instance.autoTimesOriginal;
      }
      // Array
      if (instance.urls && instance.urls.length > 0) {
        instance.urlsCurrentIndex = instance.startingURLsCurrentIndex;
        // Shuffle
        if (instance.shuffleURLs) {
          instance.urls = [];
          const precalculateProps = IncrementDecrementArray.precalculateURLs(instance);
          instance.urls = precalculateProps.urls;
          instance.urlsCurrentIndex = precalculateProps.currentIndex;
        }
      }
      updateTab(instance);
    }
    return actionPerformed;
  }

  /**
   * Performs a toolkit action. The instance's toolkit tool, action, quantity, and seconds (if crawling) are used.
   *
   * @param instance the instance for this tab
   * @private
   */
  function toolkit(instance) {
    let actionPerformed = true;
    switch (instance.toolkitTool) {
      case "crawl":
        // Firefox Android: chrome.windows not supported, so send message to existing Popup
        if (chrome.windows && chrome.windows.create) {
          chrome.windows.create({url: chrome.runtime.getURL("/html/popup.html"), type: "popup", width: 550, height: 550}, function(window) {
            instance.tabId = window.tabs[0].id;
            Background.setInstance(instance.tabId, instance);
          });
        } else {
          chrome.runtime.sendMessage({greeting: "crawlPopupNoWindow", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
        }
        break;
      case "tabs":
        toolkitTabs(0);
        function toolkitTabs(index) {
          if (index < instance.urls.length) {
            chrome.tabs.create({"url": instance.urls[index].urlmod, "active": false}, function() {
              setTimeout(function() { toolkitTabs(++index); }, instance.toolkitSeconds * 1000);
            });
          }
        }
        break;
    }
    return actionPerformed;
  }

  /**
   * Performs an auto action (the auto action is either a pause or resume only).
   *
   * @param instance the instance for this tab
   * @private
   */
  function auto(instance) {
    let actionPerformed = false;
    if (instance.autoEnabled) {
      Auto.pauseOrResumeAutoTimer(instance);
      // Get the updated pause or resume state set by auto
      instance = Background.getInstance(instance.tabId);
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
      actionPerformed = true;
    }
    return actionPerformed;
  }

  /**
   * Performs a download action.
   *
   * @param instance the instance for this tab
   * @param callback (optional) the function callback - only called by auto
   * @private
   */
  function download(instance, callback) {
    let actionPerformed = false;
    if (instance.downloadEnabled) {
      actionPerformed = true;
      chrome.tabs.executeScript(instance.tabId, {file: "/js/download.js", runAt: "document_end"}, function() {
        const code = "Download.findDownloadURLs(" +
          JSON.stringify(instance.downloadStrategy) + ", " +
          JSON.stringify(instance.downloadExtensions) + ", " +
          JSON.stringify(instance.downloadTags) + ", " +
          JSON.stringify(instance.downloadAttributes) + ", " +
          JSON.stringify(instance.downloadSelector) + ", " +
          JSON.stringify(instance.downloadIncludes) + ", " +
          JSON.stringify(instance.downloadExcludes) + ");";
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
          if (results && results[0]) {
            let downloads = results[0];
            // If this is the starting URL, handle the manually selected and unselected items the user specified
            if (instance.url === instance.startingURL) {
              // Selecteds: Add any selecteds to downloads
              if (instance.downloadMSelecteds && instance.downloadMSelecteds.length > 0) {
                downloads.push(...instance.downloadMSelecteds);
              }
              // Unselecteds: Remove any unselectds from downloads
              if (instance.downloadMUnselecteds && instance.downloadMUnselecteds.length > 0) {
                downloads = downloads.filter(function(download) {
                  return !instance.downloadMUnselecteds.some(function(munselected) {
                    return download.url === munselected.url;
                  });
                });
              }
            }
            for (const download of downloads) {
              console.log("download() - downloading url=" + download.url + " ... ");
              const params = instance.downloadSubfolder && download.filenameAndExtension && download.filename && download.extension ? { url: download.url, filename: instance.downloadSubfolder + "/" + download.filenameAndExtension } : { url: download.url};
              chrome.downloads.download(params, function(downloadId) {
                // Handle error if download subfolder and fileNameAndExtension is invalid by downloading in root folder
                if (chrome.runtime.lastError && instance.downloadSubfolder) {
                  chrome.downloads.download({url: download.url});
                }
              });
            }
          }
          // Subfolder Increment after downloads
          if (instance.downloadSubfolder && instance.downloadSubfolderIncrement) {
            instance.downloadSubfolder = instance.downloadSubfolder.replace(/\d+/, function(match) {
              const matchp1 = (Number(match) + 1) + "";
              return (match.startsWith("0") && match.length > matchp1.length ? ("0".repeat(match.length - matchp1.length)) : "") + matchp1;
            });
            Background.setInstance(instance.tabId, instance);
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

})();