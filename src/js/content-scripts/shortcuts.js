/**
 * TODO
 */ 

console.log("shortcuts.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * TODO
 */ 
URLNP.Shortcuts = URLNP.Shortcuts || function() {

  console.log("function URLNP.Shortcuts");
  
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
   * @param event
   * @public
   */
  keyListener = function (event) {
  	console.log("function keyListener");
  	if (keyPressed(event, keyNext)) { console.log("\tpressed next key"); chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", direction: "Next"}, function() {}); }
  	else if (keyPressed(event, keyPrev)) { console.log("\tpressed prev key"); chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", direction: "Prev"}, function() {}); }
  	else if (keyPressed(event, keyClear)) { console.log("\tpressed clear key"); chrome.runtime.sendMessage({greeting: "clearUrli"}, function() {}); }
  };
    
  /**
   * @param event
   * @public
   */
  quickKeyListener = function (event) {
  	console.log("\tfunction fastKeyListener");
  	if (keyPressed(event, keyQuickNext)) { console.log("\tpressed quick next key"); chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "Next"}, function() {}); }
  	else if (keyPressed(event, keyQuickPrev)) { console.log("\tpressed quick prev key"); chrome.runtime.sendMessage({greeting: "quickUpdateTab", direction: "Prev"}, function() {}); }
  };
    
  /**
   * @param event
   * @param key
   * @private
   */
  keyPressed = function(event, key) {
    return (
      !(event.altKey   ^ (key[0] & FLAG_KEY_ALT)       ) &&
      !(event.ctrlKey  ^ (key[0] & FLAG_KEY_CTRL)  >> 1) &&
      !(event.shiftKey ^ (key[0] & FLAG_KEY_SHIFT) >> 2) &&
      !(event.metaKey  ^ (key[0] & FLAG_KEY_META)  >> 3) &&
       (event.keyCode === key[1])
    );
  };

  return {
  	keyListener: keyListener,
  	quickKeyListener: quickKeyListener
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
    document.addEventListener("keydown", U.quickKeyListener, false);
  }
});

// Send a request to the background to check if fast shortcuts are enabled.
chrome.runtime.sendMessage({greeting: "checkIfFastIsEnabled"}, function () {});

// Listen for requests from chrome.runtime.sendMessage.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		var U = URLNP.Shortcuts;
		switch (request.greeting) {
			// From:      background
			// Request:   Keys are enabled in options and user clicked accept button in popup form or enabled keys in options.
			// Action:    Add a keyListener.
			// Callback:  None.
			case "addKeyListener":
				console.log("\t!request:addKeyListener");
				document.addEventListener("keydown", U.keyListener, false);
				sendResponse({});
				break;

			// From:      background
			// Request:   User clicked the Clear button from popup or disabled keys in options.
			// Action:    Remove the keyListener.
			// Callback:  None.
			case "removeKeyListener":
				console.log("\t!request:removeKeyListener");
				document.removeEventListener("keydown", U.keyListener, false);
				sendResponse({});
				break;
				
			// ?
			case "addFastKeyListener":
				console.log("\t!request:addFastKeyListener");
				document.addEventListener("keydown", U.quickKeyListener, false);
				sendResponse({});
				break;

			// ?
			case "removeFastKeyListener":
				console.log("\t!request:removeFastKeyListener");
				document.removeEventListener("keydown", U.quickKeyListener, false);
				sendResponse({});
				break;
				
			// Unspecified request -- should not be needed!
			default:
				console.warn("!request:unspecified");
				sendResponse({});
				break;

			//// From:      background
			//// Request:   Just enabled urlnp or the user saved options.
			//// Action:    Set the keys to the user-defined keyCodes/keyEvents from localStorage.
			//// Callback:  None.
            //
			//case "setKeys":
			//	console.log("\t!request:setKeys");
			//	U.setKeyCodeIncrement(parseInt(request.keyCodeIncrement));
			//	U.setKeyEventIncrement(parseInt(request.keyEventIncrement));
			//	U.setKeyCodeDecrement(parseInt(request.keyCodeDecrement));
			//	U.setKeyEventDecrement(parseInt(request.keyEventDecrement));
			//	U.setKeyCodeClear(parseInt(request.keyCodeClear));
			//	U.setKeyEventClear(parseInt(request.keyEventClear));
			//	sendResponse({});
			//	break;

		// 	// From:      background
		// 	// Request:   Mouse is enabled in options and user clicked accept button in popup form or enabled mouse in options.
		// 	// Action:    Add a mouseListener.
		// 	// Callback:  None.

		// 	case "addMouseListener":
		// 		console.log("\t!request:addMouseListener");
		// 		document.addEventListener("mousedown", U.mouseListener, false); // window.addEventListener(...) works too.
		// 		sendResponse({});
		// 		break;

		// 	// From:      background
		// 	// Request:   User clicked the Clear button from popup or disabled mouse in options.
		// 	// Action:    Remove the mouseListener.
		// 	// Callback:  None.

		// 	case "removeMouseListener":
		// 		console.log("\t!request:removeMouseListener");
		// 		document.removeEventListener("mousedown", U.mouseListener, false); // window.removeEventListener(...) works too.
		// 		sendResponse({});
		// 		break;

			//// From:      background
			//// Request:   Just enabled urlnp or the user saved options.
			//// Action:    Set the mouse buttons to the user-defined mouse codes from localStorage.
			//// Callback:  None.
            //
			//case "setMouse":
			//	console.log("\t!request:setMouse");
			//	U.setMouseIncrement(parseInt(request.mouseIncrement));
			//	U.setMouseDecrement(parseInt(request.mouseDecrement));
			//	U.setMouseClear(parseInt(request.mouseClear));
			//	sendResponse({});
			//	break;



		// 	//// ?
  //           //
		// 	//case "setFastKeys":
		// 	//	console.log("\t!request:setFastKeys");
		// 	//	U.setKeyCodeFastIncrement(parseInt(request.keyCodeFastIncrement));
		// 	//	U.setKeyEventFastIncrement(parseInt(request.keyEventFastIncrement));
		// 	//	U.setKeyCodeFastDecrement(parseInt(request.keyCodeFastDecrement));
		// 	//	U.setKeyEventFastDecrement(parseInt(request.keyEventFastDecrement));
		// 	//	break;

		// 	// ?

		// 	case "addFastMouseListener":
		// 		console.log("\t!request:addFastMouseListener");
		// 		document.addEventListener("mousedown", U.fastMouseListener, false);
		// 		sendResponse({});
		// 		break;

		// 	// ?

		// 	case "removeFastMouseListener":
		// 		console.log("\t!request:removeFastMouseListener");
		// 		document.removeEventListener("mousedown", U.fastMouseListener, false);
		// 		sendResponse({});
		// 		break;

			//// ?
            //
			//case "setFastMouse":
			//	console.log("\t!request:setFastMouse");
			//	U.setMouseFastIncrement(parseInt(request.mouseFastIncrement));
			//	U.setMouseFastDecrement(parseInt(request.mouseFastDecrement));
			//	sendResponse({});
			//	break;


		}
		return true;
	}
);