/**
 * URL Incrementer
 * @file permissions.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Permissions = (() => {

  // This object contains all of the extension's optional permissions. Each permission contains:
  // 1) What storage keys to set, 2) The permission request, 3) The permission conflict to use instead if a conflict exists with another permission (optional), and  4) The script (optional)
  const PERMISSIONS = {
    "internalShortcuts": {
      "storageKey": "permissionsInternalShortcuts",
      "request": {permissions: ["declarativeContent"], origins: ["<all_urls>"]},
      "requestConflict": {permissions: ["declarativeContent"]},
      "script": {js: ["js/shortcuts.js"]}
    },
    "download": {
      "storageKey": "permissionsDownload",
      "request": {permissions: ["downloads"], origins: ["<all_urls>"]},
      "requestConflict": {permissions: ["downloads"]}
    },
    "enhancedMode": {
      "storageKey": "permissionsEnhancedMode",
      "request": {origins: ["<all_urls>"]}
    }
  };

  /**
   * Requests a single permission.
   *
   * If granted and a script needs to be added, adds a declarative content rule.
   * Then updates the permission key value in storage.
   *
   * @param permission the permission to request (a string in PERMISSIONS)
   * @param callback   the callback function to return execution to
   * @public
   */
  function requestPermission(permission, callback) {
    // return new Promise(resolve => {
    //   chrome.permissions.request(PERMISSIONS[permission].request, granted => {
    //
    //   });
    // });
    chrome.permissions.request(PERMISSIONS[permission].request, function(granted) {
      if (granted) {
        console.log("requestPermission() - successfully granted permission request:" + PERMISSIONS[permission].request.permissions + ", origins:" + PERMISSIONS[permission].request.origins);
        if (PERMISSIONS[permission].script) {
          chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()],
            actions: [new chrome.declarativeContent.RequestContentScript(PERMISSIONS[permission].script)]
          }], function(rules) {
            console.log("requestPermission() - successfully added declarativeContent rules:" + rules);
          });
        }
        chrome.storage.local.set({[PERMISSIONS[permission].storageKey]: true}, function() {
          if (callback) {
            callback(true);
          }
        });
      } else {
        if (callback) {
          callback(false);
        }
      }
    });
  }

  /**
   * Removes a single permission.
   *
   * If necessary, removes the script and declarative content rule. Then checks to see if a conflict exists
   * with another permission that might share this permission. If a conflict exists, the permission is not removed.
   * Then updates the permission key value in storage.
   *
   * @param permission the permission to remove (a string in PERMISSIONS)
   * @param callback   the callback function to return execution to 
   * @public
   */
  function removePermission(permission, callback) {
    // Script:
    if (chrome.declarativeContent && PERMISSIONS[permission].script) {
      chrome.declarativeContent.onPageChanged.getRules(undefined, function(rules) {
        for (const rule of rules) {
          if (rule.actions[0].js[0] === PERMISSIONS[permission].script.js[0]) {
            console.log("removePermission() - removing rule " + rule);
            chrome.declarativeContent.onPageChanged.removeRules([rule.id], function() {});
          }
        }
      });
    }
    // Remove:
    chrome.storage.local.get(null, function(items) {
      // Check for conflicts if another permission is enabled; if conflict, then only remove the request's conflict (not the original request)
      if ((permission === "internalShortcuts" && !items.permissionsDownload && !items.permissionsEnhancedMode) ||
          (permission === "download" && !items.permissionsInternalShortcuts && !items.permissionsEnhancedMode) ||
          (permission === "enhancedMode" && !items.permissionsInternalShortcuts && !items.permissionsDownload)) {
        chrome.permissions.remove(PERMISSIONS[permission].request, function(removed) {
          if (removed) {
            console.log("removePermission() - successfully removed permission request:" + PERMISSIONS[permission].request.permissions + ", origins:" + PERMISSIONS[permission].request.origins);
          }
        });
      } else if (PERMISSIONS[permission].requestConflict) {
        chrome.permissions.remove(PERMISSIONS[permission].requestConflict, function(removed) {
          if (removed) {
            console.log("removePermission() - conflict encountered, successfully removed permission request conflict:" + PERMISSIONS[permission].requestConflict.permissions + ", origins:" + PERMISSIONS[permission].requestConflict.origins);
          }
        });
      }
    });
    chrome.storage.local.set({[PERMISSIONS[permission].storageKey]: false}, function() {
      if (callback) {
        callback(true);
      }
    });
  }

  /**
   * Removes all the extension's optional permissions via a promise-based wrapper for async/await callers.
   *
   * @param permissions (optional) all permissions to remove
   * @returns {Promise<{}>} true if removed, false if not removed
   * @public
   */
  async function removeAllPermissions(permissions = { permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]}) {
    await removeDeclarativeContentRules();
    return new Promise(resolve => {
      chrome.permissions.remove(permissions, removed => {
        console.log("removeAllPermissions() - " + removed ? "permissions successfully removed!" : "not removed...");
        resolve(removed);
      });
    });
  }

  /**
   * Checks that the chrome.declarativeContent rule for internal shortcuts is correctly applied.
   * Note: This function is empty in Firefox.
   *
   * @public
   */
  function checkDeclarativeContent() {
    chrome.declarativeContent.onPageChanged.getRules(undefined, function(rules) {
      let shortcutsjsRule = false;
      for (const rule of rules) {
        if (rule.actions[0].js[0] === "js/shortcuts.js") {
          console.log("checkDeclarativeContent() - internal shortcuts enabled, found shortcuts.js rule!");
          shortcutsjsRule = true;
          break;
        }
      }
      if (!shortcutsjsRule) {
        console.log("checkDeclarativeContent() - oh no, something went wrong. internal shortcuts enabled, but shortcuts.js rule not found!");
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
          chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()],
            actions: [new chrome.declarativeContent.RequestContentScript({js: ["js/shortcuts.js"]})]
          }], function(rules) {
            console.log("checkDeclarativeContent() - successfully added declarativeContent rules:" + rules);
          });
        });
      }
    });
  }

  /**
   * TODO
   * @param rule
   *
   * @returns {Promise<unknown>}
   * @private
   */
  function removeDeclarativeContentRules(rule = undefined) {
    return new Promise(resolve => {
      if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(rule => {
          console.log("removeDeclarativeContentRules() - rules successfully removed!");
          resolve(rule);
          return true;
        });
      } else {
        console.log("removeDeclarativeContentRules() - no rules were removed (there may not have been any to begin with)");
        resolve(rule);
        return false;
      }
    });
  }

  // Return Public Functions
  return {
    requestPermission: requestPermission,
    removePermission: removePermission,
    removeAllPermissions: removeAllPermissions,
    checkDeclarativeContent: checkDeclarativeContent
  };

})();