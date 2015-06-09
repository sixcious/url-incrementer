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
      items = {};
      // keys = []; // keys [0:Next, 1:Prev, 2:Clear, 3:QuickNext, 4:QuickPrev]

  /**
   * Sets the items from storage. This function is needed because the keys var
   * is private and cannot be set outside.
   * 
   * @param items the storage items
   * @public
   */
  function setItems(items) {
    //keys = [items.keyNext, items.keyPrev, items.keyClear, items.keyQuickNext, items.keyQuickPrev];
    this.items = items;
  }
  
  /**
   * A keydown event listener for regular keyboard shortcuts.
   * Listens for next, prev, and clear keyboard shortcuts.
   * This listener is added after the instance is enabled (on the popup).
   * 
   * @param event the keydown event
   * @public
   */
  function keyListener(event) {
    console.log("keyListener(event)");
    if (keyPressed(event, items.keyNext)) { console.log("\tpressed next key"); chrome.runtime.sendMessage({greeting: "updateTab", direction: "next"}); }
    else if (keyPressed(event, items.keyPrev)) { console.log("\tpressed prev key"); chrome.runtime.sendMessage({greeting: "updateTab", direction: "prev"}); }
    else if (keyPressed(event, items.keyClear)) { console.log("\tpressed clear key"); chrome.runtime.sendMessage({greeting: "setInstance", instance: undefined}); }
  }

  /**
   * A keydown event listener for quick keyboard shortcuts.
   * Listens for quick next and quick prev keyboard shortcuts.
   * This listener is added if quick keys are enabled in storage (via options).
   * 
   * @param event the keydown event
   * @public
   */
  function keyQuickListener(event) {
    console.log("keyQuickListener(event)");
    if (keyPressed(event, items.keyQuickNext)) { console.log("\tpressed quick next key"); chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "next"}); }
    else if (keyPressed(event, items.keyQuickPrev)) { console.log("\tpressed quick prev key"); chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "prev"}); }
  }

  /**
   * Checks if the key was pressed by comparing the event against the flags 
   * using bitwise operators and checking if the keyCode matches.
   * 
   * @param event the keydown event
   * @param key the key to check
   * @returns true if the keydown event (press) matches the key, false otherwise
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
    document.addEventListener("keydown", URLNP.Shortcuts.keyQuickListener, false);
  }
  if (items.keyEnabled) {
    chrome.runtime.sendMessage({greeting: "getInstance", function(response) {
      if (response.instance.enabled) {
        document.addEventListener("keydown", URLNP.Shortcuts.keyListener, false);
      }
    }}); 
  }
});

// Listen for requests from chrome.runtime.sendMessage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("!request.greeting=" + request.greeting);
    switch (request.greeting) {
      case "addKeyListener":
        document.addEventListener("keydown", URLNP.Shortcuts.keyListener, false);
        break;
      case "removeKeyListener":
        document.removeEventListener("keydown", URLNP.Shortcuts.keyListener, false);
        break;
      default:
        break;
    }
    sendResponse({});
  }
);