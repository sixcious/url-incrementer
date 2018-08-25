/**
 * URL Incrementer Shortcuts
 * 
 * @author Roy Six
 * @namespace
 */


//if (window.URLI && window.URLI.Shortcuts) { return; }

var URLI = URLI || {};

URLI.Shortcuts = function () {

  const FLAG_KEY_ALT   = 0x1, // 0001
        FLAG_KEY_CTRL  = 0x2, // 0010
        FLAG_KEY_SHIFT = 0x4, // 0100
        FLAG_KEY_META  = 0x8, // 1000
        MOUSE_CLICK_SPEED = 400;

  let clicks = 0,
      clicks2 = 0,
      button = undefined,
      timeout,
      timeout2,
      timeouts = {}, // Reusable global timeouts for input changes to fire after the user stops typing
      timeout2Active = false,
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
   * A key up event listener for keyboard shortcuts.
   * Listens for increment, decrement, next, prev, clear, return, and auto keyboard shortcuts.
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
    else if (keyPressed(event, items_.keyReturn))    { chrome.runtime.sendMessage({greeting: "performAction", action: "return"}); }
    else if (keyPressed(event, items_.keyAuto))      { chrome.runtime.sendMessage({greeting: "performAction", action: "auto"}); }
  }

  /**
   * A mouse up event listener for mouse button shortcuts.
   * Listens for increment, decrement, next, prev, clear, return, and auto mouse button shortcuts.
   * 
   * @param event the mouse button event
   * @public
   */
  function mouseListener(event) {
    if (timeout2Active) {
      event.preventDefault();
    }
    mouseHandler(event);
    if      (mousePressed(event, items_.mouseIncrement)) { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "increment"}); }, MOUSE_CLICK_SPEED); }
    else if (mousePressed(event, items_.mouseDecrement)) { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement"}); }, MOUSE_CLICK_SPEED); }
    else if (mousePressed(event, items_.mouseNext))      { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "next"}); }, MOUSE_CLICK_SPEED); }
    else if (mousePressed(event, items_.mousePrev))      { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "prev"}); }, MOUSE_CLICK_SPEED); }
    else if (mousePressed(event, items_.mouseClear))     { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "clear"}); }, MOUSE_CLICK_SPEED); }
    else if (mousePressed(event, items_.mouseReturn))    { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "return"}); }, MOUSE_CLICK_SPEED); }
    else if (mousePressed(event, items_.mouseAuto))      { timeout = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "auto"}); }, MOUSE_CLICK_SPEED); }
  }

  function mouseDownListener(event) {
    mouseDownHandler(event);
    if      (mouseDownPressed(event, items_.mouseIncrement)) { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "increment"}); }, MOUSE_CLICK_SPEED); }
    else if (mouseDownPressed(event, items_.mouseDecrement)) { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement"}); }, MOUSE_CLICK_SPEED); }
    else if (mouseDownPressed(event, items_.mouseNext))      { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "next"}); }, MOUSE_CLICK_SPEED); }
    else if (mouseDownPressed(event, items_.mousePrev))      { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "prev"}); }, MOUSE_CLICK_SPEED); }
    else if (mouseDownPressed(event, items_.mouseClear))     { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "clear"}); }, MOUSE_CLICK_SPEED); }
    else if (mouseDownPressed(event, items_.mouseReturn))    { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "return"}); }, MOUSE_CLICK_SPEED); }
    else if (mouseDownPressed(event, items_.mouseAuto))      { timeout2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "auto"}); }, MOUSE_CLICK_SPEED); }
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
    console.log("URLI.Shortcuts.keyPressed() - event.code=" + event.code + ", actionKey=" + key);
    return key && event.code === key.code &&
      (!(event.altKey   ^ (key.modifiers & FLAG_KEY_ALT)       ) &&
       !(event.ctrlKey  ^ (key.modifiers & FLAG_KEY_CTRL)  >> 1) &&
       !(event.shiftKey ^ (key.modifiers & FLAG_KEY_SHIFT) >> 2) &&
       !(event.metaKey  ^ (key.modifiers & FLAG_KEY_META)  >> 3));
  }

  /**
   * Checks if the mouse button was pressed.
   * 
   * @param event the mouse event
   * @param mouse the action mouse button to check (e.g. increment shortcut mouse button)
   * @returns {boolean} true if the mouse button event matches the action mouse button, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    //console.log("URLI.Shortcuts.mousePressed() - event.button=" + event.button + ", button=" + button + ", clicks=" + clicks); //", event.detail=" + event.detail + ", actionMouse=" + mouse);
    return mouse && event.button === mouse.button && mouse.clicks === clicks;
  }

  function mouseDownPressed(event, mouse) {
    console.log("moustdown.pressed event.buttons=" + event.buttons);
    if (mouse && event.buttons === mouse.button && mouse.clicks === clicks2) {
      timeout2Active = true;
    }/* else {
      timeout2Active = false;
    }*/
    return mouse && event.buttons === mouse.button && mouse.clicks === clicks2;
  }


  function mouseHandler(event) {
    clearTimeout(timeout);
    if (button === event.button || button === undefined) {
      clicks++;
      timeout = setTimeout(function() { console.log("clearing clicks!"); clicks = 0; }, MOUSE_CLICK_SPEED);
    } else {
      clicks = 0;
    }
    console.log("URLI.Shortcuts.mouseHandler() - event.button=" + event.button + ", button=" + button + ", clicks=" + clicks);
    button = event.button;
  }

  function mouseDownHandler(event) {
    clearTimeout(timeout2);
    console.log("mouseDown() event.buttons=" + event.buttons + ", clicks2=" + clicks2);
    if (event.buttons === 3) {
      event.preventDefault();
      timeout2Active = true;
      clicks2++;
      timeout2 = setTimeout(function () {console.log("clearing clicks2!"); clicks2 = 0; }, MOUSE_CLICK_SPEED);
    } else {
      clicks2 = 0;
      timeout2Active = false;
    }
  }

  function contextMenuListener(event) {

    if (timeout2Active) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }



  // Return Public Functions
  return {
    setItems: setItems,
    keyListener: keyListener,
    mouseListener: mouseListener,
    mouseDownListener: mouseDownListener,
    contextMenuListener: contextMenuListener
  };
}();

// Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("URLI.Shortcuts.chrome.runtime.onMessage() - request.greeting=" + request.greeting);
  switch (request.greeting) {
    case "setItems":
      URLI.Shortcuts.setItems(request.items);
      break;
    case "addKeyListener":
      document.addEventListener("keyup", URLI.Shortcuts.keyListener);
      break;
    case "removeKeyListener":
      document.removeEventListener("keyup", URLI.Shortcuts.keyListener);
      break;
    case "addMouseListener":
      document.addEventListener("mouseup", URLI.Shortcuts.mouseListener);
      document.addEventListener("mousedown", URLI.Shortcuts.mouseDownListener);
      document.addEventListener("contextmenu", URLI.Shortcuts.contextMenuListener);
      break;
    case "removeMouseListener":
      document.removeEventListener("pointerup", URLI.Shortcuts.mouseListener);
      break;
    default:
      break;
  }
  sendResponse({});
});

// Content Script starts by sending a message to check if internal shortcuts should be enabled (e.g. quick shortcuts, saved url, enabled instance)
chrome.runtime.sendMessage({greeting: "checkInternalShortcuts"});