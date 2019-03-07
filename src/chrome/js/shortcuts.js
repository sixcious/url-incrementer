/**
 * URL Incrementer
 * @file shortcuts.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Shortcuts = Shortcuts || (() => {

  // KeyboardEvent.key and modifier bits map
  const KEY_MODIFIERS = new Map([["Alt",0x1],["Control",0x2],["Shift",0x4],["Meta",0x8]]);

  // The current mouse button on mousedown
  // A boolean flag indicating if the right + left mouse buttons are clicked simultaneously (needed between mousedown and up)
  // The current consecutive click count for a single mouse button
  // A reusable global timeouts for detecting multiple mouse clicks
  // The storage items cache
  let button = undefined,
      buttons3 = false,
      clicks = 0,
      timeouts = {},
      items = {};

  /**
   * Sets the items storage cache.
   *
   * @param items_ the storage items
   * @private
   */
  function setItems(items_) {
    items = items_;
  }

  /**
   * A keyup event listener for keyboard shortcuts.
   *
   * @param event the keyup event
   * @private
   */
  function keyupListener(event) {
    console.log("keyupListener() - event.code=" + event.code + ", event.target=" + event.target);
    if (items.shortcutsEditableDisabled && isElementEditable(event.target)) {
      return;
    }
    if      (keyPressed(event, items.keyIncrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "increment", "shortcut": "key"}); }
    else if (keyPressed(event, items.keyDecrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement", "shortcut": "key"}); }
    else if (keyPressed(event, items.keyNext))      { chrome.runtime.sendMessage({greeting: "performAction", action: "next",      "shortcut": "key"}); }
    else if (keyPressed(event, items.keyPrev))      { chrome.runtime.sendMessage({greeting: "performAction", action: "prev",      "shortcut": "key"}); }
    else if (keyPressed(event, items.keyClear))     { chrome.runtime.sendMessage({greeting: "performAction", action: "clear",     "shortcut": "key"}); }
    else if (keyPressed(event, items.keyReturn))    { chrome.runtime.sendMessage({greeting: "performAction", action: "return",    "shortcut": "key"}); }
    else if (keyPressed(event, items.keyAuto))      { chrome.runtime.sendMessage({greeting: "performAction", action: "auto",      "shortcut": "key"}); }
    else if (keyPressed(event, items.keyDownload))  { chrome.runtime.sendMessage({greeting: "performAction", action: "download",  "shortcut": "key"}); }
  }

  /**
   * A mousedown event listener that determines if event.buttons = 3 and stores event.button for the mouseup listener.
   *
   * @param event the mousedown event
   * @private
   */
  function mousedownListener(event) {
    clearTimeout(timeouts.mouseup2);
    if (event.buttons === 3) {
      buttons3 = true;
      // Avoid selecting text with preventDefault()
      event.preventDefault();
    } else {
      buttons3 = false;
    }
    button = event.button;
    console.log("mousedownListener() - event.buttons=" + event.buttons + ", buttons3=" + buttons3);
  }

  /**
   * A mouseup event listener for mouse button shortcuts.
   *
   * @param event the mouseup event
   * @private
   */
  function mouseupListener(event) {
    if (items.shortcutsEditableDisabled && isElementEditable(event.target)) {
      return;
    }
    clearTimeout(timeouts.mouseup);
    if (event.button === button) {
      clicks++;
      timeouts.mouseup = setTimeout(function() {
        console.log("mouseupListener() - timeouts.mouseup resetting clicks");
        clicks = 0; }, items.mouseClickSpeed);
    } else {
      clicks = 0;
    }
    console.log("mouseupListener() - event.button=" + event.button + ", event.buttons=" + event.buttons + ", button=" + button + ", clicks=" + clicks);
    if      (mousePressed(event, items.mouseIncrement)) { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "increment", "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseDecrement)) { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement", "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseNext))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "next",      "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mousePrev))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "prev",      "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseClear))     { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "clear",     "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseReturn))    { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "return",    "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseAuto))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "auto",      "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseDownload))  { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "download",  "shortcut": "mouse"}); }, items.mouseClickSpeed); }
  }

  /**
   * A contextmenu event listener that disables the context menu from showing if event.buttons = 3.
   *
   * @param event the contextmenu event
   * @returns {boolean} false if event.buttons = 3, true otherwise
   * @private
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
   * Determines if an element is editable by checking if it's isContentEditable (also takes care of document.designMode)
   * or if the node is an INPUT, TEXTAREA, or SELECT.
   *
   * @param element the element
   * @private
   */
  function isElementEditable(element) {
    let editable = false;
    const name = element && element.nodeName ? element.nodeName.toUpperCase() : "";
    if ((element && element.isContentEditable) || (name === "INPUT" || name === "TEXTAREA" || name === "SELECT")) {
      console.log("isElementEditable() - isContentEditable=" + element.isContentEditable + ", nodeName=" + name);
      editable = true;
    }
    return editable;
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
      (!(event.altKey   ^ (key.modifiers & KEY_MODIFIERS.get("Alt"))         ) &&
       !(event.ctrlKey  ^ (key.modifiers & KEY_MODIFIERS.get("Control")) >> 1) &&
       !(event.shiftKey ^ (key.modifiers & KEY_MODIFIERS.get("Shift"))   >> 2) &&
       !(event.metaKey  ^ (key.modifiers & KEY_MODIFIERS.get("Meta"))    >> 3));
  }

  /**
   * Checks if the mouse button was pressed. There are three possibilities:
   * #3 (Right) Left or #4 (Left) Right or #0-2 Single Button
   * If either of the three matches and the current click count matches, the button was pressed.
   *
   * @param event the mouse event
   * @param mouse the action mouse button to check (e.g. increment shortcut mouse button)
   * @returns {boolean} true if the mouse button event matches the action mouse button, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    return mouse && ((buttons3 && mouse.button === 3 && event.button === 0) || (buttons3 && mouse.button === 4 && event.button === 2) || (mouse.button <= 2 && event.button === mouse.button)) && mouse.clicks === clicks;
  }

  /**
   * Adds the key listeners.
   *
   * @private
   */
  function addKeyListener() {
    removeKeyListener();
    document.addEventListener("keyup", keyupListener);
  }

  /**
   * Removes the key listeners.
   *
   * @private
   */
  function removeKeyListener() {
    document.removeEventListener("keyup", keyupListener);
  }

  /**
   * Adds the mouse listeners.
   *
   * @private
   */
  function addMouseListener() {
    removeMouseListener();
    document.addEventListener("mousedown", mousedownListener);
    document.addEventListener("mouseup", mouseupListener);
    document.addEventListener("contextmenu", contextmenuListener);
  }

  /**
   * Removes the mouse listeners.
   *
   * @private
   */
  function removeMouseListener() {
    document.removeEventListener("mousedown", mousedownListener);
    document.removeEventListener("mouseup", mouseupListener);
    document.removeEventListener("contextmenu", contextmenuListener);
  }

  // Content Script starts by getting storage and adding key and mouse listeners if key or mouse are enabled (quick/enabled/saved urls are handled later by background)
  chrome.storage.local.get(null, function(items) {
    if (items.permissionsInternalShortcuts) {
      setItems(items);
      if (items.keyEnabled) {
        addKeyListener();
      }
      if (items.mouseEnabled) {
        addMouseListener();
      }
      // Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("messageListener() - request.greeting=" + request.greeting);
        switch (request.greeting) {
          case "addKeyListener": addKeyListener(); break;
          case "removeKeyListener": removeKeyListener(); break;
          case "addMouseListener": addMouseListener(); break;
          case "removeMouseListener": removeMouseListener(); break;
        }
      });
    }
  });

  console.log("shortcuts.js content script executed");

})();