/**
 * URL Incrementer
 * @file shortcut.js - internal shortcuts content script
 * @author Roy Six
 * @license LGPL-3.0
 */

var URLI = URLI || {};

URLI.Shortcuts = URLI.Shortcuts || function () {

  const FLAG_KEY_ALT   = 0x1, // 0001
        FLAG_KEY_CTRL  = 0x2, // 0010
        FLAG_KEY_SHIFT = 0x4, // 0100
        FLAG_KEY_META  = 0x8; // 1000

  let button = undefined, // the current mouse button on mousedown
      buttons3 = false, // boolean flag indicating if the right + left mouse buttons are clicked simultaneously
      clicks = 0, // current consecutive click count for a single mouse button
      timeouts = {}, // reusable global timeouts for detecting multiple mouse clicks
      items = {}; // storage items cache

  /**
   * Sets the items storage cache.
   *
   * @param items_ the storage items
   * @public
   */
  function setItems(items_) {
    items = items_;
  }

  /**
   * A keyup event listener for keyboard shortcuts.
   *
   * @param event the keyup event
   * @public
   */
  function keyupListener(event) {
    console.log("URLI.Shortcuts.keyupListener() - event.code=" + event.code);
    if      (keyPressed(event, items.keyIncrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "increment"}); }
    else if (keyPressed(event, items.keyDecrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement"}); }
    else if (keyPressed(event, items.keyNext))      { chrome.runtime.sendMessage({greeting: "performAction", action: "next"}); }
    else if (keyPressed(event, items.keyPrev))      { chrome.runtime.sendMessage({greeting: "performAction", action: "prev"}); }
    else if (keyPressed(event, items.keyClear))     { chrome.runtime.sendMessage({greeting: "performAction", action: "clear"}); }
    else if (keyPressed(event, items.keyReturn))    { chrome.runtime.sendMessage({greeting: "performAction", action: "return"}); }
    else if (keyPressed(event, items.keyAuto))      { chrome.runtime.sendMessage({greeting: "performAction", action: "auto"}); }
  }

  /**
   * A mouseup event listener for mouse button shortcuts.
   *
   * @param event the mouseup event
   * @public
   */
  function mouseupListener(event) {
    clearTimeout(timeouts.mouseup);
    if (event.button === button) {
      clicks++;
      timeouts.mouseup = setTimeout(function() {
        console.log("URLI.Shortcuts.mouseupListener() - timeouts.mouseup resetting clicks");
        clicks = 0; }, items.mouseClickSpeed);
    } else {
      clicks = 0;
    }
    console.log("URLI.Shortcuts.mouseupListener() - event.button=" + event.button + ", button=" + button + ", clicks=" + clicks);
    if      (mousePressed(event, items.mouseIncrement)) { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "increment"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseDecrement)) { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseNext))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "next"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mousePrev))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "prev"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseClear))     { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "clear"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseReturn))    { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "return"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseAuto))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "auto"}); }, items.mouseClickSpeed); }
  }

  /**
   * A mousedown event listener that determines if event.buttons = 3 and stores event.button for the mouseup listener.
   *
   * @param event the mousedown event
   * @public
   */
  function mousedownListener(event) {
    clearTimeout(timeouts.mouseup2);
    if (event.buttons === 3) {
      buttons3 = true;
      event.preventDefault(); // Avoid selecting text
    } else {
      buttons3 = false;
    }
    console.log("URLI.Shortcuts.mousedownListener() event.buttons=" + event.buttons + ", buttons3=" + buttons3);
    button = event.button;
  }

  /**
   * A contextmenu event listener that disables the context menu from showing if event.buttons = 3.
   *
   * @param event the contextmenu event
   * @returns {boolean} false if event.buttons = 3, true otherwise
   * @public
   */
  function contextmenuListener(event) {
    if (buttons3) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  /**
   * Checks if the key was pressed by comparing the event against the flags
   * using bitwise operators and checking if the key code matches.
   *
   * @param event the key event
   * @param key the action key to check (e.g. increment shortcut key)
   * @returns {boolean} true if the key event matches the action key, false otherwise
   * @private
   */
  function keyPressed(event, key) {
    return key && event.code === key.code &&
      (!(event.altKey   ^ (key.modifiers & FLAG_KEY_ALT)       ) &&
       !(event.ctrlKey  ^ (key.modifiers & FLAG_KEY_CTRL)  >> 1) &&
       !(event.shiftKey ^ (key.modifiers & FLAG_KEY_SHIFT) >> 2) &&
       !(event.metaKey  ^ (key.modifiers & FLAG_KEY_META)  >> 3));
  }

  /**
   * Checks if the mouse button was pressed. There are two possibilities: 1) Single or 2) (Right)+Left (buttons3).
   * If either matches and the current click count matches, the button was pressed.
   *
   * @param event the mouse event
   * @param mouse the action mouse button to check (e.g. increment shortcut mouse button)
   * @returns {boolean} true if the mouse button event matches the action mouse button, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    return mouse && (mouse.button === 3 ? buttons3 : event.button === mouse.button) && mouse.clicks === clicks;
  }

  // Return Public Functions
  return {
    setItems: setItems,
    keyupListener: keyupListener,
    mouseupListener: mouseupListener,
    mousedownListener: mousedownListener,
    contextmenuListener: contextmenuListener
  };
}();

if (!URLI.Shortcuts.contentScriptExecuted) {
  URLI.Shortcuts.contentScriptExecuted = true;
  // Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("URLI.Shortcuts.chrome.runtime.onMessage() - request.greeting=" + request.greeting);
    switch (request.greeting) {
      case "setItems":
        URLI.Shortcuts.setItems(request.items);
        break;
      case "addKeyListener":
        document.removeEventListener("keyup", URLI.Shortcuts.keyupListener);
        document.addEventListener("keyup", URLI.Shortcuts.keyupListener);
        break;
      case "removeKeyListener":
        document.removeEventListener("keyup", URLI.Shortcuts.keyupListener);
        break;
      case "addMouseListener":
        document.removeEventListener("mouseup", URLI.Shortcuts.mouseupListener);
        document.removeEventListener("mousedown", URLI.Shortcuts.mousedownListener);
        document.removeEventListener("contextmenu", URLI.Shortcuts.contextmenuListener);
        document.addEventListener("mouseup", URLI.Shortcuts.mouseupListener);
        document.addEventListener("mousedown", URLI.Shortcuts.mousedownListener);
        document.addEventListener("contextmenu", URLI.Shortcuts.contextmenuListener);
        break;
      case "removeMouseListener":
        document.removeEventListener("mouseup", URLI.Shortcuts.mouseupListener);
        document.removeEventListener("mousedown", URLI.Shortcuts.mousedownListener);
        document.removeEventListener("contextmenu", URLI.Shortcuts.contextmenuListener);
        break;
      default:
        break;
    }
    sendResponse({});
  });
  // Content Script starts by sending a message to check if internal shortcuts should be enabled (e.g. quick shortcuts, saved url, enabled instance)
  chrome.runtime.sendMessage({greeting: "checkInternalShortcuts"});
}

console.log("URLI.Shortcuts - contentScript executed");