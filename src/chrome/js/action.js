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
    // Pre-Perform Action:
    // Handle Auto:
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
        if (changeInfo.status === "complete") { // Send this message at "complete" because it doesn't refresh properly at "loading" sometimes (even though the download script runs at document_end)
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
        actionPerformed = nextPrev(action, instance, items);
        break;
      case "clear":
        actionPerformed = clear(caller, instance, items, callback);
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
    // Post-Perform Action:
    // Icon Feedback if action was performed and other conditions are met (e.g. we don't show feedback if auto is enabled)
    if (items.iconFeedbackEnabled && actionPerformed && !(instance.autoEnabled || (caller === "auto" && instance.autoRepeat) || caller === "popupClearBeforeSet" || caller === "tabRemovedListener")) {
      // Reset Multi Action to the appropriate badge (increment becomes "incrementm", increment1 becomes "increment")
      action = instance.multiEnabled ? action === "increment" || action === "decrement" ? action + "m" : action === "increment1" || action === "decrement1" ? action.slice(0, -1) : action : action;
      Background.setBadge(instance.tabId, action, true);
    }
  }

  /**
   * Updates the tab, sets the instance in the background, and sends a message to the popup with the instance.
   *
   * @param instance
   * @private
   */
  function updateTab(instance) {
    chrome.tabs.update(instance.tabId, {url: instance.url});
    if (instance.enabled) { // Don't store Quick Instances (Instance is never enabled in quick mode)
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
      if ((instance.errorSkip > 0 && (instance.errorCodes && instance.errorCodes.length > 0) ||
          (instance.errorCodesCustomEnabled && instance.errorCodesCustom && instance.errorCodesCustom.length > 0)) &&
          (items.permissionsEnhancedMode)) {
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
   * @public
   */
  function incrementDecrementErrorSkip(action, instance, errorSkipRemaining) {
    console.log("incrementDecrementErrorSkip() - instance.errorCodes=" + instance.errorCodes +", instance.errorCodesCustomEnabled=" + instance.errorCodesCustomEnabled + ", instance.errorCodesCustom=" + instance.errorCodesCustom  + ", errorSkipRemaining=" + errorSkipRemaining);
    IncrementDecrement.incrementDecrement(action, instance);
    if (errorSkipRemaining > 0) {
      // fetch using credentials: same-origin to keep session/cookie state alive (to avoid redirect false flags e.g. after a user logs in to a website)
      // No need to check for CORS because we are running in the background in Enhanced Mode <all_urls> permissions)
      fetch(instance.url, { method: "HEAD", credentials: "same-origin" }).then(function(response) {
        if (response && response.status &&
          ((instance.errorCodes && (
            (instance.errorCodes.includes("404") && response.status === 404) ||
            (instance.errorCodes.includes("3XX") && ((response.status >= 300 && response.status <= 399) || response.redirected)) || // Note: 301,302,303,307,308 return response.status of 200 and must be checked by response.redirected
            (instance.errorCodes.includes("4XX") && response.status >= 400 && response.status <= 499) ||
            (instance.errorCodes.includes("5XX") && response.status >= 500 && response.status <= 599))) ||
            (instance.errorCodesCustomEnabled && instance.errorCodesCustom &&
              (instance.errorCodesCustom.includes(response.status + "") || (response.redirected && ["301", "302", "303", "307", "308"].some(redcode => instance.errorCodesCustom.includes(redcode))))))) { // response.status + "" because custom array stores string inputs
          console.log("incrementDecrementErrorSkip() - skipping this URL because response.status was in errorCodes or response.redirected, response.status=" + response.status + ", response.redirected=" + response.redirected + ", response.ok=" + response.ok);
          if (!instance.autoEnabled) {
            Background.setBadge(instance.tabId, "skip", true, response.redirected ? "RED" : response.status + "");
          }
          // Recursively call this method again to perform the action again and skip this URL, decrementing errorSkipRemaining
          incrementDecrementErrorSkip(action, instance, errorSkipRemaining - 1);
        } else {
          console.log("incrementDecrementErrorSkip() - not attempting to skip this URL because response.status=" + response.status  + " and it was not in errorCodes. aborting and updating tab");
          updateTab(instance);
        }
      }).catch(e => {
        console.log("incrementDecrementErrorSkip() - a fetch() exception was caught:" + e);
        if (!instance.autoEnabled) {
          Background.setBadge(instance.tabId, "skip", true, "ERR");
        }
        // Recursively call this method again to perform the action again and skip this URL, decrementing errorSkipRemaining
        incrementDecrementErrorSkip(action, instance, errorSkipRemaining - 1);
      });
    } else {
      console.log("incrementDecrementErrorSkip() - exhausted the errorSkip attempts. aborting and updating tab ");
      updateTab(instance);
    }
  }

  /**
   * Performs a next or prev action.
   *
   * @param action   the action (e.g. next or prev)
   * @param instance the instance for this tab
   * @param items    the storage items
   * @private
   */
  function nextPrev(action, instance, items) {
    let actionPerformed = true;
    chrome.tabs.executeScript(instance.tabId, {file: "/js/next-prev.js", runAt: "document_end"}, function() {
      const code = "NextPrev.findNextPrevURL(" +
        JSON.stringify(action === "next" ? items.nextPrevKeywordsNext : items.nextPrevKeywordsPrev) + "," +
        JSON.stringify(items.nextPrevLinksPriority) + ", " +
        JSON.stringify(items.nextPrevSameDomainPolicy) + ");";
      chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results) {
        if (results && results[0]) {
          instance.url = results[0];
          // TODO...
          // Set saves next prev instances that are auto enabled in updateTab()
          // instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")
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
   * @param callback the function callback (optional) - called by popup clear before set
   * @private
   */
  function clear(caller, instance, items, callback) {
    let actionPerformed = false;
    // Handle AUTO Repeat
    if (instance.autoEnabled && instance.autoRepeat && caller === "auto") {
      Auto.repeatAutoTimer(JSON.parse(JSON.stringify(instance))); // Create a new deep copy of the instance for the repeat
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
      if (!instance.enabled && instance.saveFound) { // Don't delete saved URLs if the instance is also enabled
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
    if (callback) {
      callback(instance);
    } else {
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
      instance.urlsCurrentIndex = instance.startingURLsCurrentIndex;
      // Multi:
      if (instance.multiEnabled) {
        for (let i = 1; i <= instance.multiCount; i++) {
          instance.multi[i].selection = instance.multi[i].startingSelection;
          instance.multi[i].selectionStart = instance.multi[i].startingSelectionStart;
        }
      }
      // Auto:
      instance.autoRepeating = false;
      instance.autoTimes = instance.autoTimesOriginal;
      // Array:
      instance.urls = [];
      const precalculateProps = IncrementDecrementArray.precalculateURLs(instance);
      instance.urls = precalculateProps.urls;
      instance.urlsCurrentIndex = precalculateProps.currentIndex;
      updateTab(instance);
    }
    return actionPerformed;
  }

  /**
   * Performs a toolkit action. The instance's toolkit tool, action, and quantity are used.
   *
   * @param instance the instance for this tab
   * @private
   */
  function toolkit(instance) {
    let actionPerformed = true;
    switch (instance.toolkitTool) {
      case "crawl":
        if (chrome.windows && chrome.windows.create) { // Firefox Android: chrome.windows not supported
          chrome.windows.create({url: chrome.runtime.getURL("/html/popup.html"), type: "popup", width: 550, height: 550}, function(window) {
            instance.tabId = window.tabs[0].id;
            Background.setInstance(instance.tabId, instance);
          });
        } else {
          chrome.runtime.sendMessage({greeting: "crawlPopupNoWindow", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
        }
        break;
      case "tabs":
        for (const url of instance.urls) {
          chrome.tabs.create({"url": url.urlmod, "active": false});
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
      instance = Background.getInstance(instance.tabId); // Get the updated pause or resume state set by auto
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
                if (chrome.runtime.lastError && instance.downloadSubfolder) {
                  chrome.downloads.download({url: download.url});
                }
              });
            }
          }
          // Subfolder Increment after downloads
          if (instance.downloadSubfolder) {
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