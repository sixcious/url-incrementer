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
      "storageKey": "permissionsInternalShortcuts"
    },
    "download": {
      "storageKey": "permissionsDownload",
      "request": {permissions: ["downloads"]}
    },
    "enhancedMode": {
      "storageKey": "permissionsEnhancedMode"
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
    if (!PERMISSIONS[permission].request) {
      chrome.storage.local.set({[PERMISSIONS[permission].storageKey]: true}, function() {
        if (callback) {
          callback(true);
        }
      });
      return;
    }
    chrome.permissions.request(PERMISSIONS[permission].request, function(granted) {
      if (granted) {
        console.log("requestPermission() - successfully granted permission request:" + PERMISSIONS[permission].request.permissions + ", origins:" + PERMISSIONS[permission].request.origins);
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
    if (!PERMISSIONS[permission].request) {
      chrome.storage.local.set({[PERMISSIONS[permission].storageKey]: false}, function() {
        if (callback) {
          callback(true);
        }
      });
      return;
    }
    chrome.permissions.remove(PERMISSIONS[permission].request, function(removed) {
      if (removed) {
        console.log("removePermission() - successfully removed permission request:" + PERMISSIONS[permission].request.permissions + ", origins:" + PERMISSIONS[permission].request.origins);
        chrome.storage.local.set({[PERMISSIONS[permission].storageKey]: false}, function() {
          if (callback) {
            callback(true);
          }
        });
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
    chrome.permissions.remove({ permissions: ["downloads"]}, function(removed) {
      if (removed) {
        console.log("removeAllPermissions() - all permissions successfully removed!");
        if (callback) {
          callback(true);
        }
      }
    });
  }

  /**
   * Checks that the chrome.declarativeContent rule for internal shortcuts is correctly applied.
   * Note: This function is empty in Firefox.
   *
   * @public
   */
  function checkDeclarativeContent() {
  }

  // Return Public Functions
  return {
    requestPermission: requestPermission,
    removePermission: removePermission,
    removeAllPermissions: removeAllPermissions,
    checkDeclarativeContent: checkDeclarativeContent
  };

})();