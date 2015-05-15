// TODO

console.log("URLNP.Shortcuts");

/**
 * URL Next Plus Shortcuts.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */ 
var URLNP = URLNP || {};
URLNP.Shorcuts = URLNP.Shortcuts || function () {

  var	FLAG_KEY_ALT = 0x1, // 0001
  		FLAG_KEY_CTRL = 0x2, // 0010
  		FLAG_KEY_SHIFT = 0x4, // 0100
  		FLAG_KEY_META = 0x8, // 1000
  		keyNext, // cached key from storage
  		keyPrev, // cached key from storage
  		keyClear, // cached key from storage
  		keyQuickNext, // cached key from storage
  		keyQuickPrev; // cached key from storage

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
  	if (keyPressed(event, keyNext)) { console.log("\tpressed next key"); chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", direction: "Next"}); }
  	else if (keyPressed(event, keyPrev)) { console.log("\tpressed prev key"); chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", direction: "Prev"}); }
  	else if (keyPressed(event, keyClear)) { console.log("\tpressed clear key"); chrome.runtime.sendMessage({greeting: "clearUrli"}); }
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
  	if (keyPressed(event, keyQuickNext)) { console.log("\tpressed quick next key"); chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "Next"}); }
  	else if (keyPressed(event, keyQuickPrev)) { console.log("\tpressed quick prev key"); chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "Prev"}); }
  }
 
  /**
   * Checks if the key was pressed by using the flags (bitmasks) and comparing
   * them against the keydown event using bitwise operators.
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
  
  // Return Public Methods
  return {
  	keyListener: keyListener,
  	keyQuickListener: keyQuickListener
  };
}();

// Cache shortcuts from storage
chrome.storage.sync.get(null, function (o) {
	var U = URLNP.Shortcuts;
	U.keyNext = o.keyNext;
	U.keyPrev = o.keyPrev;
	U.keyClear = o.keyClear;
	U.keyQuickNext = o.keyQuickNext;
	U.keyQuickPrev = o.keyQuickPrev;
  if (o.keyQuickEnabled) {
    document.addEventListener("keydown", U.keyQuickListener, false);
  }
});

// Listen for requests from chrome.runtime.sendMessage
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		switch (request.greeting) {
			case "addKeyListener": // From ?
				console.log("!request.greeting='addKeyListener'");
				document.addEventListener("keydown", URLNP.Shortcuts.keyListener, false);
				sendResponse({});
				break;
			case "removeKeyListener": // From ?
				console.log("!request.greeting='removeKeyListener'");
				document.removeEventListener("keydown", URLNP.Shortcuts.keyListener, false);
				sendResponse({});
				break;
			default: // Unspecified request
				console.warn("!request.greeting is unspecified");
				sendResponse({});
				break;
		}
	}
);