/**
 * URL Incrementer Auto
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Auto = URLI.Auto || function () {

  var items_ = {}, // storage items cache
      autoTimeout = null; // setTimeout auto function stored in a var

  /**
   * Sets the items storage cache.
   *
   * @param items the storage items
   * @public
   */
  function setItems(items) {
    items_ = items;
  }

  /**
   * Performs the action automatically, e.g. will continue to automatically increment the page. Used by the setTimeout
   * function, autoTimeout.
   *
   * This method is only called if the user specifically sets an auto action in the popup window. This is a tab
   * instance based method. The action will only stop once the auto times count reaches 0 or if the  user does a clear
   * (e.g. clicks the x button in the popup or shortcut ) to clear the instance.
   *
   * @param action the auto action to perform (e.g. increment)
   * @public
   */
  function autoPerformer(action) {
    if      (action === "increment") { chrome.runtime.sendMessage({greeting: "updateTab", action: "increment", items: items_}); }
    else if (action === "decrement") { chrome.runtime.sendMessage({greeting: "updateTab", action: "decrement", items: items_}); }
  }

  // Return Public Variables / Functions
  return {
    setItems: setItems,
    autoTimeout: autoTimeout,
    autoPerformer: autoPerformer,
  };
}();

// Cache items from storage and check if quick shortcuts or instance are enabled
chrome.storage.sync.get(null, function(items) {
  chrome.runtime.sendMessage({greeting: "getInstance"}, function(response) {
    URLI.Auto.setItems(items);
    // If Auto enabled for this instance ...
    if (response.instance && response.instance.enabled && response.instance.autoEnabled) {
      // Subtract from autoTimes and if it's still greater than 0, continue auto action, else clear the instance
      // Note: The first time auto is done via chrome.runtime.onMessage.addListener from the popup, so it's already been
      // performed once (thus the pre decrement instead of post decrement)
      if (--response.instance.autoTimes > 0) {
        chrome.runtime.sendMessage({greeting: "setInstance", instance: response.instance});
        if (response.instance.autoWait) {
          window.addEventListener("load", function() {
            console.log("Window Loaded! Starting autoTimeout");
            URLI.Auto.autoTimeout = setTimeout(function () {
              URLI.Auto.autoPerformer(response.instance.autoAction);
            }, response.instance.autoSeconds * 1000);
          });
        } else {
          console.log("No waiting!!! Starting autoTimeout");
          URLI.Auto.autoTimeout = setTimeout(function () {
            URLI.Auto.autoPerformer(response.instance.autoAction);
          }, response.instance.autoSeconds * 1000);
        }
      } else {
        chrome.runtime.sendMessage({greeting: "deleteInstance"});
        chrome.runtime.sendMessage({greeting: "closePopup"});
      }
    }
  });
});

// Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.greeting) {
    case "setAutoTimeout":
      URLI.Auto.autoTimeout = setTimeout(function() { URLI.Auto.autoPerformer(request.instance.autoAction); }, request.instance.autoSeconds * 1000);
      break;
    case "clearAutoTimeout":
      clearTimeout(URLI.Auto.autoTimeout);
      break;
    default:
      break;
  }
  sendResponse({});
});