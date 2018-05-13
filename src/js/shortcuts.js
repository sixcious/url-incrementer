/**
 * URL Incrementer Shortcuts
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Shortcuts = URLI.Shortcuts || function () {

  var FLAG_KEY_ALT = 0x1, // 0001
      FLAG_KEY_CTRL = 0x2, // 0010
      FLAG_KEY_SHIFT = 0x4, // 0100
      FLAG_KEY_META = 0x8, // 1000
      FLAG_MOUSE_LEFT = 0x0, // 00
      FLAG_MOUSE_MIDDLE = 0x1, // 01
      FLAG_MOUSE_RIGHT = 0x2, // 10
      KEY_MODIFIER_STRING_MAP = { // Map for key codes that should be checked since they are also event modifiers
        "ShiftLeft":   "Shift", "ShiftRight":   "Shift",
        "ControlLeft": "Ctrl",  "ControlRight": "Ctrl",
        "AltLeft":     "Alt",   "AltRight":     "Alt",
        "MetaLeft":    "Meta",  "MetaRight":    "Meta"
      },
      items_ = {}; // storage items cache

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
   * A key event listener for keyboard shortcuts.
   * 
   * Listens for increment, decrement, next, prev, and clear keyboard shortcuts.
   * 
   * @param event the key event
   * @public
   */
  function keyListener(event) {
    if      (keyPressed(event, items_.keyIncrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "increment"}); }
    else if (keyPressed(event, items_.keyDecrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement"}); }
    else if (keyPressed(event, items_.keyNext))      { chrome.runtime.sendMessage({greeting: "performAction", action: "next"}); }
    else if (keyPressed(event, items_.keyPrev))      { chrome.runtime.sendMessage({greeting: "performAction", action: "prev"}); }
    else if (keyPressed(event, items_.keyClear))     { chrome.runtime.sendMessage({greeting: "performAction", action: "clear"}); }
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
    if      (mousePressed(event, items_.mouseIncrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "increment"}); }
    else if (mousePressed(event, items_.mouseDecrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement"}); }
    else if (mousePressed(event, items_.mouseNext))      { chrome.runtime.sendMessage({greeting: "performAction", action: "next"}); }
    else if (mousePressed(event, items_.mousePrev))      { chrome.runtime.sendMessage({greeting: "performAction", action: "prev"}); }
    else if (mousePressed(event, items_.mouseClear))     { chrome.runtime.sendMessage({greeting: "performACtion", action: "clear"}); }
  }

  /**
   * Checks if the key was pressed by comparing the event against the flags 
   * using bitwise operators and checking if the key code matches.
   * 
   * @param event the key event
   * @param key the key to check
   * @return boolean true if the key event matches the key, false otherwise
   * @private
   */
  function keyPressed(event, key) {
    return (key && key.length !== 0 && (
      (key[0] && KEY_MODIFIER_STRING_MAP[key[1]]) || (
        !(event.altKey   ^ (key[0] & FLAG_KEY_ALT)       ) &&
        !(event.ctrlKey  ^ (key[0] & FLAG_KEY_CTRL)  >> 1) &&
        !(event.shiftKey ^ (key[0] & FLAG_KEY_SHIFT) >> 2) &&
        !(event.metaKey  ^ (key[0] & FLAG_KEY_META)  >> 3))) &&
      (event.code === key[1])
    );
  }

  /**
   * Checks if the mouse button was pressed by comparing the event against the
   * flags.
   * 
   * @param event the mouse event
   * @param mouse the mouse button to check
   * @return boolean true if the mouse button event matches the mouse, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    return (mouse !== -1 &&
      (event.button === FLAG_MOUSE_LEFT   && mouse === FLAG_MOUSE_LEFT) ||
      (event.button === FLAG_MOUSE_MIDDLE && mouse === FLAG_MOUSE_MIDDLE) ||
      (event.button === FLAG_MOUSE_RIGHT  && mouse === FLAG_MOUSE_RIGHT)
    );
  }

  // Return Public Functions
  return {
    setItems: setItems,
    keyListener: keyListener,
    mouseListener: mouseListener
  };
}();

// Content Script Start: Cache items from storage and check if quick shortcuts or instance are enabled
chrome.storage.sync.get(null, function(items) {
  chrome.runtime.sendMessage({greeting: "getInstance"}, function(response) {
    URLI.Shortcuts.setItems(items);
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

// Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
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
    default:
      break;
  }
  sendResponse({});
});