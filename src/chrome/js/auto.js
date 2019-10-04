/**
 * URL Incrementer
 * @file auto.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Auto = (() => {

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
      instance = Background.getInstance(instance.tabId);
    }
    clearAutoTimeout(instance);
    setAutoTimeout(instance);
    addAutoListener();
    // Set starting badge with either normal "auto" badge or repeat badge if it has repeated at least 1 or more times
    if (instance.autoRepeatCount === 0 || instance.autoBadge === "") {
      Background.setBadge(instance.tabId, "auto", false);
    } else {
      Background.setBadge(instance.tabId, "autorepeat", false);
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
      // Don't set the clear badge if popup is just updating the instance (ruins auto badge if auto is re-set) or any badge setting if auto repeat is on
      if (caller !== "popupClearBeforeSet" && !instance.autoRepeat) {
        Background.setBadge(instance.tabId, "clear", true);
      } else {
        Background.setBadge(instance.tabId, "default", false);
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
        Background.setBadge(instance.tabId, "autopause", false);
      } else {
        autoTimer.resume();
        instance.autoPaused = false;
        // The small window when the auto timer is repeating (REP), show repeat badge if it's times
        if (instance.autoBadge === "times" && instance.autoRepeating) {
          Background.setBadge(instance.tabId, "autorepeat", false);
        } else if (instance.autoBadge === "times" && instance.autoTimes !== instance.autoTimesOriginal) {
          // We always use normal "auto" badge at start even if badge is times
          Background.setBadge(instance.tabId, "autotimes", false, instance.autoTimes + "");
        } else {
          // All other conditions, show the normal auto badge
          Background.setBadge(instance.tabId, "auto", false);
        }
      }
      // Update instance.autoPaused boolean state (This is necessary)
      Background.setInstance(instance.tabId, instance);
      // Update autoTimers paused state (Is this necessary?)
      autoTimers.set(instance.tabId, autoTimer);
    }
  }

  /**
   * Repeats the instance's auto timer.
   *
   * Auto Repeat Workflow:
   * 1. Action.clear() calls Auto.repeatAutoTimer() with a new deep copy of the instance
   * 2. Auto.repeatAutoTimer() sets autoRepeating to true, sets the instance in Background, calls Auto.startAutoTimer()
   * 3. Auto.startAutoTimer() calls Auto.setTimeout()
   * 4. Auto.setTimeout() because autoRepeating is true calls Action.returnToStart()
   * 5. Action.returnToStart() sets autoRepeating to false, resets all the instance properties (including multi, array)
   *
   * @param instance the instance's auto timer to repeat
   * @public
   */
  function repeatAutoTimer(instance) {
    console.log("repeatAutoTimer() - repeating auto timer");
    instance.autoRepeating = true;
    instance.autoRepeatCount++;
    Background.setInstance(instance.tabId, instance);
    startAutoTimer(instance);
  }

  /**
   * Sets the instance's auto timeout and then performs the auto action after the time has elapsed.
   *
   * @param instance the instance's timeout to set
   * @private
   */
  function setAutoTimeout(instance) {
    const autoTimer = new AutoTimer(async function() {
      const items = await Promisify.getItems();
      if (instance.autoRepeating) {
        Action.performAction("return", "auto", instance, items);
      } else if (instance.downloadEnabled) {
        Action.performAction("download", "auto", instance, items, function(instance) {
          Action.performAction(instance.autoAction, "auto", instance, items);
        });
      } else {
        Action.performAction(instance.autoAction, "auto", instance, items);
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
   * Removes the auto listener (only if there isn't any instance that still has auto enabled).
   *
   * @private
   */
  function removeAutoListener() {
    if (![...Background.getInstances().values()].some(instance => instance && instance.autoEnabled)) {
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
    console.log("autoListener() - the chrome.tabs.onUpdated auto listener is on!, changeInfo.status=" + changeInfo.status);
    // Cache loading and complete for maybe a small performance gain since we need to check multiple times
    const loading = changeInfo.status === "loading";
    const complete = changeInfo.status === "complete";
    // We only care about loading and complete statuses
    if (!loading && !complete) {
      return;
    }
    const instance = Background.getInstance(tabId);
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
          Background.setBadge(tabId, "autopause", false);
        } else if (instance.autoBadge === "times") {
          Background.setBadge(tabId, "autotimes", false, (instance.autoTimes) + "");
        } else {
          Background.setBadge(tabId, "auto", false);
        }
      }
      // AutoWait (Complete or Loading):
      if (instance.autoWait ? complete : loading) {
        // If autoWait is on, we now set the wait boolean to false indicating a pause/resume (e.g. start) can start the timeout
        if (instance.autoWait) {
          setAutoWait(instance, false);
        }
        // If the auto instance was paused, this is almost considered a no-op
        if (instance.autoPaused) {
          // Clear the instance if auto is paused but the times count is at 0 or less (TODO: is this really needed, we need to treat paused differently?)
          if (instance.autoTimes <= 0) {
            Action.performAction("clear", "auto", instance);
          }
        }
        // If autoTimes is still greater than 0, set the auto timeout, else clear the instance
        // Note: Remember, the first time Auto is already done via Popup calling setAutoTimeout()
        else if (instance.autoTimes > 0) {
          // Clearing first prevents adding multiple timeouts (e.g. if user manually navigated the auto tab)
          clearAutoTimeout(instance);
          setAutoTimeout(instance);
        } else {
          // Note: clearing will clearAutoTimeout and removeAutoListener, so we don't have to do it here
          Action.performAction("clear", "auto", instance);
        }
      }
    } else if (complete) {
      // Else this isn't an auto instance tab, removes any stray auto listeners that may possibly exist
      removeAutoListener();
    }
  }

  /**
   * The AutoTimer that contains the internal timeout with pause and resume capabilities.
   * It also contains a "wait" state to keep it from setting a timeout before the page has fully loaded,
   * if the user checked the "Wait for the page to fully load" checkbox.
   *
   * Note: This function is derived from code written by Tim Down @ stackoverflow.com.
   *
   * @param callback the function callback
   * @param delay    the delay for the timeout
   * @see https://stackoverflow.com/a/3969760
   * @private
   */
  function AutoTimer(callback, delay) {
    let timeout,
        start,
        remaining = delay,
        wait = false;

    this.pause = function() {
      clearTimeout(timeout);
      remaining -= Date.now() - start;
      remaining = remaining < 0 || wait ? delay : remaining;
      console.log("pause() - timeout=" + timeout + " start=" + start + " delay=" + delay + " remaining=" + remaining + " wait=" + wait);
    };

    this.resume = function() {
      start = Date.now();
      clearTimeout(timeout);
      timeout = wait ? timeout : setTimeout(callback, remaining);
      console.log("resume() - timeout=" + timeout + " start=" + start + " delay=" + delay + " remaining=" + remaining + " wait=" + wait);
    };

    this.clear = function() {
      clearTimeout(timeout);
    };

    this.setWait = function(wait_) {
      wait = wait_;
    };

    this.resume();
  }

  // Return Public Functions
  return {
    startAutoTimer: startAutoTimer,
    stopAutoTimer: stopAutoTimer,
    pauseOrResumeAutoTimer: pauseOrResumeAutoTimer,
    repeatAutoTimer: repeatAutoTimer
  };

})();