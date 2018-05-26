/**
 * URL Incrementer Auto
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

// The AutoTimer function is based on code written by Tim Down at StackOverflow
// https://stackoverflow.com/a/3969760
URLI.AutoTimer = function (callback, delay) {
  var timerId, start, remaining = delay;

  this.pause = function() {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  this.resume = function() {
    start = new Date();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, remaining);
  };

  this.clear = function() {
    window.clearTimeout(timerId);
  }

  this.resume();
}

URLI.Auto = function () {

  const autoTimers = new Map();
  
  var autoListenerAdded = false;

  /**
   * Adds the auto listener (only if there isn't one already).
   *
   * @public
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
   * @public
   */
  function removeAutoListener() {
    if (![...URLI.Background.getInstances().values()].some(instance => instance && instance.autoEnabled)) {
      chrome.tabs.onUpdated.removeListener(autoListener);
      autoListenerAdded = false;
    }
  }

  /**
   * Sets the instance's auto timeout, and then updates the tab, performing the auto action.
   *
   * @param instance the instance's timeout to set
   * @public
   */
  function setAutoTimeout(instance) {
    var autoTimer = new URLI.AutoTimer(function() {
      if (instance.downloadEnabled) {
        URLI.Background.performAction(instance, "download", "auto", function(instance) {
          URLI.Background.performAction(instance, instance.autoAction, "auto");
        });
      } else {
        URLI.Background.performAction(instance, instance.autoAction, "auto");
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
   * @public
   */
  function clearAutoTimeout(instance) {
    var autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      autoTimer.clear();
      autoTimers.delete(instance.tabId);
    }
  }
  
  function pauseOrResumeAutoTimeout(instance) {
    var autoTimer = instance ? autoTimers.get(instance.tabId) : undefined;
    if (autoTimer) {
      if (!instance.autoPaused) {
        instance.autoPaused = true;
        autoTimer.pause();
        URLI.Background.setBadge(instance.tabId, "autopause", false);
      } else {
        instance.autoPaused = false;
        autoTimer.resume();
        if (instance.autoBadge === "times") {
          URLI.Background.setBadge(instance.tabId, "autotimes", false, instance.autoTimes + "");
        } else {
          URLI.Background.setBadge(instance.tabId, "auto", false);
        }
      }
      URLI.Background.setInstance(instance.tabId, instance); // necessary? update instance.autoPaused boolean state
      autoTimers.set(instance.tabId, autoTimer); // necessary? update autoTimers paused state
    }
  }
  
  function startAutoTimer(instance, callback) {
    clearAutoTimeout(instance);
    setAutoTimeout(instance);
    addAutoListener();
    instance.autoPaused = false;
    URLI.Background.setBadge(instance.tabId, "auto", false);
    if (callback) {
      callback(instance);
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
      
      if (instance.autoWait ? changeInfo.status === "complete" : changeInfo.status === "loading") {
        // If the auto instance was paused but the tab changed, we do not want to consider this an auto action
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
          URLI.Background.performAction(instance, "clear", "auto");
        }
      }
    } else if (changeInfo.status === "complete") { // Removes any stray auto listeners that may exist
      removeAutoListener();
    }
  }

  // Return Public Functions
  return {
    addAutoListener: addAutoListener,
    removeAutoListener: removeAutoListener,
    setAutoTimeout: setAutoTimeout,
    pauseOrResumeAutoTimeout: pauseOrResumeAutoTimeout,
    clearAutoTimeout: clearAutoTimeout,
    startAutoTimer: startAutoTimer
  };
}();