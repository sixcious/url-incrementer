/**
 * TODO
 */ 

console.log("content_script.js start");
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
  		// EVENT_BUTTON_LEFT = 0, // Or EVENT_WHICH_LEFT = 1 using event.which
  		// EVENT_BUTTON_MIDDLE = 1, // Or EVENT_WHICH_MIDDLE = 2 using event.which
  		// EVENT_BUTTON_RIGHT = 2, // Or EVENT_WHICH_RIGHT = 3 using event.which
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

		// // When a listener is added, this function executes on each mousedown event that is fired.
		// // NOTE: This method was refactored from a switch block to if/else structure
		// // but needs to be refactored again to somehow remove second (inner) if check on
		// // right mouse.

		// mouseListener = function (event) {
		// 	console.log("\tfunction mouseListener");
		// 	// Increment.
		// 	if (
		// 		(event.button === EVENT_BUTTON_LEFT   && mouseIncrement === FLAG_MOUSE_LEFT  ) ||
		// 		(event.button === EVENT_BUTTON_MIDDLE && mouseIncrement === FLAG_MOUSE_MIDDLE) ||
		// 		(event.button === EVENT_BUTTON_RIGHT  && mouseIncrement === FLAG_MOUSE_RIGHT )) {
		// 		if (mouseIncrement === FLAG_MOUSE_RIGHT) {
		// 			document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
		// 		}
		// 		console.log("\t\tpressed increment mouse");	 
		// 		chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Increment"}, function() {});
		// 	}
		// 	// Decrement.
		// 	else if (
		// 		(event.button === EVENT_BUTTON_LEFT   && mouseDecrement === FLAG_MOUSE_LEFT  ) ||
		// 		(event.button === EVENT_BUTTON_MIDDLE && mouseDecrement === FLAG_MOUSE_MIDDLE) ||
		// 		(event.button === EVENT_BUTTON_RIGHT  && mouseDecrement === FLAG_MOUSE_RIGHT )) {
		// 		if (mouseDecrement === FLAG_MOUSE_RIGHT) {
		// 			document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
		// 		}
		// 		console.log("\t\tpressed decrement mouse");
		// 		chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Decrement"}, function() {});
		// 	}
		// 	// Clear.
		// 	else if  (
		// 		(event.button === EVENT_BUTTON_LEFT   && mouseClear === FLAG_MOUSE_LEFT  ) ||
		// 		(event.button === EVENT_BUTTON_MIDDLE && mouseClear === FLAG_MOUSE_MIDDLE) ||
		// 		(event.button === EVENT_BUTTON_RIGHT  && mouseClear === FLAG_MOUSE_RIGHT )) {
		// 		if (mouseClear === FLAG_MOUSE_RIGHT) {
		// 			document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
		// 			document.body.oncontextmenu = function() {return true;};  // Renable context menu again since user is still on the same page!
		// 		}
		// 		console.log("\t\tpressed clear mouse");	
		// 		chrome.runtime.sendMessage({greeting: "clearUrli"}, function() {});
		// 	}
		// },
	
		// When a listener is added, this function executes on each keydown event that is fired.
		// NOTE: Should this be refactored into one method with keyListener?



		// // When a listener is added, this function executes on each mousedown event that is fired.
		// // NOTE: Should this be refactored into one method with mouseListener?
		// // NOTE: This method was refactored from a switch to an if but should be
		// // refactored again to remove the inner if.

		// quickMouseListener = function (event) {
		// 	console.log("\tfunction fastMouseListener");	
		// 	// event.button and event.which are supported in Chrome (Webtoolkit).
		// 	// event.button:  0,1,2 = L,M,R.
		// 	// event.which:  1,2,3 = L,M,R.

		// 	// Increment.

		// 	if (
		// 		(event.button === EVENT_BUTTON_LEFT   && mouseFastIncrement === FLAG_MOUSE_LEFT  ) ||
		// 		(event.button === EVENT_BUTTON_MIDDLE && mouseFastIncrement === FLAG_MOUSE_MIDDLE) ||
		// 		(event.button === EVENT_BUTTON_RIGHT  && mouseFastIncrement === FLAG_MOUSE_RIGHT )) {
	
		// 		if (mouseFastIncrement === FLAG_MOUSE_RIGHT) {
		// 			document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
		// 		}
	 //			console.log("\t\tpressed fast increment mouse");
		// 		chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Increment"}, function() {});
		// 	}
	
		// 	// Decrement.
	
		// 	else if (
		// 		(event.button === EVENT_BUTTON_LEFT   && mouseFastDecrement === FLAG_MOUSE_LEFT  ) ||
		// 		(event.button === EVENT_BUTTON_MIDDLE && mouseFastDecrement === FLAG_MOUSE_MIDDLE) ||
		// 		(event.button === EVENT_BUTTON_RIGHT  && mouseFastDecrement === FLAG_MOUSE_RIGHT )) {
	
		// 		if (mouseFastDecrement === FLAG_MOUSE_RIGHT) {
		// 			document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
		// 		}
		// 		console.log("\t\tpressed fast decrement mouse");
		// 		chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Decrement"}, function() {});
		// 	}

		// };

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
		// mouseListener: mouseListener,
		// quickMouseListener: quickMouseListener
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
// 	U.mouseNext = o.mouseNext;
// 	U.mousePrev = o.mousePrev;
// 	U.mouseClear = o.mouseClear;
// 	U.mouseQuickNext = o.mouseQuickNext;
// 	U.mouseQuickPrev = o.mouseQuickPrev;
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