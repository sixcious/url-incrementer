/**
 * URL Incrementer
 * @file promisify.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Promisify = (() => {

  /**
   * Gets the storage items via a promise-based wrapper for async/await callers.
   *
   * @param namespace (optional) the storage namespace, either "local" or "sync"
   * @param key       (optional) the storage item key to get or null for all items
   * @returns {Promise<{}>} the storage items
   * @public
   */
  function getItems(namespace = "local", key = null) {
    return new Promise(resolve => {
      chrome.storage[namespace].get(key, items => {
        key ? resolve(items[key]) : resolve(items);
      });
    });
  }

  /**
   * Gets the queried tabs via a promise-based wrapper for async/await callers.
   *
   * @param queryInfo (optional) the query object to use
   * @returns {Promise<{}>} the tabs
   * @public
   */
  function getTabs(queryInfo = {active: true, lastFocusedWindow: true}) {
    return new Promise(resolve => {
      chrome.tabs.query(queryInfo, tabs => {
        resolve(tabs);
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

  // Return Public Functions
  return {
    getItems: getItems,
    getTabs: getTabs,
    getBackgroundPage: getBackgroundPage
  };

})();