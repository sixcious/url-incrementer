// TODO

console.log("URLNP.Shortcuts");

/**
 * URL Next Plus Shortcuts.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */
var URLNP = URLNP || {};
URLNP.Shortcuts = URLNP.Shortcuts || function () {

  var FLAG_KEY_ALT = 0x1, // 0001
      FLAG_KEY_CTRL = 0x2, // 0010
      FLAG_KEY_SHIFT = 0x4, // 0100
      FLAG_KEY_META = 0x8, // 1000
      items_ = {}; // storage items cache

  /**
   * Sets the items from storage. This function is needed because the items_ var
   * is private and cannot be set outside.
   * 
   * @param items the storage items
   * @public
   */
  function setItems(items) {
    items_ = items;
  }
  
  /**
   * A key event listener for regular keyboard shortcuts.
   * 
   * Listens for next, prev, and clear keyboard shortcuts.
   * This listener is added after discovering the tab's instance is enabled.
   * 
   * @param event the key event
   * @public
   */
  function keyListener(event) {
    console.log("keyListener(event)");
    if (keyPressed(event, items_.keyNext)) { chrome.runtime.sendMessage({greeting: "updateTab", direction: "next"}); }
    else if (keyPressed(event, items_.keyPrev)) { chrome.runtime.sendMessage({greeting: "updateTab", direction: "prev"}); }
    else if (keyPressed(event, items_.keyClear)) { chrome.runtime.sendMessage({greeting: "setInstance", instance: undefined}); }
  }

  /**
   * A key event listener for quick keyboard shortcuts.
   * 
   * Listens for quick next and quick prev keyboard shortcuts.
   * This listener is added if quick keys are enabled in storage.
   * 
   * @param event the key event
   * @public
   */
  function keyQuickListener(event) {
    console.log("keyQuickListener(event)");
    if (keyPressed(event, items_.keyQuickNext)) { chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "next", items: items_}); }
    else if (keyPressed(event, items_.keyQuickPrev)) { chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "prev", items: items_}); }
  }

  /**
   * Checks if the key was pressed by comparing the event against the flags 
   * using bitwise operators and checking if the keyCode matches.
   * 
   * @param event the key event
   * @param key the key to check
   * @returns true if the key event matches the key, false otherwise
   * @private
   */
  function keyPressed(event, key) {
    console.log("keyPressed(event, key)");
    return (
      !(event.altKey   ^ (key[0] & FLAG_KEY_ALT)       ) &&
      !(event.ctrlKey  ^ (key[0] & FLAG_KEY_CTRL)  >> 1) &&
      !(event.shiftKey ^ (key[0] & FLAG_KEY_SHIFT) >> 2) &&
      !(event.metaKey  ^ (key[0] & FLAG_KEY_META)  >> 3) &&
      (event.keyCode === key[1])
    );
  }

  // Return Public Functions
  return {
    setItems: setItems,
    keyListener: keyListener,
    keyQuickListener: keyQuickListener
  };
}();

// Cache shortcut keys from storage and check if keys or instance are enabled
chrome.storage.sync.get(null, function(items) {
  URLNP.Shortcuts.setItems(items);
  if (items.keyQuickEnabled) {
    document.addEventListener("keyup", URLNP.Shortcuts.keyQuickListener, false);
  }
  if (items.keyEnabled) {
    chrome.runtime.sendMessage({greeting: "getInstance", items: items}, function(response) {
      if (response.instance.enabled) {
        document.addEventListener("keyup", URLNP.Shortcuts.keyListener, false);
      }
    }); 
  }
});

// Listen for requests from chrome.runtime.sendMessage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("!chrome.runtime.onMessage request.greeting=\"" + request.greeting + "\" sender.id=" + sender.id);
  switch (request.greeting) {
    case "addKeyListener":
      document.addEventListener("keyup", URLNP.Shortcuts.keyListener, false);
      break;
    case "removeKeyListener":
      document.removeEventListener("keyup", URLNP.Shortcuts.keyListener, false);
      break;
    default:
      break;
  }
  sendResponse({});
});