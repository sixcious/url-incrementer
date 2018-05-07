/**
 * URL Incrementer Auto
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Auto = URLI.Auto || function () {

  var autoTimeout, // the auto setTimeout function stored in a var
      instance; // the instance containing the auto properties

  /**
   * Sets the instance, which contains the auto properties.
   * 
   * @public
   */
  function setInstance(instance_) {
    instance = instance_;
  }

  /**
   * Decides whether or not to set the autoTimeout based on the instance's current properties.
   * Also decides when it is time to delete the instance when the auto times count has reached 0.
   *
   * @public
   */
  function decideAutoTimeout() {
    // If auto is enabled for this instance ...
    if (instance && instance.enabled && instance.autoEnabled) {
      // Subtract from autoTimes and if it's still greater than 0, continue auto action, else clear the instance
      // Note: The first time auto is done via chrome.runtime.onMessage.addListener from the popup, so it's already been
      // performed once (thus the pre decrement instead of post decrement)
      if (--instance.autoTimes > 0) {
        chrome.runtime.sendMessage({greeting: "setInstance", instance: instance});
        // If auto wait is enabled, only add the window load listener if the document hasn't finished loading, or it will never fire 
        if (instance.autoWait && document.readyState !== "complete") {
          window.addEventListener("load", function() { setAutoTimeout(); });
        } else {
          setAutoTimeout();
        }
      } else {
        chrome.runtime.sendMessage({greeting: "deleteInstance"});
        chrome.runtime.sendMessage({greeting: "closePopup"});
      }
    }
  }

  /**
   * Sets the autoTimeout.
   * 
   * @public
   */
  function setAutoTimeout() {
    autoTimeout = setTimeout(function () {
      chrome.runtime.sendMessage({greeting: "updateTab", action: instance.autoAction});
    }, instance.autoSeconds * 1000);
  }

  /**
   * Clears the autoTimeout. This is only called when the user manually intervenes
   * and tries clearing the instance (e.g. clicking the popup clear button or via
   * a shortcut command).
   * 
   * @public
   */
  function clearAutoTimeout() {
    clearTimeout(autoTimeout);
  }

  // Return Public Functions
  return {
    setInstance: setInstance,
    decideAutoTimeout: decideAutoTimeout,
    setAutoTimeout: setAutoTimeout,
    clearAutoTimeout: clearAutoTimeout
  };
}();

// Content Script Start: Get instance and see if auto is enabled
chrome.runtime.sendMessage({greeting: "getInstance"}, function(response) {
  URLI.Auto.setInstance(response.instance);
  URLI.Auto.decideAutoTimeout();
});

// Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.greeting) {
    case "setAutoTimeout":
      URLI.Auto.setInstance(request.instance);
      URLI.Auto.setAutoTimeout();
      break;
    case "clearAutoTimeout":
      URLI.Auto.clearAutoTimeout();
      break;
    default:
      break;
  }
  sendResponse({});
});