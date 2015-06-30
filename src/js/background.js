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
   * @param tab the tab id to lookup this instance by
   * @return instance the tab's instance
   * @public
   */
  function getInstance(tabId) {
    console.log("getInstance(tabId)");
    return instances[tabId];
  }

  /**
   * Sets the tab's instance.
   * 
   * @param tab      the tab id to lookup this instance by
   * @param instance the instance to set
   * @public
   */
  function setInstance(tabId, instance) {
    console.log("setInstance(tabId, instance)");
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
    console.log("buildInstance(instance, tab, items, links)");
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
   * @param instance  the instance belonging to this tab
   * @param direction the direction to go
   * @param caller    String indicating how this function was called
   * @public
   */
  function updateTab(instance, direction, caller) {
    console.log("updateTab(instance, direction, caller)");
    var urlProps,
        url,
        req;
    instance = caller === "quick-command" ? instance : getInstance(instance.tab.id);
    switch (instance.mode) {
      case "next-prev":
        if (caller === "command" || caller === "quick-command") {
          chrome.tabs.executeScript(instance.tab.id, {file: "js/next-prev.js", runAt: "document_end"}, function() {
            var code =
              "URLNP.NextPrev.setDoc(document);" + 
              "URLNP.NextPrev.getLinks();" +
              "URLNP.NextPrev.getURL(" + JSON.stringify(instance.linksPriority) + ", " + JSON.stringify(direction) + ");";
            chrome.tabs.executeScript(instance.tab.id, {code: code, runAt: "document_end"}, function(results){
              url = results[0];
              if (caller !== "quick-command") {
                instance.tab.url = url ? url : instance.tab.url;
                setInstance(instance.tab.id, instance);
              }
              chrome.tabs.update(instance.tab.id, {url: url});
            });
          });
        } else {
          req = new XMLHttpRequest();
          req.open("GET", instance.tab.url, true);
          req.responseType = "document";
          req.onload = function() { // Equivalent to onreadystate and checking 4
            URLNP.NextPrev.setDoc(this.responseXML);
            URLNP.NextPrev.getLinks();
            url = URLNP.NextPrev.getURL(instance.linksPriority, direction);
            console.log("url after req:" + url);
            instance.tab.url = url ? url : instance.tab.url;
            setInstance(instance.tab.id, instance);
            chrome.tabs.update(instance.tab.id, {url: url});
          };
          req.send();
        }
        break;
      case "plus-minus":
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
  console.log("!chrome.runtime.onInstalled details.reason=" + details.reason);
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
  console.log("!chrome.commands.onCommand command=" + command);
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