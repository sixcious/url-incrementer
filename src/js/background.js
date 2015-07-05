/**
 * URL Next Plus Background
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Background = URLNP.Background || function () {

  var instances = []; // Tab instances (TODO: Use storage to make bg event page)

  /**
   * Gets the tab's instance.
   * 
   * @param tabId the tab id to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    return instances[tabId];
  }

  /**
   * Sets the tab's instance.
   * 
   * @param tabId    the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    instances[tabId] = instance;
  }

  /**
   * Builds/Updates a instance with default values.
   * 
   * @param instance the instance, if any, to continue building off of
   * @param tab      the tab properties (id, url) to set this instance with
   * @param items    the storage items used to build the default instance
   * @param links    the next and prev links found for this instance
   * @return instance the newly built instance
   * @public
   */
  function buildInstance(instance, tab, items, links) {
    var selectionProps;
    if (tab) {
      selectionProps = URLNP.PlusMinus.findSelection(tab.url);
      if (!instance) {
        instance = {};
        instance.enabled = false;
        instance.mode = items.defaultMode;
        instance.linksPriority = items.defaultLinksPriority;
        instance.interval = items.defaultInterval;
        instance.base = 10;
        instance.baseCase = undefined;
        instance.leadingZeros = false;
      }
      instance.tabId = tab.id;
      instance.url = tab.url;
      instance.nexturl = links ? URLNP.NextPrev.getURL(instance.linksPriority, "next", links) : undefined;
      instance.prevurl = links ? URLNP.NextPrev.getURL(instance.linksPriority, "prev", links) : undefined;
      instance.links = links;
      instance.selection = selectionProps.selection;
      instance.selectionStart = selectionProps.selectionStart;
    }
    return instance;
  }

  /**
   * Updates the instance's tab based on the desired direction.
   * 
   * This function updates the tab based on the instance's properties.
   * 
   * @param instance  the instance for this tab
   * @param direction the direction to go
   * @param caller    String indicating who called this function (e.g. command)
   * @public
   */
  function updateTab(instance, direction, caller) {
    var urlProps,
        url,
        req;
    // Ensures we always get the latest instance (TODO: Refactor this)
    instance = caller === "quick-command" ? instance : getInstance(instance.tabId);
    switch (instance.mode) {
      case "next-prev":
        // Note on next-prev:
        // Due to the way activeTab permissions work, we can only call
        // chrome.tabs.executeScript on commands (and quick commands). Otherwise
        // (if called via popup), we'll have to do some XHR work and hope the
        // current URL complies with the same-origin policy in our Ajax request.
        if (caller === "command" || caller === "quick-command") {
          chrome.tabs.executeScript(instance.tabId, {file: "js/next-prev.js", runAt: "document_end"}, function() {
            var code =
              "URLNP.NextPrev.getURL(" +
                JSON.stringify(instance.linksPriority) +
                ", " +
                JSON.stringify(direction) +
                ", URLNP.NextPrev.getLinks(document));";
            chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function(results){
              url = results[0];
              if (caller !== "quick-command") {
                instance.url = url ? url : instance.url;
                setInstance(instance.tabId, instance);
              }
              chrome.tabs.update(instance.tabId, {url: url});
            });
          });
        } else { // Need to use XHR
          req = new XMLHttpRequest();
          req.open("GET", instance.url, true);
          req.responseType = "document";
          req.onload = function() { // Equivalent to onreadystate and checking 4
            url = URLNP.NextPrev.getURL(instance.linksPriority, direction, URLNP.NextPrev.getLinks(this.responseXML));
            instance.url = url ? url : instance.url;
            setInstance(instance.tabId, instance);
            chrome.tabs.update(instance.tabId, {url: url});
          };
          req.send();
        }
        break;
      case "plus-minus":
        // Note on plus-minus:
        // This is a lot more straight-forward; chrome.tabs.update will work
        // regardless of permissions and all logic is done in background
        urlProps = URLNP.PlusMinus.modifyURL(instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros, direction);
        url = urlProps.urlm;
        if (caller !== "quick=command") {
          instance.url = urlProps.urlm;
          instance.selection = urlProps.selectionm;
          setInstance(instance.tabId, instance);
        }
        chrome.tabs.update(instance.tabId, {url: url});
        break;
      default:
        break;
    }
  }

  // Return Public Functions
  return {
    getInstance: getInstance,
    setInstance: setInstance,
    buildInstance: buildInstance,
    updateTab: updateTab
  };
}();

// Listen for installation changes and do storage/extension initialization work
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install" || (details.reason === "update" && details.previousVersion !== "3")) {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set({
        "quickEnabled": true,
        "defaultMode": "next-prev",
        "defaultLinksPriority": "attributes",
        "defaultInterval": 1,
        "animationsEnabled": true
      });
    });
  }
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});

// Listen for commands (keyboard shortcuts) and perform the command's action
chrome.commands.onCommand.addListener(function(command) {
  if (command === "next" || command === "prev" || command === "clear") {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      var instance = URLNP.Background.getInstance(tabs[0].id);
      if (command === "next" || command === "prev") {
        if (instance && instance.enabled) {
          URLNP.Background.updateTab(instance, command, "command");
        } else {
          chrome.storage.sync.get(null, function(items) {
            if (items.quickEnabled) {
              instance = URLNP.Background.buildInstance(instance, tabs[0], items, undefined);
              URLNP.Background.updateTab(instance, command, "quick-command");
              // TODO: Add the ability to use other mode if tab isn't updated
            }
          });
        }
      } else if (command === "clear" && instance && instance.enabled) {
        URLNP.Background.setInstance(tabs[0].id, undefined);
      }
    });
  }
});