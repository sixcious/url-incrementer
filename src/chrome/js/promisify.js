/**
 * URL Incrementer Promisify
 *
 * @author Roy Six
 * @namespace
 */

var EXT = EXT || {};

EXT.Promisify = function () {

  /**
   * Gets the storage items via a promise-based wrapper for async/await callers.
   *
   * @param namespace the storage namespace, either "sync" or "local" (optional)
   * @param key       the storage item key to get or null for all items (optional)
   * @returns {Promise<{}>} the storage items
   * @public
   */
  function getItems(namespace = "sync", key = null) {
    return new Promise(resolve => {
      chrome.storage[namespace].get(key, items => {
        key ? resolve(items[key]) : resolve(items);
      });
    });
  }

  /**
   * Gets the background page via a promise-based wrapper for async/await callers.
   *
   * @returns {Promise<{}>} the background page
   * @public
   */
  function getBackgroundPage() {
    return new Promise(resolve => {
      chrome.runtime.getBackgroundPage(backgroundPage => {
        resolve(backgroundPage);
      });
    });
  }

  /**
   * Gets the queried tabs via a promise-based wrapper for asyn/await callers.
   *
   * @param queryInfo the query object to use (optional)
   * @returns {Promise<{}>} the tabs
   */
  function getTabs(queryInfo = {active: true, lastFocusedWindow: true}) {
    return new Promise(resolve => {
      chrome.tabs.query(queryInfo, tabs => {
        resolve(tabs);
      });
    });
  }

  // Return Public Functions
  return {
    getItems: getItems,
    getTabs: getTabs,
    getBackgroundPage: getBackgroundPage
  };
}();