/**
 * TODO
 */ 

console.log("shortcuts.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * TODO
 */ 
URLNP.ContentScript = URLNP.ContentScript || function() {

	console.log("function URLNP.ContentScript");
	
	var	FLAG_KEY_ALT = 0x1, // 0001
  		FLAG_KEY_CTRL = 0x2, // 0010
  		FLAG_KEY_SHIFT = 0x4, // 0100
  		FLAG_KEY_META = 0x8, // 1000
  		// Cache the shortcut keys
  		keyNext,
  		keyPrev,
  		keyClear,
  		keyQuickNext,
  		keyQuickPrev,

		//setKeyCodeIncrement = function (value) {
		//	keyCodeIncrement = value;
		//},
        //
		//setKeyEventIncrement = function (value) {
		//	keyEventIncrement = value;
		//},
        //
		//setKeyCodeDecrement = function (value) {
		//	keyCodeDecrement = value;
		//},
        //
		//setKeyEventDecrement = function (value) {
		//	keyEventDecrement = value;
		//},
        //
		//setKeyCodeClear = function (value) {
		//	keyCodeClear = value;
		//},
        //
		//setKeyEventClear = function (value) {
		//	keyEventClear = value;
		//},
        //
		//setKeyCodeFastIncrement = function (value) {
		//	keyCodeFastIncrement = value;
		//},
        //
		//setKeyEventFastIncrement = function (value) {
		//	keyEventFastIncrement = value;
		//},
        //
		//setKeyCodeFastDecrement = function (value) {
		//	keyCodeFastDecrement = value;
		//},
        //
		//setKeyEventFastDecrement = function (value) {
		//	keyEventFastDecrement = value;
		//},
        //
		//setMouseIncrement = function (value) {
		//	mouseIncrement = value;
		//},
        //
		//setMouseDecrement = function (value) {
		//	mouseDecrement = value;
		//},
        //
		//setMouseClear = function (value) {
		//	mouseClear = value;
		//},
        //
		//setMouseFastIncrement = function (value) {
		//	mouseFastIncrement = value;
		//},
        //
		//setMouseFastDecrement = function (value) {
		//	mouseFastDecrement = value;
		//},

		// When a listener is added, this function executes on each keydown event that is fired.
		keyListener = function (event) {
			console.log("\tfunction keyListener");
			// Next
			if (
				!(event.altKey   ^ (keyNext[0] & FLAG_KEY_ALT)       ) &&
				!(event.ctrlKey  ^ (keyNext[0] & FLAG_KEY_CTRL)  >> 1) &&
				!(event.shiftKey ^ (keyNext[0] & FLAG_KEY_SHIFT) >> 2) &&
				!(event.metaKey  ^ (keyNext[0] & FLAG_KEY_META)  >> 3) &&
				 (event.keyCode === keyNext[1])) {
				console.log("\t\tpressed next key");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Next"}, function() {});
			}
			// Prev
			else if (
				!(event.altKey   ^ (keyPrev[0] & FLAG_KEY_ALT)       ) &&
				!(event.ctrlKey  ^ (keyPrev[0] & FLAG_KEY_CTRL)  >> 1) &&
				!(event.shiftKey ^ (keyPrev[0] & FLAG_KEY_SHIFT) >> 2) &&
				!(event.metaKey  ^ (keyPrev[0] & FLAG_KEY_META)  >> 3) &&
				 (event.keyCode === keyPrev[1])) {
				console.log("\t\tpressed prev key");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Prev"}, function() {});
			}
			// Clear
			else if (
				!(event.altKey   ^ (keyClear[0] & FLAG_KEY_ALT)       ) &&
				!(event.ctrlKey  ^ (keyClear[0] & FLAG_KEY_CTRL)  >> 1) &&
				!(event.shiftKey ^ (keyClear[0] & FLAG_KEY_SHIFT) >> 2) &&
				!(event.metaKey  ^ (keyClear[0] & FLAG_KEY_META)  >> 3) &&
				 (event.keyCode === keyClear[1])) {
				console.log("\t\tpressed clear key");
				chrome.runtime.sendMessage({greeting: "clearUrli"}, function() {});
			}
		},
		
		/**
		 * @public
		 * @param event
		 */
		quickKeyListener = function (event) {
			console.log("\tfunction fastKeyListener");
			// Quick Next
			if (
				!(event.altKey   ^ (keyQuickNext[0] & FLAG_KEY_ALT)       ) &&
				!(event.ctrlKey  ^ (keyQuickNext[0] & FLAG_KEY_CTRL)  >> 1) &&
				!(event.shiftKey ^ (keyQuickNext[0] & FLAG_KEY_SHIFT) >> 2) &&
				!(event.metaKey  ^ (keyQuickNext[0] & FLAG_KEY_META)  >> 3) &&
				 (event.keyCode === keyQuickNext[1])) {
				console.log("\t\tpressed quick next key");
				chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Next"}, function() {});
			}
			// Quick Prev
			else if (
				!(event.altKey   ^ (keyQuickPrev[0] & FLAG_KEY_ALT)       ) &&
				!(event.ctrlKey  ^ (keyQuickPrev[0] & FLAG_KEY_CTRL)  >> 1) &&
				!(event.shiftKey ^ (keyQuickPrev[0] & FLAG_KEY_SHIFT) >> 2) &&
				!(event.metaKey  ^ (keyQuickPrev[0] & FLAG_KEY_META)  >> 3) &&
				 (event.keyCode === keyQuickPrev[1])) {
				console.log("\t\tpressed quick prev key");
				chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Prev"}, function() {});
			}
		};

	return {
		//setKeyCodeIncrement: setKeyCodeIncrement,
		//setKeyEventIncrement: setKeyEventIncrement,
		//setKeyCodeDecrement: setKeyCodeDecrement,
		//setKeyEventDecrement: setKeyEventDecrement,
		//setKeyCodeClear: setKeyCodeClear,
		//setKeyEventClear: setKeyEventClear,
		//setKeyCodeFastIncrement: setKeyCodeFastIncrement,
		//setKeyEventFastIncrement: setKeyEventFastIncrement,
		//setKeyCodeFastDecrement: setKeyCodeFastDecrement,
		//setKeyEventFastDecrement: setKeyEventFastDecrement,
		//setMouseIncrement: setMouseIncrement,
		//setMouseDecrement: setMouseDecrement,
		//setMouseClear: setMouseClear,
		//setMouseFastIncrement: setMouseFastIncrement,
		//setMouseFastDecrement: setMouseFastDecrement,
		keyListener: keyListener,
		quickKeyListener: quickKeyListener
	};
}();

// Cache shortcuts from storage
chrome.storage.sync.get(null, function (o) {
	var U = URLNP.ContentScript;
	U.keyNext = o.keyNext;
	U.keyPrev = o.keyPrev;
	U.keyClear = o.keyClear;
	U.keyQuickNext = o.keyQuickNext;
	U.keyQuickPrev = o.keyQuickPrev;
});

// Send a request to the background to check if fast shortcuts are enabled.
chrome.runtime.sendMessage({greeting: "checkIfFastIsEnabled"}, function () {});

// Listen for requests from chrome.runtime.sendMessage.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		var U = URLNP.ContentScript;
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