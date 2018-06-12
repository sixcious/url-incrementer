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
   * Clears the instance's auto timeout and deletes the auto timer from the map.
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
   * Sets the instance's auto timer wait. TODO Explain
   *
   * @param instance the instance's timeout to clear
   * @param wait     boolean indicating whether the timer should wait (true) or not wait (false)
   * @private
   */
  function setAutoWait(instance, wait) {
    var autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      autoTimer.setWait(wait);
      autoTimers.set(instance.tabId, autoTimer);
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
    // Cache loading and complete for maybe a small performance gain since we need to check multiple times?
    const loading = changeInfo.status === "loading",
          complete = changeInfo.status === "complete";
    // We only care about loading and complete statuses
    if (!loading && !complete) {
      return;
    }
    console.log("autoListener is on!");
    var instance = URLI.Background.getInstance(tabId);
    // If auto is enabled for this instance
    if (instance && instance.autoEnabled) {
      // Loading:
      if (loading) {
        // If autoWait is on, we set the wait boolean to true in case the user tries to pause/resume (e.g. start) the timeout while the tab is loading
        if (instance.autoWait) {
          setAutoWait(instance, true);
        }
        // Set the "AUTO" Browser Action Badge as soon as we can (loading). This needs to be done each time the tab is updated
        if (instance.autoPaused) {
          URLI.Background.setBadge(tabId, "autopause", false);
        }
        else if (instance.autoBadge === "times") {
          URLI.Background.setBadge(tabId, "autotimes", false, (instance.autoTimes) + "");
        } else {
          URLI.Background.setBadge(tabId, "auto", false);
        }
        // If download enabled, send a message to the popup to update the download preview (if it's open) even though we send it at loading, this script runs at document_end
        if (instance.downloadEnabled) {
          chrome.runtime.sendMessage({greeting: "updatePopupDownloadPreview", instance: instance});
        }
      }
      // AutoWait (Complete or Loading) :
      if (instance.autoWait ? complete : loading) {
        // If autoWait is on, we now set the wait boolean to false indicating a pause/resume (e.g. start) can start the timeout
        if (instance.autoWait) {
          setAutoWait(instance, false);
        }
        // If the auto instance was paused, this is almost considered a no-op
        if (instance.autoPaused) {
          // Clear the instance if auto is paused but the times count is at 0 or less (TODO: is this really needed, we need to treat paused differently?)
          if (instance.autoTimes <= 0) {
            URLI.Action.performAction(instance, "clear", "auto");
          }
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
    } else if (complete) { // Removes any stray auto listeners that may possibly exist
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
 * It also contains a "wait" state to keep it from setting a timeout before the page has fully loaded,
 * if the user checked the "Wait for the page to fully load" checkbox.
 * 
 * This function is based on code written by Tim Down @ stackoverflow.com.
 *
 * @param callback the function callback
 * @param delay    the delay for the timeout
 * @see https://stackoverflow.com/a/3969760
 */
URLI.AutoTimer = function (callback, delay) {

  var timerId, start, remaining = delay, wait = false;

  this.pause = function() {
    window.clearTimeout(timerId);
    remaining -= Date.now() - start;
    remaining = remaining < 0 || wait ? delay : remaining;
    console.log("AutoTimer.pause():");
    console.log("timerId=" + timerId + "start=" + start + " delay=" + delay + " remaining=" + remaining + " wait=" + wait + "\n\n"); //" proposedRemaining=" + proposedRemaining + "\n\n");
  };

  this.resume = function() {
    start = Date.now();
    window.clearTimeout(timerId);
    timerId = wait ? timerId : window.setTimeout(callback, remaining);
    console.log("AutoTimer.resume():");
    console.log("timerId=" + timerId + "start=" + start + " delay=" + delay + " remaining=" + remaining + " wait=" + wait + "\n\n");
  };

  this.clear = function() {
    window.clearTimeout(timerId);
  };

  this.setWait = function(wait_) {
    wait = wait_;
  };

  this.resume();
};