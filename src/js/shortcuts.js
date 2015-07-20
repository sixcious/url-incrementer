/**
 * URL Plus Shortcuts
 * 
 * @author Roy Six
 * @namespace
 */
var URLP = URLP || {};
URLP.Shortcuts = URLP.Shortcuts || function () {

  var FLAG_KEY_ALT = 0x1, // 0001
      FLAG_KEY_CTRL = 0x2, // 0010
      FLAG_KEY_SHIFT = 0x4, // 0100
      FLAG_KEY_META = 0x8, // 1000
      FLAG_MOUSE_LEFT = 0x1, // 01
      FLAG_MOUSE_MIDDLE = 0x2, // 10
      FLAG_MOUSE_RIGHT = 0X3, // 11
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
   * Listens for plus, minus, next, prev, and clear keyboard shortcuts.
   * 
   * @param event the key event
   * @public
   */
  function keyListener(event) {
    if      (keyPressed(event, items_.keyPlus))  { chrome.runtime.sendMessage({greeting: "updateTab", action: "plus", items: items_}); }
    else if (keyPressed(event, items_.keyMinus)) { chrome.runtime.sendMessage({greeting: "updateTab", action: "minus", items: items_}); }
    else if (keyPressed(event, items_.keyNext))  { chrome.runtime.sendMessage({greeting: "updateTab", action: "next", items: items_}); }
    else if (keyPressed(event, items_.keyPrev))  { chrome.runtime.sendMessage({greeting: "updateTab", action: "prev", items: items_}); }
    else if (keyPressed(event, items_.keyClear)) { chrome.runtime.sendMessage({greeting: "setInstance", instance: undefined}); if (!items_.keyQuickEnabled) { document.removeEventListener("keyup", keyListener); } if (!items_.mouseQuickEnabled) { document.removeEventListener("mouseup", mouseListener); } }
  }

  /**
   * A mouse event listener for mouse button shortcuts.
   * 
   * Listens for plus, minus, next, prev, and clear mouse button shortcuts.
   * 
   * @param event the mouse button event
   * @public
   */
  function mouseListener(event) {
    if      (mousePressed(event, items_.mousePlus))  { chrome.runtime.sendMessage({greeting: "updateTab", action: "plus", items: items_}); }
    else if (mousePressed(event, items_.mouseMinus)) { chrome.runtime.sendMessage({greeting: "updateTab", action: "minus", items: items_}); }
    else if (mousePressed(event, items_.mouseNext))  { chrome.runtime.sendMessage({greeting: "updateTab", action: "next", items: items_}); }
    else if (mousePressed(event, items_.mousePrev))  { chrome.runtime.sendMessage({greeting: "updateTab", action: "prev", items: items_}); }
    else if (mousePressed(event, items_.mouseClear)) { chrome.runtime.sendMessage({greeting: "setInstance", instance: undefined}); if (!items_.keyQuickEnabled) { document.removeEventListener("keyup", keyListener); } if (!items_.mouseQuickEnabled) { document.removeEventListener("mouseup", mouseListener); } }
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
    return (key && key.length !== 0 &&
      !(event.altKey   ^ (key[0] & FLAG_KEY_ALT)       ) &&
      !(event.ctrlKey  ^ (key[0] & FLAG_KEY_CTRL)  >> 1) &&
      !(event.shiftKey ^ (key[0] & FLAG_KEY_SHIFT) >> 2) &&
      !(event.metaKey  ^ (key[0] & FLAG_KEY_META)  >> 3) &&
      (event.keyCode === key[1])
    );
  }

  /**
   * Checks if the mouse button was pressed by comparing the event against the
   * flags.
   * 
   * @param event the mouse event
   * @param mouse the mouse button to check
   * @returns true if the mouse button event matches the mouse, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    return (mouse && mouse !== 0 &&
      (event.which === FLAG_MOUSE_LEFT   && mouse === FLAG_MOUSE_LEFT) ||
      (event.which === FLAG_MOUSE_MIDDLE && mouse === FLAG_MOUSE_MIDDLE) ||
      (event.which === FLAG_MOUSE_RIGHT  && mouse === FLAG_MOUSE_RIGHT)
    );
  }

  // Return Public Functions
  return {
    setItems: setItems,
    keyListener: keyListener,
    mouseListener: mouseListener
  };
}();

// Cache items from storage and check if quick shortcuts or instance are enabled
chrome.storage.sync.get(null, function(items) {
  chrome.runtime.sendMessage({greeting: "getInstance"}, function(response) {
    URLP.Shortcuts.setItems(items);
    if (items.keyEnabled && (items.keyQuickEnabled || (response.instance && response.instance.enabled))) {
      document.addEventListener("keyup", URLP.Shortcuts.keyListener);
    }
    if (items.mouseEnabled && (items.mouseQuickEnabled || (response.instance && response.instance.enabled))) {
      document.addEventListener("mouseup", URLP.Shortcuts.mouseListener);
    }
  });
});

// Listen for requests from chrome.runtime.sendMessage (Popup)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.greeting) {
    case "addKeyListener":
      document.addEventListener("keyup", URLP.Shortcuts.keyListener);
      break;
    case "removeKeyListener":
      document.removeEventListener("keyup", URLP.Shortcuts.keyListener);
      break;
    case "addMouseListener":
      document.addEventListener("mouseup", URLP.Shortcuts.mouseListener);
      break;
    case "removeMouseListener":
      document.removeEventListener("mouseup", URLP.Shortcuts.mouseListener);
      break;
    default:
      break;
  }
  sendResponse({});
});