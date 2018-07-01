/**
 * URL Incrementer Permissions
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Permissions = function () {

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
   * If granted and a script needs to be added, adds a declarative content rule.
   * Then updates the permission key value in storage.
   *
   * @param permission the permission to request (a string in PERMISSIONS)
   * @param callback   the callback function to return execution to
   * @public
   */
  function requestPermissions(permission, callback) {
    chrome.permissions.request(PERMISSIONS[permission].request, function(granted) {
      if (granted) {
        //console.log("URLI.Permissions: requestPermissions() successfully granted permission request:" + PERMISSIONS[permission].request.permissions + ", origins:" + PERMISSIONS[permission].request.origins);
        if (PERMISSIONS[permission].script) {
          chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()],
            actions: [new chrome.declarativeContent.RequestContentScript(PERMISSIONS[permission].script)]
          }], function(rules) {
            //console.log("URLI.Permissions: requestPermissions() successfully added declarativeContent rules:" + rules);
          });
        }
        chrome.storage.sync.set({[PERMISSIONS[permission].storageKey]: true}, function() {
          if (callback) {
            callback(true);
          }
        });
        // Request the permission a second time...
        // This is due to a bug that happens when origins <all_urls> had been previously granted and then removed and a
        // NEW permission (e.g. Download) is asked to be granted. The bug is that it forgets to also grant origins <all_urls> with the new permission
        chrome.permissions.request(PERMISSIONS[permission].request);
      } else {
        if (callback) {
          callback(false);
        }
      }
    });
  }

  /**
   * Removes a single permission.
   * If necessary, removes the script and declarative content rule. Then checks to see if a conflict exists
   * with another permission that might share this permission. If a conflict exists, the permission is not removed.
   * Then updates the permission key value in storage.
   *
   * @param permission the permission to remove (a string in PERMISSIONS)
   * @param callback   the callback function to return execution to 
   * @public
   */
  function removePermissions(permission, callback) {
    // Script:
    if (chrome.declarativeContent && PERMISSIONS[permission].script) {
      chrome.declarativeContent.onPageChanged.getRules(undefined, function(rules) {
        for (let rule of rules) {
          if (rule.actions[0].js[0] === PERMISSIONS[permission].script.js[0]) {
            //console.log("URLI.Permissions: removePermissions() Removing rule " + rule);
            chrome.declarativeContent.onPageChanged.removeRules([rule.id], function() {});
          }
        }
      });
    }
    // Remove:
    chrome.storage.sync.get(null, function(items) {
      // Check for conflicts if another permission is enabled; if conflict, then only remove the request's conflict (not the original request)
      if ((permission === "internalShortcuts" && !items.permissionsDownload && !items.permissionsEnhancedMode) ||
          (permission === "download" && !items.permissionsInternalShortcuts && !items.permissionsEnhancedMode) ||
          (permission === "enhancedMode" && !items.permissionsInternalShortcuts && !items.permissionsDownload)) {
        chrome.permissions.remove(PERMISSIONS[permission].request, function(removed) {
          if (removed) {
            //console.log("URLI.Permissions: removePermissions() successfully removed permission request:" + PERMISSIONS[permission].request.permissions + ", origins:" + PERMISSIONS[permission].request.origins);
          }
        });
      } else if (PERMISSIONS[permission].requestConflict) {
        chrome.permissions.remove(PERMISSIONS[permission].requestConflict, function(removed) {
          if (removed) {
            //console.log("URLI.Permissions: removePermissions() conflict encountered, successfully removed permission request conflict:" + PERMISSIONS[permission].requestConflict.permissions + ", origins:" + PERMISSIONS[permission].requestConflict.origins);
          }
        });
      }
    });
    chrome.storage.sync.set({[PERMISSIONS[permission].storageKey]: false}, function() {
      if (callback) {
        callback(true);
      }
    });
  }

  /**
   * Removes all the extension's optional permissions.
   *
   * @param callback the callback function to return execution to
   * @public
   */
  function removeAllPermissions(callback) {
    if (chrome.declarativeContent) {
      chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
    }
    chrome.permissions.remove({ permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]}, function(removed) {
      if (removed) {
        //console.log("URLI.Permissions: removeAllPermissions() all permissions successfully removed!");
        if (callback) {
          callback(true);
        }
      }
    });
  }

  // Return Public Functions
  return {
    requestPermissions: requestPermissions,
    removePermissions: removePermissions,
    removeAllPermissions: removeAllPermissions
  };
}();