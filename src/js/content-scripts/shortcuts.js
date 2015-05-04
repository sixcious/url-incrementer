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
		FLAG_MOUSE_LEFT = 0x1, // 01
		FLAG_MOUSE_MIDDLE = 0x2, // 10
		FLAG_MOUSE_RIGHT = 0X3, // 11
		EVENT_BUTTON_LEFT = 0, // Or EVENT_WHICH_LEFT   = 1 using event.which.
		EVENT_BUTTON_MIDDLE = 1, // Or EVENT_WHICH_MIDDLE = 2 using event.which.
		EVENT_BUTTON_RIGHT = 2, // Or EVENT_WHICH_RIGHT  = 3 using event.which.
		keyCodeIncrement,
		keyEventIncrement,
		keyCodeDecrement,
		keyEventDecrement,
		keyCodeClear,
		keyEventClear,
		keyCodeFastIncrement,
		keyEventFastIncrement,
		keyCodeFastDecrement,
		keyEventFastDecrement,
		mouseIncrement,
		mouseDecrement,
		mouseClear,
		mouseFastIncrement,
		mouseFastDecrement,

		setKeyCodeIncrement = function (value) {
			keyCodeIncrement = value;
		},

		setKeyEventIncrement = function (value) {
			keyEventIncrement = value;
		},

		setKeyCodeDecrement = function (value) {
			keyCodeDecrement = value;
		},

		setKeyEventDecrement = function (value) {
			keyEventDecrement = value;
		},

		setKeyCodeClear = function (value) {
			keyCodeClear = value;
		},

		setKeyEventClear = function (value) {
			keyEventClear = value;
		},

		setKeyCodeFastIncrement = function (value) {
			keyCodeFastIncrement = value;
		},

		setKeyEventFastIncrement = function (value) {
			keyEventFastIncrement = value;
		},

		setKeyCodeFastDecrement = function (value) {
			keyCodeFastDecrement = value;
		},

		setKeyEventFastDecrement = function (value) {
			keyEventFastDecrement = value;
		},

		setMouseIncrement = function (value) {
			mouseIncrement = value;
		},

		setMouseDecrement = function (value) {
			mouseDecrement = value;
		},

		setMouseClear = function (value) {
			mouseClear = value;
		},

		setMouseFastIncrement = function (value) {
			mouseFastIncrement = value;
		},

		setMouseFastDecrement = function (value) {
			mouseFastDecrement = value;
		},

		// When a listener is added, this function executes on each keydown event that is fired.

		keyListener = function (event) {
			console.log("\tfunction keyListener");
			// Increment.

			if (
				/* Alt   */ !(event.altKey   ^ (keyEventIncrement & FLAG_KEY_ALT)       ) && 
				/* Ctrl  */ !(event.ctrlKey  ^ (keyEventIncrement & FLAG_KEY_CTRL)  >> 1) && 
				/* Shift */ !(event.shiftKey ^ (keyEventIncrement & FLAG_KEY_SHIFT) >> 2) &&
				/* Meta  */ !(event.metaKey  ^ (keyEventIncrement & FLAG_KEY_META)  >> 3) &&
				/* None  */  (event.keyCode === keyCodeIncrement)) {
				console.log("\t\tpressed increment key");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Increment"}, function() {});
			}
	
			// Decrement.
	
			else if (
				/* Alt   */ !(event.altKey   ^ (keyEventDecrement & FLAG_KEY_ALT)       ) && 
				/* Ctrl  */ !(event.ctrlKey  ^ (keyEventDecrement & FLAG_KEY_CTRL)  >> 1) && 
				/* Shift */ !(event.shiftKey ^ (keyEventDecrement & FLAG_KEY_SHIFT) >> 2) &&
				/* Meta  */ !(event.metaKey  ^ (keyEventDecrement & FLAG_KEY_META)  >> 3) &&
				/* None  */  (event.keyCode === keyCodeDecrement)) {
				console.log("\t\tpressed decrement key");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Decrement"}, function() {});
			}

			// Clear.

			else if (
				/* Alt   */ !(event.altKey   ^ (keyEventClear & FLAG_KEY_ALT)       ) && 
				/* Ctrl  */ !(event.ctrlKey  ^ (keyEventClear & FLAG_KEY_CTRL)  >> 1) && 
				/* Shift */ !(event.shiftKey ^ (keyEventClear & FLAG_KEY_SHIFT) >> 2) &&
				/* Meta  */ !(event.metaKey  ^ (keyEventClear & FLAG_KEY_META)  >> 3) &&
				/* None  */  (event.keyCode === keyCodeClear)) {
				console.log("\t\tpressed clear key");
				chrome.runtime.sendMessage({greeting: "clearUrli"}, function() {});
			}
		},

		// When a listener is added, this function executes on each mousedown event that is fired.
		// NOTE: This method was refactored from a switch block to if/else structure
		// but needs to be refactored again to somehow remove second (inner) if check on
		// right mouse.

		mouseListener = function (event) {
			console.log("\tfunction mouseListener");

			// Increment.

			if (
				(event.button === EVENT_BUTTON_LEFT   && mouseIncrement === FLAG_MOUSE_LEFT  ) ||
				(event.button === EVENT_BUTTON_MIDDLE && mouseIncrement === FLAG_MOUSE_MIDDLE) ||
				(event.button === EVENT_BUTTON_RIGHT  && mouseIncrement === FLAG_MOUSE_RIGHT )) {
	
				if (mouseIncrement === FLAG_MOUSE_RIGHT) {
					document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
				}
				console.log("\t\tpressed increment mouse");	 
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Increment"}, function() {});
			}
	
			// Decrement.
	
			else if (
				(event.button === EVENT_BUTTON_LEFT   && mouseDecrement === FLAG_MOUSE_LEFT  ) ||
				(event.button === EVENT_BUTTON_MIDDLE && mouseDecrement === FLAG_MOUSE_MIDDLE) ||
				(event.button === EVENT_BUTTON_RIGHT  && mouseDecrement === FLAG_MOUSE_RIGHT )) {
	
				if (mouseDecrement === FLAG_MOUSE_RIGHT) {
					document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
				}
				console.log("\t\tpressed decrement mouse");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Decrement"}, function() {});
			}
	
			// Clear.
	
			else if  (
				(event.button === EVENT_BUTTON_LEFT   && mouseClear === FLAG_MOUSE_LEFT  ) ||
				(event.button === EVENT_BUTTON_MIDDLE && mouseClear === FLAG_MOUSE_MIDDLE) ||
				(event.button === EVENT_BUTTON_RIGHT  && mouseClear === FLAG_MOUSE_RIGHT )) {
	
				if (mouseClear === FLAG_MOUSE_RIGHT) {
					document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
					document.body.oncontextmenu = function() {return true;};  // Renable context menu again since user is still on the same page!
				}
				console.log("\t\tpressed clear mouse");	
				chrome.runtime.sendMessage({greeting: "clearUrli"}, function() {});
	
			}
		},
	
		// When a listener is added, this function executes on each keydown event that is fired.
		// NOTE: Should this be refactored into one method with keyListener?

		fastKeyListener = function (event) {
			console.log("\tfunction fastKeyListener");
			// Increment.
	
			if (
				/* Alt   */ !(event.altKey   ^ (keyEventFastIncrement & FLAG_KEY_ALT)       ) && 
				/* Ctrl  */ !(event.ctrlKey  ^ (keyEventFastIncrement & FLAG_KEY_CTRL)  >> 1) && 
				/* Shift */ !(event.shiftKey ^ (keyEventFastIncrement & FLAG_KEY_SHIFT) >> 2) &&
				/* Meta  */ !(event.metaKey  ^ (keyEventFastIncrement & FLAG_KEY_META)  >> 3) &&
				/* None  */  (event.keyCode === keyCodeFastIncrement)) {
				console.log("\t\tpressed fast increment key");
				chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Increment"}, function() {});
			}
	
			// Decrement.
	
			else if (
				/* Alt   */ !(event.altKey   ^ (keyEventFastDecrement & FLAG_KEY_ALT)       ) && 
				/* Ctrl  */ !(event.ctrlKey  ^ (keyEventFastDecrement & FLAG_KEY_CTRL)  >> 1) && 
				/* Shift */ !(event.shiftKey ^ (keyEventFastDecrement & FLAG_KEY_SHIFT) >> 2) &&
				/* Meta  */ !(event.metaKey  ^ (keyEventFastDecrement & FLAG_KEY_META)  >> 3) &&
				/* None  */  (event.keyCode === keyCodeFastDecrement)) {
				console.log("\t\tpressed fast decrement key");
				chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Decrement"}, function() {});
			}
		},

		// When a listener is added, this function executes on each mousedown event that is fired.
		// NOTE: Should this be refactored into one method with mouseListener?
		// NOTE: This method was refactored from a switch to an if but should be
		// refactored again to remove the inner if.

		fastMouseListener = function (event) {
			console.log("\tfunction fastMouseListener");	
			// event.button and event.which are supported in Chrome (Webtoolkit).
			// event.button:  0,1,2 = L,M,R.
			// event.which:  1,2,3 = L,M,R.

			// Increment.

			if (
				(event.button === EVENT_BUTTON_LEFT   && mouseFastIncrement === FLAG_MOUSE_LEFT  ) ||
				(event.button === EVENT_BUTTON_MIDDLE && mouseFastIncrement === FLAG_MOUSE_MIDDLE) ||
				(event.button === EVENT_BUTTON_RIGHT  && mouseFastIncrement === FLAG_MOUSE_RIGHT )) {
	
				if (mouseFastIncrement === FLAG_MOUSE_RIGHT) {
					document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
				}
	 			console.log("\t\tpressed fast increment mouse");
				chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Increment"}, function() {});
			}
	
			// Decrement.
	
			else if (
				(event.button === EVENT_BUTTON_LEFT   && mouseFastDecrement === FLAG_MOUSE_LEFT  ) ||
				(event.button === EVENT_BUTTON_MIDDLE && mouseFastDecrement === FLAG_MOUSE_MIDDLE) ||
				(event.button === EVENT_BUTTON_RIGHT  && mouseFastDecrement === FLAG_MOUSE_RIGHT )) {
	
				if (mouseFastDecrement === FLAG_MOUSE_RIGHT) {
					document.body.oncontextmenu = function() {return false;}; // Disable context menu first.
				}
				console.log("\t\tpressed fast decrement mouse");
				chrome.runtime.sendMessage({greeting: "fastUpdateTab", action: "Decrement"}, function() {});
			}

		};

	return {
		setKeyCodeIncrement: setKeyCodeIncrement,
		setKeyEventIncrement: setKeyEventIncrement,
		setKeyCodeDecrement: setKeyCodeDecrement,
		setKeyEventDecrement: setKeyEventDecrement,
		setKeyCodeClear: setKeyCodeClear,
		setKeyEventClear: setKeyEventClear,
		setKeyCodeFastIncrement: setKeyCodeFastIncrement,
		setKeyEventFastIncrement: setKeyEventFastIncrement,
		setKeyCodeFastDecrement: setKeyCodeFastDecrement,
		setKeyEventFastDecrement: setKeyEventFastDecrement,
		setMouseIncrement: setMouseIncrement,
		setMouseDecrement: setMouseDecrement,
		setMouseClear: setMouseClear,
		setMouseFastIncrement: setMouseFastIncrement,
		setMouseFastDecrement: setMouseFastDecrement,
		keyListener: keyListener,
		mouseListener: mouseListener,
		fastKeyListener: fastKeyListener,
		fastMouseListener: fastMouseListener,
	};
}();


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

			// From:      background
			// Request:   Just enabled urlnp or the user saved options.
			// Action:    Set the keys to the user-defined keyCodes/keyEvents from localStorage.
			// Callback:  None.

			case "setKeys":
				console.log("\t!request:setKeys");
				U.setKeyCodeIncrement(parseInt(request.keyCodeIncrement));
				U.setKeyEventIncrement(parseInt(request.keyEventIncrement));
				U.setKeyCodeDecrement(parseInt(request.keyCodeDecrement));
				U.setKeyEventDecrement(parseInt(request.keyEventDecrement));
				U.setKeyCodeClear(parseInt(request.keyCodeClear));
				U.setKeyEventClear(parseInt(request.keyEventClear));
				sendResponse({});
				break;

			// From:      background
			// Request:   Mouse is enabled in options and user clicked accept button in popup form or enabled mouse in options.
			// Action:    Add a mouseListener.
			// Callback:  None.

			case "addMouseListener":
				console.log("\t!request:addMouseListener");
				document.addEventListener("mousedown", U.mouseListener, false); // window.addEventListener(...) works too.
				sendResponse({});
				break;

			// From:      background
			// Request:   User clicked the Clear button from popup or disabled mouse in options.
			// Action:    Remove the mouseListener.
			// Callback:  None.

			case "removeMouseListener":
				console.log("\t!request:removeMouseListener");
				document.removeEventListener("mousedown", U.mouseListener, false); // window.removeEventListener(...) works too.
				sendResponse({});
				break;

			// From:      background
			// Request:   Just enabled urlnp or the user saved options.
			// Action:    Set the mouse buttons to the user-defined mouse codes from localStorage.
			// Callback:  None.

			case "setMouse":
				console.log("\t!request:setMouse");
				U.setMouseIncrement(parseInt(request.mouseIncrement));
				U.setMouseDecrement(parseInt(request.mouseDecrement));
				U.setMouseClear(parseInt(request.mouseClear));
				sendResponse({});
				break;

			// ?

			case "addFastKeyListener":
				console.log("\t!request:addFastKeyListener");
				document.addEventListener("keydown", U.fastKeyListener, false);
				break;

			// ?

			case "removeFastKeyListener":
				console.log("\t!request:removeFastKeyListener");
				document.removeEventListener("keydown", U.fastKeyListener, false);
				break;

			// ?

			case "setFastKeys":
				console.log("\t!request:setFastKeys");
				U.setKeyCodeFastIncrement(parseInt(request.keyCodeFastIncrement));
				U.setKeyEventFastIncrement(parseInt(request.keyEventFastIncrement));
				U.setKeyCodeFastDecrement(parseInt(request.keyCodeFastDecrement));
				U.setKeyEventFastDecrement(parseInt(request.keyEventFastDecrement));
				break;

			// ?

			case "addFastMouseListener":
				console.log("\t!request:addFastMouseListener");
				document.addEventListener("mousedown", U.fastMouseListener, false);
				sendResponse({});
				break;

			// ?

			case "removeFastMouseListener":
				console.log("\t!request:removeFastMouseListener");
				document.removeEventListener("mousedown", U.fastMouseListener, false);
				sendResponse({});
				break;

			// ?

			case "setFastMouse":
				console.log("\t!request:setFastMouse");
				U.setMouseFastIncrement(parseInt(request.mouseFastIncrement));
				U.setMouseFastDecrement(parseInt(request.mouseFastDecrement));
				sendResponse({});
				break;

			// Unspecified request -- should not be needed!

			default:
				console.warn("!request:unspecified");
				sendResponse({});
				break;
		}
		
		return true;

	}

);
