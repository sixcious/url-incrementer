/**
 * URL Incrementer Shortcuts
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Shortcuts = URLI.Shortcuts || function () {

  // TODO: Convert KeyEvent.keyCode to KeyEvent.code and MouseEvent.which to MouseEvent.button
  var FLAG_KEY_ALT = 0x1, // 0001
      FLAG_KEY_CTRL = 0x2, // 0010
      FLAG_KEY_SHIFT = 0x4, // 0100
      FLAG_KEY_META = 0x8, // 1000
      FLAG_MOUSE_LEFT = 0x1, // 01
      FLAG_MOUSE_MIDDLE = 0x2, // 10
      FLAG_MOUSE_RIGHT = 0X3, // 11
      KEY_MODIFIER_STRING_MAP = { // Map for key codes that shouldn't be written since they are event modifiers
        "16": "Shift", // Shift
        "17": "Ctrl", // Ctrl
        "18": "Alt", // Alt
        "91": "Meta", // Meta / Left Windows Key
        "92": "Meta" // Meta / Right Windows Key
      },
      items_ = {}, // storage items cache
      autoTimeout = null; // setTimeout auto function stored in a var

  /**
   * Sets the items storage cache.
   * 
   * @param items the storage items
   * @public
   */
  function setItems(items) {
    items_ = items;
  }

  /**
   * Performs the action automatically, e.g. will continue to automatically increment the page. Used by the setTimeout
   * function, autoTimeout.
   *
   * This method is only called if the user specifically sets an auto action in the popup window. This is a tab
   * instance based method. The action will only stop once the auto times count reaches 0 or if the  user does a clear
   * (e.g. clicks the x button in the popup or shortcut ) to clear the instance.
   *
   * @param action the auto action to perform (e.g. increment)
   * @public
   */
  function autoPerformer(action) {
    if      (action === "increment") { chrome.runtime.sendMessage({greeting: "updateTab", action: "increment", items: items_}); }
    else if (action === "decrement") { chrome.runtime.sendMessage({greeting: "updateTab", action: "decrement", items: items_}); }
  }

  /**
   * A key event listener for keyboard shortcuts.
   * 
   * Listens for increment, decrement, next, prev, and clear keyboard shortcuts.
   * 
   * @param event the key event
   * @public
   */
  function keyListener(event) {
    if      (keyPressed(event, items_.keyIncrement)) { chrome.runtime.sendMessage({greeting: "updateTab", action: "increment", items: items_}); }
    else if (keyPressed(event, items_.keyDecrement)) { chrome.runtime.sendMessage({greeting: "updateTab", action: "decrement", items: items_}); }
    else if (keyPressed(event, items_.keyNext))      { chrome.runtime.sendMessage({greeting: "updateTab", action: "next", items: items_}); }
    else if (keyPressed(event, items_.keyPrev))      { chrome.runtime.sendMessage({greeting: "updateTab", action: "prev", items: items_}); }
    else if (keyPressed(event, items_.keyClear))     { chrome.runtime.sendMessage({greeting: "deleteInstance"});
                                                       if (!items_.keyQuickEnabled) { document.removeEventListener("keyup", keyListener); }
                                                       if (!items_.mouseQuickEnabled) { document.removeEventListener("mouseup", mouseListener); }
                                                       if (URLI.Shortcuts.autoTimeout) { clearTimeout(URLI.Shortcuts.autoTimeout); } }
  }

  /**
   * A mouse event listener for mouse button shortcuts.
   * 
   * Listens for increment, decrement, next, prev, and clear mouse button shortcuts.
   * 
   * @param event the mouse button event
   * @public
   */
  function mouseListener(event) {
    if      (mousePressed(event, items_.mouseIncrement)) { chrome.runtime.sendMessage({greeting: "updateTab", action: "increment", items: items_}); }
    else if (mousePressed(event, items_.mouseDecrement)) { chrome.runtime.sendMessage({greeting: "updateTab", action: "decrement", items: items_}); }
    else if (mousePressed(event, items_.mouseNext))      { chrome.runtime.sendMessage({greeting: "updateTab", action: "next", items: items_}); }
    else if (mousePressed(event, items_.mousePrev))      { chrome.runtime.sendMessage({greeting: "updateTab", action: "prev", items: items_}); }
    else if (mousePressed(event, items_.mouseClear))     { chrome.runtime.sendMessage({greeting: "deleteInstance"});
                                                           if (!items_.keyQuickEnabled) { document.removeEventListener("keyup", keyListener); }
                                                           if (!items_.mouseQuickEnabled) { document.removeEventListener("mouseup", mouseListener); }
                                                           if (URLI.Shortcuts.autoTimeout) { clearTimeout(URLI.Shortcuts.autoTimeout); } }
  }

  /**
   * Checks if the key was pressed by comparing the event against the flags 
   * using bitwise operators and checking if the keyCode matches.
   * 
   * @param event the key event
   * @param key the key to check
   * @return true if the key event matches the key, false otherwise
   * @private
   */
  function keyPressed(event, key) {
    return (key && key.length !== 0 && (
      (key[0] && KEY_MODIFIER_STRING_MAP[key[1]]) || (
        !(event.altKey   ^ (key[0] & FLAG_KEY_ALT)       ) &&
        !(event.ctrlKey  ^ (key[0] & FLAG_KEY_CTRL)  >> 1) &&
        !(event.shiftKey ^ (key[0] & FLAG_KEY_SHIFT) >> 2) &&
        !(event.metaKey  ^ (key[0] & FLAG_KEY_META)  >> 3))) &&
      (event.keyCode === key[1])
    );
  }

  /**
   * Checks if the mouse button was pressed by comparing the event against the
   * flags.
   * 
   * @param event the mouse event
   * @param mouse the mouse button to check
   * @return true if the mouse button event matches the mouse, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    return (mouse && mouse !== 0 &&
      (event.which === FLAG_MOUSE_LEFT   && mouse === FLAG_MOUSE_LEFT) ||
      (event.which === FLAG_MOUSE_MIDDLE && mouse === FLAG_MOUSE_MIDDLE) ||
      (event.which === FLAG_MOUSE_RIGHT  && mouse === FLAG_MOUSE_RIGHT)
    );
  }

  // Return Public Variables / Functions
  return {
    autoTimeout: autoTimeout,
    setItems: setItems,
    autoPerformer: autoPerformer,
    keyListener: keyListener,
    mouseListener: mouseListener
  };
}();

URLI.Download = URLI.Download || function () {

  /**
   * TODO
   *
   * @public
   */
  function download(instance) {
    // links = doc.getElementsByTagName("img"),
    // srclinks = document_.querySelectorAll("[src]"),
    // hreflinks = document_.querySelectorAll("[href]"),
    console.log("in download... downloadSelecto=" +  instance.downloadSelector);
    downloadLinks(instance.downloadSelector, instance.downloadIncludes, instance.downloadLimit);
  }

  /**
   * TODO
   *
   * @param selector
   * @param includes
   * @param limit
   * @private
   */
  function downloadLinks(selector, includes, limit) {
    var links,
        link,
        url,
        a,
        i,
        length;
    links = document.querySelectorAll(selector);
    length = limit < links.length ? limit : links.length;
    console.log("links in downloadLinks=" + links);
    for (i = 0; i < length; i++) {
      link = links[i];
      url = link.src ? link.src : link.href ? link.href : "";
      if (url && includes && url.includes(includes)) {
        a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", "");
        console.log("about to download!!! a is =" + a);
        a.click();
      }
    }
  }

  /**
   * TODO
   *
   * @private
   */
  function downloadPage() {
    console.log("downloading the page!");
    var a;
    a = document.createElement("a");
    a.setAttribute("href", window.location.href);
    a.setAttribute("download", "");
    a.click();
  }

  // Return Public Functions
  return {
    download: download
  };
}();

// Cache items from storage and check if quick shortcuts or instance are enabled
chrome.storage.sync.get(null, function(items) {
  chrome.runtime.sendMessage({greeting: "getInstance"}, function(response) {
    URLI.Shortcuts.setItems(items);
    // Download
    if (response.instance && response.instance.enabled && response.instance.downloadEnabled) {
      URLI.Download.download(response.instance);
    }
    // Auto
    if (response.instance && response.instance.enabled && response.instance.autoEnabled) {
      // Subtract from autoTimes and if it's still greater than 0, continue auto action, else clear the instance
      // Note: The first time auto is done via chrome.runtime.onMessage.addListener from popup, so it's already been
      // done once (thus the pre decrement instead of post decrement)
      if (--response.instance.autoTimes > 0) {
        chrome.runtime.sendMessage({greeting: "setInstance", instance: response.instance});
        URLI.Shortcuts.autoTimeout = setTimeout(function() { URLI.Shortcuts.autoPerformer(response.instance.autoAction); }, response.instance.autoSeconds * 1000);
      } else {
        chrome.runtime.sendMessage({greeting: "deleteInstance"});
        chrome.runtime.sendMessage({greeting: "closePopup"});
      }
    }
    // Key
    if (items.keyEnabled && (items.keyQuickEnabled || (response.instance && response.instance.enabled))) {
      document.addEventListener("keyup", URLI.Shortcuts.keyListener);
    }
    // Mouse
    if (items.mouseEnabled && (items.mouseQuickEnabled || (response.instance && response.instance.enabled))) {
      document.addEventListener("mouseup", URLI.Shortcuts.mouseListener);
    }
  });
});

// Listen for requests from chrome.runtime.sendMessage (Popup)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.greeting) {
    case "addKeyListener":
      document.addEventListener("keyup", URLI.Shortcuts.keyListener);
      break;
    case "removeKeyListener":
      document.removeEventListener("keyup", URLI.Shortcuts.keyListener);
      break;
    case "addMouseListener":
      document.addEventListener("mouseup", URLI.Shortcuts.mouseListener);
      break;
    case "removeMouseListener":
      document.removeEventListener("mouseup", URLI.Shortcuts.mouseListener);
      break;
    case "setAutoTimeout":
      URLI.Shortcuts.autoTimeout = setTimeout(function() { URLI.Shortcuts.autoPerformer(request.instance.autoAction); }, request.instance.autoSeconds * 1000);
      break;
    case "clearAutoTimeout":
      clearTimeout(URLI.Shortcuts.autoTimeout);
      break;
    default:
      break;
  }
  sendResponse({});
});