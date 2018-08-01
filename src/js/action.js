/**
 * URL Incrementer Action
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Action = function () {

  /**
   * Performs an action.
   *
   * @param action   the action (e.g. increment or decrement)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @public
   */
  function performAction(action, caller, instance, callback) {
    console.log("URLI.Action.performAction() - action=" + action + ", caller=" + caller + ", instance=" + instance);
    const items = URLI.Background.getItems();
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
        console.log("URLI.Action.performAction() - auto rare race condition encountered, about to clear. instance.autoTimes=" + instance.autoTimes);
        actionPerformed = clear(action, caller, instance, callback);
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
      case "increment2":
      case "decrement2":
      case "increment3":
      case "decrement3":
        if ((instance.errorSkip > 0 && (instance.errorCodes && instance.errorCodes.length > 0) || (instance.errorCodesCustomEnabled && instance.errorCodesCustom && instance.errorCodesCustom.length > 0)) && (!(caller === "popupClickActionButton" || caller === "auto" || caller === "externalExtension") || items.permissionsEnhancedMode)) {
          actionPerformed = incrementDecrementSkipErrors(action, caller, instance, callback);
        } else {
          actionPerformed = instance.multi > 0 ? incrementDecrementMulti(action, caller, instance, callback) : incrementDecrement(action, caller, instance, callback);
        }
        break;
      case "next":
      case "prev":
        actionPerformed = nextPrev(action, caller, instance, callback);
        break;
      case "clear":
        actionPerformed = clear(action, caller, instance, callback);
        break;
      case "return":
        actionPerformed = returnToStart(action, caller, instance, callback);
        break;
      case "toolkit":
        actionPerformed = toolkit(action, caller, instance, callback);
        break;
      case "auto": // the auto action is always a pause or resume
        actionPerformed = auto(action, caller, instance, callback);
        break;
      case "download":
        actionPerformed = download(action, caller, instance, callback);
        break;
      default:
        break;
    }
    // Icon Feedback if action was performed and other conditions are met (e.g. we don't show feedback if auto is enabled)
    if (actionPerformed && !(instance.autoEnabled || (caller === "auto" && instance.autoRepeat) || caller === "popupClearBeforeSet" || caller === "tabRemovedListener")) {
      if (items.iconFeedbackEnabled) {
        console.log("URLI.Action.performAction() - setting badge action=" + action +", caller=" + caller + "instance.autoRepeat=" + instance.autoRepeat);
        URLI.Background.setBadge(instance.tabId, action, true);
      }
    }
  }

  /**
   * Performs an increment or decrement action.
   *
   * @param action   the action (increment or decrement)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function incrementDecrement(action, caller, instance, callback) {
    let actionPerformed = false;
    // If URLI didn't find a selection, we can't increment or decrement
    if (instance.customURLs || (instance.selection !== "" && instance.selectionStart >= 0)) {
      actionPerformed = true;
      let urlProps;
      // If Custom URLs or Shuffle URLs, use the urls array to increment or decrement, don't call IncrementDecrement.modifyURL
      if ((instance.customURLs || instance.shuffleURLs) && instance.urls && instance.urls.length > 0) {
        console.log("URLI.Action.incrementDecrement() - performing increment/decrement on the urls array...");
        const urlsLength = instance.urls.length;
        console.log("URLI.Action.incrementDecrement() - action === instance.autoAction=" + (action === instance.autoAction) + ", action=" + action);
        console.log("URLI.Action.incrementDecrement() - instance.urlsCurrentIndex + 1 < urlsLength=" + (instance.urlsCurrentIndex + 1 < urlsLength) +", instance.urlsCurrentIndex=" + instance.urlsCurrentIndex + ", urlsLength=" + urlsLength);
        urlProps =
          (!instance.autoEnabled && action === "increment") || (action === instance.autoAction) ?
            instance.urls[instance.urlsCurrentIndex + 1 < urlsLength ? !instance.autoEnabled || instance.customURLs ? ++instance.urlsCurrentIndex : instance.urlsCurrentIndex++ : urlsLength - 1] :
            instance.urls[instance.urlsCurrentIndex - 1 >= 0 ? !instance.autoEnabled ? --instance.urlsCurrentIndex : instance.urlsCurrentIndex-- : 0];
      } else {
        console.log("URLI.Action.incrementDecrement() - performing increment/decrement via modifyURL...");
        urlProps = URLI.IncrementDecrement.modifyURL(action, instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros);
      }
      instance.url = urlProps.urlmod;
      instance.selection = urlProps.selectionmod;
      chrome.tabs.update(instance.tabId, {url: instance.url});

      instance.enabled = true;
      URLI.Background.setInstance(instance.tabId, instance);
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
      // if (instance.enabled || instance.customURLs || instance.shuffleURLs) { // Don't store Quick Instances (Instance is never enabled in quick mode)
      //   URLI.Background.setInstance(instance.tabId, instance);
      // }

    }
    return actionPerformed;
  }

  /**
   * Performs an increment or decrement action while also skipping errors.
   *
   * @param action   the action (increment or decrement)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function incrementDecrementSkipErrors(action, caller, instance, callback) {
    let actionPerformed = false;
    // If URLI didn't find a selection, we can't increment or decrement
    if (instance.selection !== "" && instance.selectionStart >= 0) {
      actionPerformed = true;
      console.log("URLI.Action.incrementDecrementSkipErrors() - performing error skipping, about to execute increment-decrement.js script...");
      chrome.tabs.executeScript(instance.tabId, {
        file: "/js/increment-decrement.js",
        runAt: "document_start"
      }, function () {
        // This covers a very rare case where the user might be trying to increment the domain and where we lose permissions to execute the script. Fallback to doing a normal increment/decrement operation
        if (chrome.runtime.lastError) {
          console.log("URLI.Action.incrementDecrementSkipErrors() - chrome.runtime.lastError.message:" + chrome.runtime.lastError.message);
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

// TODO
  function incrementDecrementMulti(action, caller, instance, callback) {
    console.log("URLI.Action.incrementDecrementMulti() - performing action=" + action + ", instance.multi=" + instance.multi);
    let actionPerformed = false;
    if (instance.multi >= 1 && instance.multi <= 3) {
      actionPerformed = true;
      const match = /\d+/.exec(action),
            part = match ? match : "1"; // "increment" action without a number is "increment1"
      let urlProps;
      if (action.startsWith("increment")) {
        urlProps = URLI.IncrementDecrement.modifyURL("increment", instance.url, instance["selection" + part], instance["selectionStart" + part], instance["interval" + part], instance["base" + part], instance["baseCase" + part], instance["leadingZeros" + part]);
      } else if (action.startsWith("decrement")) {
        urlProps = URLI.IncrementDecrement.modifyURL("decrement", instance.url, instance["selection" + part], instance["selectionStart" + part], instance["interval" + part], instance["base" + part], instance["baseCase" + part], instance["leadingZeros" + part]);
      }
      if (instance.url.length !== urlProps.urlmod.length && instance.multi > 1) {
        const urlLengthDiff = instance.url.length - urlProps.urlmod.length; // positive need to subtract, negative need to add
        const thisPartSelectionStart = instance["selectionStart" + part];
        console.log("URLI.Background.incrementDecrementMulti() - part=" + part + ", urlLengthDiff=" + urlLengthDiff + "thisPartSelectionStart=" + thisPartSelectionStart);
        // if this part isn't the last part, we need to adjust the selectionStarts of the other later parts
        for (let i = 1; i <= instance.multi; i++) {
          if (i !== part && instance["selectionStart" + i] > thisPartSelectionStart) {
            console.log("instance[\"selectionStart\" + i]" + instance["selectionStart" + i]);
            console.log("urlLengthDiff=" + urlLengthDiff);
            console.log("urlLengthDiff < 0=" + (urlLengthDiff < 0));
            instance["selectionStart" + i] = instance["selectionStart" + i] - urlLengthDiff;
            console.log("selectionStart" + i + " changed");
            console.log("instance[\"selectionStart\" + i]" + instance["selectionStart" + i]);
          }
        }
      }
      instance.url = urlProps.urlmod;
      instance["selection" + part] = urlProps.selectionmod;
      chrome.tabs.update(instance.tabId, {url: instance.url});
      if (instance.enabled || instance.customURLs || instance.shuffleURLs) { // Don't store Quick Instances (Instance is never enabled in quick mode)
        URLI.Background.setInstance(instance.tabId, instance);
      }
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
    }
    return actionPerformed;
  }

  /**
   * Performs a next or prev action.
   *
   * @param action   the action (e.g. next or prev)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function nextPrev(action, caller, instance, callback) {
    let actionPerformed = true;
    const items = URLI.Background.getItems();
    chrome.tabs.executeScript(instance.tabId, {file: "/js/next-prev.js", runAt: "document_end"}, function() {
      const code = "URLI.NextPrev.findNextPrevURL(" +
        JSON.stringify(action) + ", " +
        JSON.stringify(action === "next" ? items.nextPrevKeywordsNext : items.nextPrevKeywordsPrev) + "," +
        JSON.stringify(items.nextPrevLinksPriority) + ", " +
        JSON.parse(items.nextPrevSameDomainPolicy) + ");";
      chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results) {
        if (results && results[0]) {
          const url = results[0];
          chrome.tabs.update(instance.tabId, {url: url});
          if (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) {
            console.log("URLI.Action.nextPrev() - setting instance in background");
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
   * @param action   the action (clear)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function clear(action, caller, instance, callback) {
    let actionPerformed = false;
    // Prevents a clear badge from displaying if there is no instance (e.g. in quick shortcuts mode)
    if (instance.enabled || instance.autoEnabled || instance.downloadEnabled) {
      actionPerformed = true;
    }
    URLI.Background.deleteInstance(instance.tabId);
    if (caller !== "popupClearBeforeSet") { // Don't reset multi or remove key/mouse listeners if popup clear before set
      instance.multi = 0;
      const items = URLI.Background.getItems();
      if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
      }
      if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
      }
      if (instance.profileFound && caller !== "tabRemovedListener" && caller !== "auto") { // Don't delete saved URLs if the tab is simply being removed or auto clearing
        instance.profileFound = false;
        deleteProfileByInstance(instance);
      }
    }
    if (instance.autoEnabled) {
      URLI.Auto.stopAutoTimer(instance, caller);
    }
    // Handle AUTO Repeat
    if (instance.autoEnabled && instance.autoRepeat && caller === "auto") {
      URLI.Auto.repeatAutoTimer(JSON.parse(JSON.stringify(instance))); // Create a new deep copy of the instance for the repeat
    }
    // for callers like popup that still need the instance, disable all states and reset autoTimes
    else {
      instance.enabled = instance.downloadEnabled = instance.autoEnabled = instance.autoPaused = false;
      instance.autoTimes = instance.autoTimesOriginal;
      if (callback) {
        callback(instance);
      } else {
        chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
      }
    }
    return actionPerformed;
  }

  /**
   * Performs a return action, returning back to the instance's starting URL.
   *
   * @param action   the action (toolkit)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function returnToStart(action, caller, instance, callback) {
    let actionPerformed = false;
    if (instance.startingURL) {
      actionPerformed = true;
      // TODO: Deal with auto
      if (caller === "auto") {
        instance.autoRepeating = false;
      }
      // instance.autoTimes = instance.autoTimesOriginal;
      instance.url = instance.startingURL;
      instance.selection = instance.startingSelection;
      instance.selectionStart = instance.startingSelectionStart;
      // Multi:
      if (instance.multi && instance.multi > 1) {
        for (let i = 1; i <= instance.multi; i++) {
          instance["selection" + i] = instance["startingSelection" + i];
          instance["selectionStart" + i] = instance["startingSelectionStart" + i];
        }
      }
      // URLs Array:
      if (instance.urls && instance.startingURLsCurrentIndex) {
        instance.urlsCurrentIndex = instance.startingURLsCurrentIndex;
      }
      chrome.tabs.update(instance.tabId, {url: instance.startingURL});
      URLI.Background.setInstance(instance.tabId, instance);
      chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance});
    }
    return actionPerformed;
  }

  /**
   * Performs a toolkit action. The instance's toolkit tool, action, and quantity are used.
   *
   * @param action   the action (toolkit)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function toolkit(action, caller, instance, callback) {
    let actionPerformed = false;
    // If URLI didn't find a selection, we can't increment or decrement
    if (instance.selection !== "" && instance.selectionStart >= 0) {
      switch (instance.toolkitTool) {
        case "open-tabs": {
          //const urls = URLI.IncrementDecrement.precalculateURLs(instance).urls;
          for (let url of instance.urls) {
            chrome.tabs.create({"url": url.urlmod, "active": false});
          }
          actionPerformed = true;
          break;
        }
        case "generate-links": {
          //const urls = URLI.IncrementDecrement.precalculateURLs(instance).urls;
          chrome.runtime.sendMessage({greeting: "updatePopupToolkitGenerateURLs", instance: instance});
          actionPerformed = true;
          break;
        }
        default:
          break;
      }
    }
    return actionPerformed;
  }

  /**
   * Performs an auto action (pause or resume only).
   *
   * @param action   the action (auto pause/resume)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function auto(action, caller, instance, callback) {
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
   * @param action   the action (download)
   * @param caller   String indicating who called this function (e.g. command, popup, content script)
   * @param instance the instance for this tab
   * @param callback the function callback (optional)
   * @private
   */
  function download(action, caller, instance, callback) {
    let actionPerformed = false;
    if (instance.downloadEnabled) {
      actionPerformed = true;
      chrome.tabs.executeScript(instance.tabId, {file: "/js/download.js", runAt: "document_end"}, function() {
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
              console.log("URLI.Action.download() - downloading url=" + download.url + " ... ");
              const params = download.filename && download.extension ? {url: download.url, filename: "folder/" + download.filename} : {url: download.url};
              chrome.downloads.download(params, function(downloadId) {
                if (chrome.runtime.lastError) {
                  chrome.downloads.download({url: download.url});
                }
                chrome.downloads.search({id: downloadId}, function(results) {
                  const downloadItem = results ? results[0] : undefined;
                  if (downloadItem) {
                    const bytesInAMegabyte = 1048576;
                    if (downloadItem.totalBytes > 0 && (
                        (!isNaN(instance.downloadMinMB) && instance.downloadMinMB > 0 ? (instance.downloadMinMB * bytesInAMegabyte) > downloadItem.totalBytes : false) ||
                        (!isNaN(instance.downloadMaxMB) && instance.downloadMaxMB > 0 ? (instance.downloadMaxMB * bytesInAMegabyte) < downloadItem.totalBytes : false)
                      )) {
                      console.log("URLI.Action.download() - canceling download because downloadItem.totalbytes=" + downloadItem.totalBytes + " and instance.MinMB bytes=" + (instance.downloadMinMB * bytesInAMegabyte) + " or instance.MaxMB bytes=" + (instance.downloadMaxMB * bytesInAMegabyte));
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

  // TODO
  function deleteProfileByInstance(instance) {
    const url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length);
    chrome.storage.local.get(null, async function(localItems) {
      const profiles = localItems.profiles;
      if (profiles && profiles.length > 0) {
        for (let i = 0; i < profiles.length; i++) {
          const urlhash1 = await URLI.Encryption.calculateHash(url1, profiles[i].urlsalt1);
          const urlhash2 = await URLI.Encryption.calculateHash(url2, profiles[i].urlsalt2);
          if (profiles[i].urlhash1 === urlhash1 && profiles[i].urlhash2 === urlhash2) {
            console.log("URLI.Action.deleteProfile() - deleting URL url=" + instance.url + ", with urlhash1=" + profiles[i].urlhash1);
            profiles.splice(i, 1);
            chrome.storage.local.set({
              profiles: profiles
            }, function() {
              // populateValuesFromStorage("profiles");
            });
            break;
          }
        }
      }
    });
  }

  // Return Public Functions
  return {
    performAction: performAction
  };
}();