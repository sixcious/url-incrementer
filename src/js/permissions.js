/**
 * URL Incrementer Permissions
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Permissions = function () {

  // TODO
  const PERMISSIONS = {
    "internalShortcuts": {
      "storageKey": "permissionsInternalShortcuts",
      "request": {permissions: ["declarativeContent"], origins: ["<all_urls>"]},
      "script": {js: ["js/shortcuts.js"]}
    },
    "nextPrevEnhanced": {
      "storageKey": "permissionsNextPrevEnhanced",
      "request": {permissions: ["declarativeContent"], origins: ["<all_urls>"]}
    },
    "download": {
      "storageKey": "permissionsDownload",
      "request": {permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]},
      "requestConflict": {permissions: ["downloads"]}
    }
  };

  /**
   * TODO
   *
   * @param permission TODO
   * @param callback   TODO
   * @public
   */
  function requestPermissions(permission, callback) {
    chrome.permissions.request(PERMISSIONS[permission].request, function(granted) {
      if (granted) {
        if (PERMISSIONS[permission].script) {
          chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()],
            actions: [new chrome.declarativeContent.RequestContentScript(PERMISSIONS[permission].script)]
          }]);
        }
        chrome.storage.sync.set({[PERMISSIONS[permission].storageKey]: true}, function() {
          if (callback) { callback(true); }
        });
      } else { if (callback) { callback(false); } }
    });
  }

  /**
   * TODO
   *
   * @param permission TODO
   * @param callback   TODO
   * @public
   */
  function removePermissions(permission, callback) {
    // Script:
    console.log("permission= (followed later by .and then [])" + permission);
    console.log(PERMISSIONS[permission].script);
    if (chrome.declarativeContent && PERMISSIONS[permission].script) {
      chrome.declarativeContent.onPageChanged.getRules(undefined, function(rules) {
        for (let i = 0; i < rules.length; i++) {
          console.log("found rule:" + rules[i]);
          if (rules[i].actions[0].js[0] === PERMISSIONS[permission].script.js[0]) {
            console.log("match found! about to remove the rule...id=" + rules[i].id);
            chrome.declarativeContent.onPageChanged.removeRules([rules[i].id], function() {});
          }
        }
      });
    }
    // Remove:
    chrome.storage.sync.get(null, function(items) {
      if ((permission === "internalShortcuts" && !items.permissionsNextPrevEnhanced && !items.permissionsDownload) ||
          (permission === "nextPrevEnhanced" && !items.permissionsInternalShortcuts && !items.permissionsDownload) ||
          (permission === "download" && !items.permissionsInternalShortcuts && !items.permissionsNextPrevEnhanced)) {
        chrome.permissions.remove(PERMISSIONS[permission].request, function(removed) { if (removed) { console.log("PERMISSIONS no conflicts :) phew, removed!" + removed + " - " + PERMISSIONS[permission].request); } });
      } else if (PERMISSIONS[permission].requestConflict) {
        chrome.permissions.remove(PERMISSIONS[permission].requestConflict, function(removed) { if (removed) { console.log("PERMISSION CONFLICT ENCOUNTERED!!!! removed!" + removed + " - " + PERMISSIONS[permission].requestConflict); } });
      }
    });
    chrome.storage.sync.set({[PERMISSIONS[permission].storageKey]: false}, function() {
      if (callback) { callback(true); }
    });
  }

  function removeAllPermissions(callback) {
    if (chrome.declarativeContent) {
      chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
    }
    chrome.permissions.remove({ permissions: ["declarativeContent", "downloads"], origins: ["<all_urls>"]}, function(removed) { if (removed) { if (callback) { callback(true); } } });
  }

  // Return Public Functions
  return {
    requestPermissions: requestPermissions,
    removePermissions: removePermissions,
    removeAllPermissions: removeAllPermissions
  };
}();