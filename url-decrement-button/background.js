/**
 * URL Decrement Button Background
 *
 * @author Roy Six
 * @namespace
 */

var URLDecrementButton = URLDecrementButton || {};

URLDecrementButton.Background = function () {
  
  const URLI_EXTENSION_ID = "maapbhnoodphafajhjphecmhmghpphgf";

  /**
   * Listen for browser action (extension icon) clicks and then sends a message to
   * URL Incrementer to perform an action.
   * 
   * @param tab the tab that this click happened
   * @public
   */
  function clickListener(tab) {
    //console.log("URLDecrementButton DEBUG: clickListener() tab.id=" + tab.id);
    chrome.runtime.sendMessage(URLI_EXTENSION_ID, {"greeting": "performAction", "action": "decrement", "tab": tab});
  }

  // Return Public Functions
  return {
    clickListener: clickListener
  };
}();

// Background Listeners
chrome.browserAction.onClicked.addListener(URLDecrementButton.Background.clickListener);