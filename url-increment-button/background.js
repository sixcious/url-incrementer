/**
 * URL Increment Button Background
 *
 * @author Roy Six
 * @namespace
 */

var URLIncrementButton = URLIncrementButton || {};

URLIncrementButton.Background = function () {

  const URL_INCREMENTER_EXTENSION_ID = "hjgllnccfndbjbedlecgdedlikohgbko";
  
  /**
   * Listen for browser action (extension icon) clicks and then sends a message to
   * URL Incrementer to perform an action. Must have activeTab permission to send tab with tab.url.
   *
   * @param tab the tab in which this click occurred
   * @public
   */
  function clickListener(tab) {
    console.log("URLIncrementButton.Background.clickListener() - about to send message with tab.id=" + tab.id);
    chrome.runtime.sendMessage(URL_INCREMENTER_EXTENSION_ID, {"greeting": "performAction", "action": "increment", "tab": tab});
  }

  // Return Public Functions
  return {
    clickListener: clickListener
  };
}();

// Background Listeners
chrome.browserAction.onClicked.addListener(URLIncrementButton.Background.clickListener);