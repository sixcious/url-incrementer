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
  let autoListenerAdded = false;

  /**
   * Starts the auto timer for the instance by doing all the necessary start-up work (convenience method).
   *
   * @param instance the instance to start an auto timer for
   * @param caller   the caller asking to start the auto timer
   * @public
   */
  function startAutoTimer(instance, caller) {
    // Firefox: Avoid dead object error by getting the instance from the Background instead of the Popup's argument
    if (caller === "popup") {
      instance = URLI.Background.getInstance(instance.tabId);
    }
    clearAutoTimeout(instance);
    setAutoTimeout(instance);
    addAutoListener();
    // Set starting badge with either normal "auto" badge or repeat badge if it has repeated at least 1 or more times
    if (instance.autoRepeatCount === 0) {
      URLI.Background.setBadge(instance.tabId, "auto", false);
    } else {
      URLI.Background.setBadge(instance.tabId, "autorepeat", false);
    }
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
      if (caller !== "popupClearBeforeSet" && !instance.autoRepeat) { // Don't do any badge setting if auto repeat is on
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
    const autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      if (!instance.autoPaused) {
        autoTimer.pause();
        instance.autoPaused = true;
        URLI.Background.setBadge(instance.tabId, "autopause", false);
      } else {
        autoTimer.resume();
        instance.autoPaused = false;
        if (instance.autoRepeating) { // The small window when the auto timer is repeating (REP), always show the autorepeat badge
          URLI.Background.setBadge(instance.tabId, "autorepeat", false);
        } else  if (instance.autoBadge === "times" && instance.autoTimes !== instance.autoTimesOriginal) { // We always use normal "auto" badge at start even if badge is times
          URLI.Background.setBadge(instance.tabId, "autotimes", false, instance.autoTimes + "");
        } else { // All other conditions, show the normal auto badge
          URLI.Background.setBadge(instance.tabId, "auto", false);
        }
      }
      URLI.Background.setInstance(instance.tabId, instance); // necessary: update instance.autoPaused boolean state
      autoTimers.set(instance.tabId, autoTimer); // necessary? update autoTimers paused state
    }
  }

  /**
   * TODO
   *
   * @param instance
   */
  function repeatAutoTimer(instance) {
    console.log("URLI.Auto.repeatAutoTimer() - repeating auto timer");
    instance.autoRepeating = true;
    instance.autoRepeatCount++;
    instance.autoTimes = instance.autoTimesOriginal;
    instance.url = instance.startingURL;
    instance.selection = instance.startingSelection;
    instance.selectionStart = instance.startingSelectionStart;
    const precalculateProps = URLI.IncrementDecrementArray.precalculateURLs(instance);
    instance.urls = precalculateProps.urls;
    instance.urlsCurrentIndex = precalculateProps.currentIndex;
    URLI.Background.setInstance(instance.tabId, instance);
    startAutoTimer(instance);
  }

  /**
   * Sets the instance's auto timeout and then performs the auto action after the time has elapsed.
   *
   * @param instance the instance's timeout to set
   * @private
   */
  function setAutoTimeout(instance) {
    const autoTimer = new URLI.AutoTimer(function() {
      if (instance.autoRepeating) {
        URLI.Action.performAction("return", "auto", instance);
      } else if (instance.downloadEnabled) {
        URLI.Action.performAction("download", "auto", instance, function(instance) {
          URLI.Action.performAction(instance.autoAction, "auto", instance);
        });
      } else {
        URLI.Action.performAction(instance.autoAction, "auto", instance);
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
    const autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      autoTimer.clear();
      autoTimers.delete(instance.tabId);
    }
  }

  /**
   * Sets the instance's auto timer wait state. This is used when the option "Wait for the page to fully load" is
   * checked. During the small window when the tab is still loading, this will not let pause/resume restart the timer.
   *
   * @param instance the instance's timeout to clear
   * @param wait     boolean indicating whether the timer should wait (true) or not wait (false)
   * @private
   */
  function setAutoWait(instance, wait) {
    const autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
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
    console.log("URLI.Auto.autoListener() - the chrome.tabs.onUpdated auto listener is on!");
    // Cache loading and complete for maybe a small performance gain since we need to check multiple times
    const loading = changeInfo.status === "loading",
          complete = changeInfo.status === "complete";
    // We only care about loading and complete statuses
    if (!loading && !complete) {
      return;
    }
    const instance = URLI.Background.getInstance(tabId);
    // If auto is enabled for this instance
    if (instance && instance.autoEnabled) {
      // Loading Only:
      if (loading) {
        // If autoWait is on, we set the wait boolean to true in case the user tries to pause/resume (e.g. start) the timeout while the tab is loading
        if (instance.autoWait) {
          setAutoWait(instance, true);
        }
        // Set the "AUTO" Browser Action Badge as soon as we can (loading). This needs to be done each time the tab is updated
        if (instance.autoPaused) {
          URLI.Background.setBadge(tabId, "autopause", false);
        } else if (instance.autoBadge === "times") {
          URLI.Background.setBadge(tabId, "autotimes", false, (instance.autoTimes) + "");
        } else {
          URLI.Background.setBadge(tabId, "auto", false);
        }
      }
      // Complete Only:
      if (complete) {
        // If download enabled, send a message to the popup to update the download preview (if it's open)
        // Note: Do NOT send this message at Loading because it doesn't refresh properly sometimes (even though the download script runs at document_end)
        if (instance.downloadEnabled) {
          chrome.runtime.sendMessage({greeting: "updatePopupDownloadPreview", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });
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
            URLI.Action.performAction("clear", "auto", instance);
          }
        }
        // If autoTimes is still greater than 0, set the auto timeout, else clear the instance
        // Note: Remember, the first time Auto is already done via Popup calling setAutoTimeout()
        else if (instance.autoTimes > 0) {
          clearAutoTimeout(instance); // Prevents adding multiple timeouts (e.g. if user manually navigated the auto tab)
          setAutoTimeout(instance);
        } else {
          // Note: clearing will clearAutoTimeout and removeAutoListener, so we don't have to do it here
          URLI.Action.performAction("clear", "auto", instance);
        }
      }
    } else if (complete) { // Else this isn't an auto instance tab, removes any stray auto listeners that may possibly exist
      removeAutoListener();
    }
  }

  // Return Public Functions
  return {
    startAutoTimer: startAutoTimer,
    stopAutoTimer: stopAutoTimer,
    pauseOrResumeAutoTimer: pauseOrResumeAutoTimer,
    repeatAutoTimer: repeatAutoTimer
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

  let timerId,
      start,
      remaining = delay,
      wait = false;

  this.pause = function() {
    clearTimeout(timerId);
    remaining -= Date.now() - start;
    remaining = remaining < 0 || wait ? delay : remaining;
    console.log("URLI.AutoTimer.pause() - timerId=" + timerId + " start=" + start + " delay=" + delay + " remaining=" + remaining + " wait=" + wait);
  };

  this.resume = function() {
    start = Date.now();
    clearTimeout(timerId);
    timerId = wait ? timerId : setTimeout(callback, remaining);
    console.log("URLI.AutoTimer.resume() - timerId=" + timerId + " start=" + start + " delay=" + delay + " remaining=" + remaining + " wait=" + wait);
  };

  this.clear = function() {
    clearTimeout(timerId);
  };

  this.setWait = function(wait_) {
    wait = wait_;
  };

  this.resume();
};