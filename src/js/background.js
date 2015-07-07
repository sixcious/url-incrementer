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
        instance.baseCase = "lowerCase";
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
  function updateTab(instance, direction, caller, callback) {
    var url,
        req,
        urlProps;
    switch (instance.mode) {
      case "next-prev":
        // Note on next-prev:
        // Due to the way activeTab permissions work, we can only call
        // chrome.tabs.executeScript on commands (and quick commands). Otherwise
        // (if called via popup), we'll have to do some XHR work and hope the
        // current URL complies with the same-origin policy in our Ajax request.
        url = direction === "next" ? instance.nexturl : direction === "prev" ? instance.prevurl : instance.url;
            chrome.tabs.update(instance.tabId, {url: url}); // Can't access tab.url
        if (caller !== "command") {
              chrome.tabs.update(instance.tabId, {url: url}, function(tab) {
                if (tab.rea)
                         URLNP.NextPrev.getLinksViaExecuteScript(instance.tabId, function(links) {
            instance.url = url;
            instance.nexturl = URLNP.NextPrev.getURL(instance.linksPriority, "next", links);
            instance.prevurl = URLNP.NextPrev.getURL(instance.linksPriority, "prev", links);
            instance.links = links;
            setInstance(instance.tabId, instance);
            if (callback) {
              callback(instance);
            }
          }); 
              }
        } else if (caller === "command" || caller === "popup") {
          URLNP.NextPrev.getLinksViaXHR(url, function(links) {
            instance.url = url;
            instance.nexturl = URLNP.NextPrev.getURL(instance.linksPriority, "next", links);
            instance.prevurl = URLNP.NextPrev.getURL(instance.linksPriority, "prev", links);
            instance.links = links;
            setInstance(instance.tabId, instance);
            if (callback) {
              callback(instance);
            }
          });
        }
        
        break;
      case "plus-minus":
        // Note on plus-minus:
        // This is a lot more straight-forward; chrome.tabs.update will work
        // regardless of permissions and all logic is done in background
        urlProps = URLNP.PlusMinus.modifyURL(instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros, direction);
        url = urlProps.urlmod;
            chrome.tabs.update(instance.tabId, {url: url}); // Can't access tab.url
        instance.url = urlProps.urlmod;
        instance.selection = urlProps.selectionmod;
        if (caller !== "quick-command") {
          setInstance(instance.tabId, instance);
        }
        if (callback) {
          callback(instance);
        }
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
  if (details.reason === "install" /*|| (details.reason === "update" && details.previousVersion !== "3")*/) {
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
            if (items.quickEnabled) { // Quick Mode:
              URLNP.NextPrev.getLinksViaExecuteScript(tabs[0].id, function(links) {
                instance = URLNP.Background.buildInstance(instance, tabs[0], items, links);
                URLNP.Background.updateTab(instance, command, "quick-command", function(result) {
                  instance = result;
                  // Quick: If the URL didn't change, fallback to other mode
                  if (instance.url === tabs[0].url) {
                    instance.mode = instance.mode === "next-prev" ? "plus-minus" : "next-prev";
                    URLNP.Backgroung.updateTab(instance, command, "quick-command");
                  }
                });
              });
            }
          });
        }
      } else if (command === "clear" && instance && instance.enabled) {
        URLNP.Background.setInstance(tabs[0].id, undefined);
      }
    });
  }
});