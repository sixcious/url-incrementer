/**
 * URL Increment [+] Button Background
 *
 * @author Roy Six
 * @namespace
 */

var URLIncrementButton = URLIncrementButton || {};

URLIncrementButton.Background = function () {
  
  const EXTENSION_ID = chrome.runtime.id,
        URLI_EXTENSION_ID = "maapbhnoodphafajhjphecmhmghpphgf";
  
  /**
   * Listen for browser action (extension icon) clicks and then sends a message to
   * URL Incrementer to perform an action.
   * 
   * @param tab the tab that this click happened
   * @public
   */
  function clickListener(tab) {
    //console.log("URLIncrementButton DEBUG: clickListener() tab.id=" + tab.id);
    chrome.runtime.sendMessage(URLI_EXTENSION_ID, {"extensionId": EXTENSION_ID, "greeting": "performAction", "action": "increment", "tab": tab});
  }

  // Return Public Functions
  return {
    clickListener: clickListener
  };
}();

// Background Listeners
chrome.browserAction.onClicked.addListener(URLIncrementButton.Background.clickListener);