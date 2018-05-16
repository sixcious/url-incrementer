/**
 * URL Incrementer Auto
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Auto = URLI.Auto || function () {

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
    if (![...URLI.Background.getInstances().values()].some(instance => instance.autoEnabled)) {
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
    instance.autoTimeout = setTimeout(function () {
      if (instance.downloadEnabled) {
        URLI.Background.performAction(instance, "download", "auto", function(instance) {
          URLI.Background.performAction(instance, instance.autoAction, "auto");
        });
      } else {
        URLI.Background.performAction(instance, instance.autoAction);
      }
    }, instance.autoSeconds * 1000);
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
    clearTimeout(instance.autoTimeout);
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
    // If auto is enabled for this instance ...
    if (instance && instance.autoEnabled) {
      // Set the "AUTO" Browser Action Badge (this needs to be done each time the tab is updated)
      if (changeInfo.status === "loading") {
        URLI.Background.setBadge(tabId, "auto", false);
      }
      if (instance.autoWait ? changeInfo.status === "complete" : changeInfo.status === "loading") {
        // Subtract from autoTimes and if it's still greater than 0, set the auto timeout, else delete the instance
        // Note: We pre-decrement because the first time Auto is already done via Popup calling setAutoTimeout()
        if (--instance.autoTimes > 0) {
          URLI.Background.setInstance(tabId, instance);
          clearAutoTimeout(instance); // Prevents adding multiple timeouts (e.g. if user manually navigated the auto tab)
          setAutoTimeout(instance);
        } else {
          // Note: clearing will clearAutoTimeout and removeAutoListener, so we don't have to do it here
          URLI.Background.performAction(instance, "clear", "auto");
          chrome.extension.getViews({type: "popup", windowId: tab.windowId}).forEach(function (popup) {
            popup.close();
          });
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
    clearAutoTimeout: clearAutoTimeout
  };
}();