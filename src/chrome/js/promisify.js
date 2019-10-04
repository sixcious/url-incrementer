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
   * Sets the storage items via a promise-based wrapper for async/await callers.
   *
   * @param namespace (optional) the storage namespace, either "local" or "sync"
   * @param items     the storage items (object {}) to set
   * @returns {Promise<{}>}
   * @public
   */
  function setItems(namespace = "local", items) {
    return new Promise(resolve => {
      chrome.storage[namespace].set(items, resolve);
    });
  }

  /**
   * Clears the storage items via a promise-based wrapper for async/await callers.
   *
   * @param namespace (optional) the storage namespace, either "local" or "sync"
   * @returns {Promise<{}>}
   * @public
   */
  function clearItems(namespace = "local") {
    return new Promise(resolve => {
      chrome.storage[namespace].clear(resolve);
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

  /**
   * Sends a message to the extension's runtime (background) via a promise-based wrapper for async/await callers.
   *
   * @param message the message object e.g. {greeting: "doSomething"}
   * @returns {Promise<{}>} the response
   */
  function runtimeSendMessage(message) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(message, response => {
        resolve(response);
      });
    });
  }

  /**
   * Sends a message to a tab's content script via a promise-based wrapper for async/await callers.
   *
   * @param tabId   the content script's tab ID to send the message to
   * @param message the message object e.g. {greeting: "doSomething"}
   * @returns {Promise<{}>} the response
   */
  function tabsSendMessage(tabId, message) {
    return new Promise(resolve => {
      chrome.tabs.sendMessage(tabId, message, response => {
        resolve(response);
      });
    });
  }

  // Return Public Functions
  return {
    getItems: getItems,
    setItems: setItems,
    clearItems: clearItems,
    getTabs: getTabs,
    getBackgroundPage: getBackgroundPage,
    runtimeSendMessage: runtimeSendMessage,
    tabsSendMessage: tabsSendMessage
  };

})();