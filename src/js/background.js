/**
 * URL Next Plus Background
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Background = URLNP.Background || function () {

  var instances = []; // Tab instances (TODO:Put in storage to convert to event)

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
   * @param tab      the tab to set this instance with
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
      }
      instance.tab = tab;
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
   * @param caller    String indicating how this function was called
   * @public
   */
  function updateTab(instance, direction, caller) {
    var urlProps,
        url,
        req;
    // Ensures we always get the latest instance (TODO: Refactor this)
    instance = caller === "quick-command" ? instance : getInstance(instance.tab.id);
    switch (instance.mode) {
      case "next-prev":
        // Note on next-prev:
        // Due to the way activeTab permissions work, we can only call
        // chrome.tabs.executeScript on commands (and quick commands). Otherwise
        // (if called via popup), we'll have to do some XHR work and hope the
        // current URL complies with the same-origin policy in our Ajax request.
        if (caller === "command" || caller === "quick-command") {
          chrome.tabs.executeScript(instance.tab.id, {file: "js/next-prev.js", runAt: "document_end"}, function() {
            var code =
              "URLNP.NextPrev.getURL(" +
                JSON.stringify(instance.linksPriority) +
                ", " +
                JSON.stringify(direction) +
                ", URLNP.NextPrev.getLinks(document));";
            chrome.tabs.executeScript(instance.tab.id, {code: code, runAt: "document_end"}, function(results){
              url = results[0];
              if (caller !== "quick-command") {
                instance.tab.url = url ? url : instance.tab.url;
                setInstance(instance.tab.id, instance);
              }
              chrome.tabs.update(instance.tab.id, {url: url});
            });
          });
        } else { // Need to use XHR
          req = new XMLHttpRequest();
          req.open("GET", instance.tab.url, true);
          req.responseType = "document";
          req.onload = function() { // Equivalent to onreadystate and checking 4
            url = URLNP.NextPrev.getURL(instance.linksPriority, direction, URLNP.NextPrev.getLinks(this.responseXML));
            instance.tab.url = url ? url : instance.tab.url;
            setInstance(instance.tab.id, instance);
            chrome.tabs.update(instance.tab.id, {url: url});
          };
          req.send();
        }
        break;
      case "plus-minus":
        // Note on plus-minus:
        // This is a lot more straight-forward; chrome.tabs.update will work
        // regardless of permissions and all logic is done in background
        urlProps = URLNP.PlusMinus.modifyURL(instance.tab.url, instance.selection, instance.selectionStart, instance.interval, direction);
        url = urlProps.urlm;
        if (caller !== "quick=command") {
          instance.tab.url = urlProps.urlm;
          instance.selection = urlProps.selectionm;
          setInstance(instance.tab.id, instance);
        }
        chrome.tabs.update(instance.tab.id, {url: url});
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
  // TODO: Remove the details.reason === "update" after this release
  if (details.reason === "install" || details.reason === "update") {
    chrome.storage.sync.clear(function() {
      chrome.storage.sync.set({
        "quickEnabled": true,
        "defaultMode": "next-prev",
        "defaultLinksPriority": "attributes",
        "defaultInterval": 1,
        "animationsEnabled": true
      });
    });
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
            }
          });
        }
      } else if (command === "clear" && instance && instance.enabled) {
        URLNP.Background.setInstance(tabs[0].id, undefined);
      }
    });
  }
});