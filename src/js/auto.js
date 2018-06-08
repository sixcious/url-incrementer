/**
 * URL Incrementer Auto
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Auto = function () {

  // The instance auto timers in Background memory
  // Note: We have a separate map to store all the instances' auto timers instead of storing each auto timer in the
  // instance itself because the AutoTimer is a function and can't be JSON parsed/stringified
  const autoTimers = new Map();

  // A boolean flag indicating if we have added the tabs.on.updated autoListener (to prevent adding multiple listeners)
  var autoListenerAdded = false;

  /**
   * Starts the auto timer for the instance by doing all the necessary start-up work (convenience method).
   *
   * @param instance the instance to start an auto timer for
   * @public
   */
  function startAutoTimer(instance) {
    clearAutoTimeout(instance);
    setAutoTimeout(instance);
    addAutoListener();
    URLI.Background.setBadge(instance.tabId, "auto", false);
  }

  /**
   * Stops the auto timer for the instance by doing all the necessary stopping work (convenience method).
   *
   * @param instance the instance's auto timer to stop
   * @param caller   the caller asking to stop the auto timer (to determine how to set the badge)
   * @public
   */
  function stopAutoTimer(instance, caller) {
    clearAutoTimeout(instance);
    removeAutoListener();
    // Don't need to set the badge if the tab is being removed
    if (caller !== "tabRemovedListener") {
      // Don't set the clear badge if popup is just updating the instance (ruins auto badge if auto is re-set)
      if (caller !== "popupClearBeforeSet") {
        URLI.Background.setBadge(instance.tabId, "clear", true);
      } else {
        URLI.Background.setBadge(instance.tabId, "default", false);
      }
    }
  }

  /**
   * Pauses or resumes the instance's auto timer. If the instance is paused, it resumes or vice versa.
   *
   * @param instance the instance's auto timer to pause or resume
   * @public
   */
  function pauseOrResumeAutoTimer(instance) {
    var autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      if (!instance.autoPaused) {
        autoTimer.pause();
        instance.autoPaused = true;
        URLI.Background.setBadge(instance.tabId, "autopause", false);
      } else {
        autoTimer.resume();
        instance.autoPaused = false;
        if (instance.autoBadge === "times") {
          URLI.Background.setBadge(instance.tabId, "autotimes", false, instance.autoTimes + "");
        } else {
          URLI.Background.setBadge(instance.tabId, "auto", false);
        }
      }
      URLI.Background.setInstance(instance.tabId, instance); // necessary: update instance.autoPaused boolean state
      autoTimers.set(instance.tabId, autoTimer); // necessary? update autoTimers paused state
    }
  }
  /**
   * Sets the instance's auto timeout and then performs the auto action after the time has elapsed.
   *
   * @param instance the instance's timeout to set
   * @private
   */
  function setAutoTimeout(instance) {
    var autoTimer = new URLI.AutoTimer(function() {
      if (instance.downloadEnabled) {
        URLI.Action.performAction(instance, "download", "auto", function(instance) {
          URLI.Action.performAction(instance, instance.autoAction, "auto");
        });
      } else {
        URLI.Action.performAction(instance, instance.autoAction, "auto");
      }
    }, instance.autoSeconds * 1000);
    autoTimers.set(instance.tabId, autoTimer);
  }

  /**
   * Clears the instance's auto timeout. This is called when the user manually intervenes
   * and tries clearing the instance (e.g. clicking the popup UI clear button or via
   * a shortcut command) or naturally when the autoTimes count reaches 0 and the instance gets deleted.
   *
   * @param instance the instance's timeout to clear
   * @private
   */
  function clearAutoTimeout(instance) {
    var autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      autoTimer.clear();
      autoTimers.delete(instance.tabId);
    }
  }


  /**
   * Adds the auto listener (only if there isn't one already).
   *
   * @private
   */
  function addAutoListener() {
    if (!autoListenerAdded) {
      chrome.tabs.onUpdated.addListener(autoListener);
      autoListenerAdded = true;
    }
  }

  /**
   * Removes the auto listener (only if there isn't any other instance that still has auto enabled).
   *
   * @private
   */
  function removeAutoListener() {
    if (![...URLI.Background.getInstances().values()].some(instance => instance && instance.autoEnabled)) {
      chrome.tabs.onUpdated.removeListener(autoListener);
      autoListenerAdded = false;
    }
  }

  /**
   * The chrome.tabs.onUpdated auto listener that fires every time a tab is updated.
   * Decides whether or not to set the autoTimeout based on the instance's current properties.
   * Also decides when it is time to delete the instance when the auto times count has reached 0.
   *
   * @param tabId      the tab ID
   * @param changeInfo the status (either complete or loading)
   * @param tab        the tab object
   * @private
   */
  function autoListener(tabId, changeInfo, tab) {
    // We only care about loading and complete statuses
    if (changeInfo.status !== "loading" && changeInfo.status !== "complete") {
      return;
    }
    console.log("autoListener is on!");
    var instance = URLI.Background.getInstance(tabId);
    // If auto is enabled for this instance
    if (instance && instance.autoEnabled) {
      // Set the "AUTO" Browser Action Badge as soon as we can (loading). This needs to be done each time the tab is updated
      if (changeInfo.status === "loading") {
        if (instance.autoPaused) {
          URLI.Background.setBadge(tabId, "autopause", false);
        }
        else if (instance.autoBadge === "times") {
          URLI.Background.setBadge(tabId, "autotimes", false, (instance.autoTimes) + "");
        } else {
          URLI.Background.setBadge(tabId, "auto", false);
        }
      }
      // If download enabled, send a message to the popup to update the download preview (if it's open)
      if (changeInfo.status === "complete" && instance.downloadEnabled) {
        chrome.runtime.sendMessage({greeting: "updatePopupDownloadPreview", instance: instance});
      }
     // If the auto instance was paused, this is a no-op. Otherwise, we set the new timeout or clear if times has been exhausted
      if (instance.autoWait ? changeInfo.status === "complete" : changeInfo.status === "loading") {
        if (instance.autoPaused) {
          // TODO
        }
        // If autoTimes is still greater than 0, set the auto timeout, else clear the instance
        // Note: Remember, the first time Auto is already done via Popup calling setAutoTimeout()
        else if (instance.autoTimes > 0) {
          clearAutoTimeout(instance); // Prevents adding multiple timeouts (e.g. if user manually navigated the auto tab)
          setAutoTimeout(instance);
        } else {
          // Note: clearing will clearAutoTimeout and removeAutoListener, so we don't have to do it here
          URLI.Action.performAction(instance, "clear", "auto");
        }
      }
    } else if (changeInfo.status === "complete") { // Removes any stray auto listeners that may possibly exist
      removeAutoListener();
    }
  }

  // Return Public Functions
  return {
    startAutoTimer: startAutoTimer,
    stopAutoTimer: stopAutoTimer,
    pauseOrResumeAutoTimer: pauseOrResumeAutoTimer
  };
}();

/**
 * The AutoTimer that contains the internal setTimeout with pause and resume capabilities.
 * This function is based on code written by Tim Down @ stackoverflow.com.
 *
 * @param callback the function callback
 * @param delay    the delay for the timeout
 * @see https://stackoverflow.com/a/3969760
 */
URLI.AutoTimer = function (callback, delay) {

  var timerId, start, remaining = delay;

  this.pause = function() {
    window.clearTimeout(timerId);
    remaining -= Date.now() - start;
  };

  this.resume = function() {
    start = Date.now();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, remaining);
  };

  this.clear = function() {
    window.clearTimeout(timerId);
  };

  this.resume();
};