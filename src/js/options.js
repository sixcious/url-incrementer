/**
 * TODO
 */ 

console.log("options.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * TODO
 */ 
URLNP.Options = URLNP.Options || function () {

	//"use strict";

	console.log("function URLNP.Options");

		// Flags.

	var	FLAG_KEY_NONE     = 0x0, // 0000
		FLAG_KEY_ALT      = 0x1, // 0001
		FLAG_KEY_CTRL     = 0x2, // 0010
		FLAG_KEY_SHIFT    = 0x4, // 0100
		FLAG_KEY_META     = 0x8, // 1000
		FLAG_MOUSE_NONE   = 0X0, // 00

		// Keys.

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

		// Called from body onload.

		initOptions = function () {
			console.log("\tfunction initOptions");

			// i18n for messages.json.

			i18n();
	
			// Populate the form.

			populateForm();
		},

		// i18n (Internationalization) from messages.json.
	
		i18n = function () {
			console.log("\tfunction i18n");
			document.getElementById("options").innerText = chrome.i18n.getMessage("options");
			document.getElementById("optionsShortcuts").innerText = chrome.i18n.getMessage("optionsShortcuts");
			document.getElementById("optionsAdvanced").innerText = chrome.i18n.getMessage("optionsAdvanced");

			document.getElementById("keyHeader").innerText = chrome.i18n.getMessage("optionsKeyHeader");
			document.getElementById("keyLabel").innerText = chrome.i18n.getMessage("optionsKeyLabel");
			document.getElementById("keyFastLabel").innerText = chrome.i18n.getMessage("optionsKeyFastLabel");
			document.getElementById("keyP").innerText = chrome.i18n.getMessage("optionsKeyP");
			document.getElementById("keyIncrementLabel").innerText = chrome.i18n.getMessage("optionsKeyIncrementLabel");
			document.getElementById("keyDecrementLabel").innerText = chrome.i18n.getMessage("optionsKeyDecrementLabel");
			document.getElementById("keyClearLabel").innerText = chrome.i18n.getMessage("optionsKeyClearLabel");
			document.getElementById("keyFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsKeyFastIncrementLabel");
			document.getElementById("keyFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsKeyFastDecrementLabel");
	
			document.getElementById("mouseHeader").innerText = chrome.i18n.getMessage("optionsMouseHeader");
			document.getElementById("mouseLabel").innerText = chrome.i18n.getMessage("optionsMouseLabel");
			document.getElementById("mouseFastLabel").innerText = chrome.i18n.getMessage("optionsMouseFastLabel");
			document.getElementById("mouseP").innerText = chrome.i18n.getMessage("optionsMouseP");
			document.getElementById("mouseIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseIncrementLabel");
			document.getElementById("mouseDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseDecrementLabel");
			document.getElementById("mouseClearLabel").innerText = chrome.i18n.getMessage("optionsMouseClearLabel");
			document.getElementById("mouseFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseFastIncrementLabel");
			document.getElementById("mouseFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseFastDecrementLabel");
			document.getElementById("mouseLeftIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
			document.getElementById("mouseMiddleIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
			document.getElementById("mouseRightIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
			document.getElementById("mouseNoneIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
			document.getElementById("mouseLeftDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
			document.getElementById("mouseMiddleDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
			document.getElementById("mouseRightDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
			document.getElementById("mouseNoneDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
			document.getElementById("mouseLeftClearLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
			document.getElementById("mouseMiddleClearLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
			document.getElementById("mouseRightClearLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
			document.getElementById("mouseNoneClearLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
			document.getElementById("mouseLeftFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
			document.getElementById("mouseMiddleFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
			document.getElementById("mouseRightFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
			document.getElementById("mouseNoneFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
			document.getElementById("mouseLeftFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
			document.getElementById("mouseMiddleFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
			document.getElementById("mouseRightFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
			document.getElementById("mouseNoneFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");

			document.getElementById("advancedHeader").innerText = chrome.i18n.getMessage("optionsAdvancedHeader");
			document.getElementById("defaultSubHeader").innerText = chrome.i18n.getMessage("optionsDefaultSubHeader");
			document.getElementById("defaultP").innerText = chrome.i18n.getMessage("optionsDefaultP");
			document.getElementById("defaultIncrementLabel").innerText = chrome.i18n.getMessage("popupIncrementLabel");
			document.getElementById("selectionAlgorithmSubHeader").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmSubHeader");
			document.getElementById("selectionAlgorithmP").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmP");
			document.getElementById("selectionAlgorithmCommonPrefixesLabel").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmCommonPrefixesLabel");
			document.getElementById("selectionAlgorithmCommonPrefixesP").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmCommonPrefixesP");
			document.getElementById("selectionAlgorithmLastNumberLabel").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmLastNumberLabel");
			document.getElementById("selectionAlgorithmLastNumberP").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmLastNumberP");
	
			document.getElementById("saveInput").value = chrome.i18n.getMessage("optionsSaveInput");
			document.getElementById("resetInput").value = chrome.i18n.getMessage("optionsResetInput");
		},
	
		populateForm = function () {
			console.log("\tfunction populateForm");

			// Key.

			keyCodeIncrement = parseInt(localStorage.keyCodeIncrement);
			keyEventIncrement = parseInt(localStorage.keyEventIncrement);
			keyCodeDecrement = parseInt(localStorage.keyCodeDecrement);
			keyEventDecrement = parseInt(localStorage.keyEventDecrement);
			keyCodeClear = parseInt(localStorage.keyCodeClear);
			keyEventClear = parseInt(localStorage.keyEventClear);
			keyCodeFastIncrement = parseInt(localStorage.keyCodeFastIncrement);
			keyEventFastIncrement = parseInt(localStorage.keyEventFastIncrement);
			keyCodeFastDecrement = parseInt(localStorage.keyCodeFastDecrement);
			keyEventFastDecrement = parseInt(localStorage.keyEventFastDecrement);
			document.getElementById("keyInput").checked = localStorage.keyEnabled === "1";
			document.getElementById("keyFastInput").checked = localStorage.keyFastEnabled === "1";
			writeToText(document.getElementById("keyIncrementInput"), keyEventIncrement, keyCodeIncrement);
			writeToText(document.getElementById("keyDecrementInput"), keyEventDecrement, keyCodeDecrement);
			writeToText(document.getElementById("keyClearInput"), keyEventClear, keyCodeClear);
			writeToText(document.getElementById("keyFastIncrementInput"), keyEventFastIncrement, keyCodeFastIncrement);
			writeToText(document.getElementById("keyFastDecrementInput"), keyEventFastDecrement, keyCodeFastDecrement);

			// Mouse.

			document.getElementById("mouseInput").checked = localStorage.mouseEnabled === "1";
			document.getElementById("mouseFastInput").checked = localStorage.mouseFastEnabled === "1";
			setRadio(document.getElementsByName("mouseIncrement"), localStorage.mouseIncrement);
			setRadio(document.getElementsByName("mouseDecrement"), localStorage.mouseDecrement);
			setRadio(document.getElementsByName("mouseClear"), localStorage.mouseClear);
			setRadio(document.getElementsByName("mouseFastIncrement"), localStorage.mouseFastIncrement);
			setRadio(document.getElementsByName("mouseFastDecrement"), localStorage.mouseFastDecrement);

			// Advanced.

			document.getElementById("defaultIncrementInput").value = localStorage.defaultIncrement;
			document.getElementById("defaultZerosInput").checked = localStorage.defaultZeros === "1";
			setRadio(document.getElementsByName("selectionAlgorithm"), localStorage.selectionAlgorithm);

		},
	
		// Wrapper function to save options (called when Save button is clicked).
	
		wrapperSave = function () {
			console.log("\tfunction wrapperSave");
			if (saveOptions()) {
				generateAlert_(chrome.i18n.getMessage("optionsSaveSuccess"), false);
			}
		},
		
		// Wrapper function to reset options (called when Reset button is clicked).
		
		wrapperReset = function () {
			console.log("\tfunction wrapperReset");
			resetOptions();
			generateAlert_(chrome.i18n.getMessage("optionsResetSuccess"), false);
		},
		
		// Saves options to localStorage.
		
		saveOptions = function () {
			console.log("\tfunction saveOptions");

			var mouseIncrement = parseInt(getRadio(document.getElementsByName("mouseIncrement"))),
				mouseDecrement = parseInt(getRadio(document.getElementsByName("mouseDecrement"))),
				mouseClear = parseInt(getRadio(document.getElementsByName("mouseClear"))),
				mouseFastIncrement = parseInt(getRadio(document.getElementsByName("mouseFastIncrement"))),
				mouseFastDecrement = parseInt(getRadio(document.getElementsByName("mouseFastDecrement"))),
				defaultIncrement = document.getElementById("defaultIncrementInput").value,
				i,
				length;

			// If the user decides to map multiple functions to the same key,
			// do not allow them to save.

			if ((document.getElementById("keyInput").checked) && ((keyEventIncrement === keyEventDecrement && keyCodeIncrement === keyCodeDecrement) || (keyEventIncrement === keyEventClear && keyCodeIncrement === keyCodeClear) || (keyEventIncrement === keyEventFastIncrement && keyCodeIncrement === keyCodeFastIncrement) || (keyEventIncrement === keyEventFastDecrement && keyCodeIncrement === keyCodeFastDecrement) || (keyEventDecrement === keyEventClear && keyCodeDecrement === keyCodeClear) || (keyEventDecrement === keyEventFastIncrement && keyCodeDecrement === keyCodeFastIncrement) || (keyEventDecrement === keyEventFastDecrement && keyCodeDecrement === keyCodeFastDecrement) || (keyEventClear === keyEventFastIncrement && keyCodeClear === keyCodeFastIncrement) || (keyEventClear === keyEventFastDecrement && keyCodeClear === keyCodeFastDecrement) || (keyEventFastIncrement === keyEventFastDecrement && keyCodeFastIncrement === keyCodeFastDecrement))) {
				generateAlert_(chrome.i18n.getMessage("optionsKeyError"), false);
				return false;
			}
		
			// If the user decides to map multiple functions to the same mouse
			// button, do not allow them to save.
	
			if ((document.getElementById("mouseInput").checked) && ((mouseIncrement === mouseDecrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseClear && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseFastIncrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseFastDecrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseClear && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseFastIncrement && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseFastDecrement && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseClear === mouseFastIncrement && mouseClear !== FLAG_MOUSE_NONE) || (mouseClear === mouseFastDecrement && mouseClear !== FLAG_MOUSE_NONE) || (mouseFastIncrement === mouseFastDecrement && mouseFastIncrement !== FLAG_MOUSE_NONE))) {
				generateAlert_(chrome.i18n.getMessage("optionsMouseError"), false);
				return false;
			}
		
			// If the user sets the increment to a value other than a number,
			// do not allow them to save.
		
			for (i = 0, length = defaultIncrement.length; i < length; i++) {
				if (defaultIncrement.charCodeAt(i) < 48 || defaultIncrement.charCodeAt(i) > 57) {
					generateAlert_(chrome.i18n.getMessage("popupIncrementNaNError"), false);
					return false;
				}
			}
		
			// Save the form data into localStorage.

			localStorage.keyEnabled = document.getElementById("keyInput").checked === true ? 1 : 0;
			localStorage.keyFastEnabled = document.getElementById("keyFastInput").checked === true ? 1 : 0;
			localStorage.keyCodeIncrement = keyCodeIncrement;
			localStorage.keyEventIncrement = keyEventIncrement;
			localStorage.keyCodeDecrement = keyCodeDecrement;
			localStorage.keyEventDecrement = keyEventDecrement;
			localStorage.keyCodeClear = keyCodeClear;
			localStorage.keyEventClear = keyEventClear;
			localStorage.keyCodeFastIncrement = keyCodeFastIncrement;
			localStorage.keyEventFastIncrement = keyEventFastIncrement;
			localStorage.keyCodeFastDecrement = keyCodeFastDecrement;
			localStorage.keyEventFastDecrement = keyEventFastDecrement;
		
			localStorage.mouseEnabled = document.getElementById("mouseInput").checked === true ? 1 : 0;
			localStorage.mouseFastEnabled = document.getElementById("mouseFastInput").checked === true ? 1 : 0;
			localStorage.mouseIncrement = mouseIncrement;
			localStorage.mouseDecrement = mouseDecrement;
			localStorage.mouseClear = mouseClear;
			localStorage.mouseFastIncrement = mouseFastIncrement;
			localStorage.mouseFastDecrement = mouseFastDecrement;
		
			localStorage.defaultIncrement = defaultIncrement;
			localStorage.defaultZeros = document.getElementById("defaultZerosInput").checked === true ? 1 : 0;
			localStorage.selectionAlgorithm = getRadio(document.getElementsByName("selectionAlgorithm"));
		
			// Let the background page know the options were saved/updated.
		
			chrome.runtime.sendMessage({greeting: "onOptionsFormSave"}, function () {});
		
			return true;
		},
		
		// Resets options to defaults.
		
		resetOptions = function () {
			console.log("\tfunction resetOptions");
			chrome.runtime.sendMessage({greeting: "onOptionsFormReset"}, function (response) {populateForm();});
		},
	
		// Set Key.
	
		setKey = function (event, key) {
			console.log("\tfunction setKey");
			var keyCode,
				keyEvent,
				keyEventBits;
		
			// Detect the keyCode and keyEvent (multi-browser).
		
			if (event) {
				keyCode = event.which;
				keyEvent = event;
			} else if (window.event) {
				keyCode = window.event.keyCode;
				keyEvent = window.event;
			}
		
			// Find the keyEvents (Alt, Ctrl, Shift, Meta) fired.
		
			keyEventBits = FLAG_KEY_NONE;
			keyEventBits = keyEvent.altKey 	 ? keyEventBits | FLAG_KEY_ALT   : keyEventBits;
			keyEventBits = keyEvent.ctrlKey  ? keyEventBits | FLAG_KEY_CTRL  : keyEventBits;
			keyEventBits = keyEvent.shiftKey ? keyEventBits | FLAG_KEY_SHIFT : keyEventBits;
			keyEventBits = keyEvent.metaKey  ? keyEventBits | FLAG_KEY_META  : keyEventBits;
		
			// Stores the keyCode and keyEvent, and then writes to the text box.
		
			switch (key) {
				case 1: // Increment.
					keyCodeIncrement = keyCode;
					keyEventIncrement = keyEventBits;
					writeToText(document.getElementById("keyIncrementInput"), keyEventIncrement, keyCodeIncrement);
					break;
				case 2: // Decrement.
					keyCodeDecrement = keyCode;
					keyEventDecrement = keyEventBits;
					writeToText(document.getElementById("keyDecrementInput"), keyEventDecrement, keyCodeDecrement);
					break;
				case 3: // Clear.
					keyCodeClear = keyCode;
					keyEventClear = keyEventBits;
					writeToText(document.getElementById("keyClearInput"), keyEventClear, keyCodeClear);
					break;
				case 4: // FastIncrement.
					keyCodeFastIncrement = keyCode;
					keyEventFastIncrement = keyEventBits;
					writeToText(document.getElementById("keyFastIncrementInput"), keyEventFastIncrement, keyCodeFastIncrement);
					break;
				case 5: // FastDecrement.
					keyCodeFastDecrement = keyCode;
					keyEventFastDecrement = keyEventBits;
					writeToText(document.getElementById("keyFastDecrementInput"), keyEventFastDecrement, keyCodeFastDecrement);
					break;
				default:
					break;
			}
		},
	
		// Gets the value of the checked radio button from the named radio group.
		
		getRadio = function (radio) {
			console.log("\tfunction getRadio");
			var i,
				length;
			for (i = 0, length = radio.length; i < length; i++) {
				if (radio[i].checked) {
					return radio[i].value;
				}
			}
		},
	
		// Sets (checks) the radio button from the named radio group to the value.
	
		setRadio = function (radio, value) {
			console.log("\tfunction setRadio");
			var i,
				length;
			for (i = 0, length = radio.length; i < length; i++) {
				if (radio[i].value === value) {
					radio[i].checked = true;
					break;
				}
			}
		},
	
		// This function writes to the textbox.  Because the fromCharCode
		// function doesn't store strings for special keys (backspace, tab, ...)
		// and arrows, they must be manually "stringified."  (All other keyCodes
		// will use fromCharCode in the default case to display their contents.)
		
		writeToText = function (text, keyEvent, keyCode) {
			console.log("\tfunction writeToText");
			console.log("\t\tkeyEvent=" + keyEvent);
			console.log("\t\tkeyCode=" + keyCode);

			var message = "";
	
			// keyEvent.
	
			message = (keyEvent & FLAG_KEY_ALT)        ? message + "Alt + "   : message;
			message = (keyEvent & FLAG_KEY_CTRL)  >> 1 ? message + "Ctrl + "  : message;
			message = (keyEvent & FLAG_KEY_SHIFT) >> 2 ? message + "Shift + " : message;
			message = (keyEvent & FLAG_KEY_META)  >> 3 ? message + "Meta + "  : message;
	
			// keyCode.
	
			switch (keyCode) {
				case 8:
					message += "Backspace";
					break;
				case 9:
					message += "Tab";
					break;
				case 13:
					message += "Enter";
					break;
				case 16:
					message += "Shift";
					break;
				case 17:
					message += "Ctrl";
					break;
				case 18:
					message += "Alt";
					break;
				case 19:
					message += "Pause";
					break;
				case 20:
					message += "Caps Lock";
					break;
				case 27:
					message += "Escape";
					break;
				case 32:
					message += "Space";
					break;
				case 33:
					message += "Page Up";
					break;
				case 34:
					message += "Page Down";
					break;
				case 35:
					message += "End";
					break;
				case 36:
					message += "Home";
					break;
				case 37:
					message += "Left";
					break;
				case 38:
					message += "Up";
					break;
				case 39:
					message += "Right";
					break;
				case 40:
					message += "Down";
					break;
				case 45:
					message += "Insert";
					break;
				case 46:
					message += "Delete";
					break;
				case 186:
					message += ";";
					break;
				case 187:
					message += "=";
					break;
				case 188:
					message += ",";
					break;
				case 189:
					message += "-";
					break;
				case 190:
					message += ".";
					break;
				case 191:
					message += "/";
					break;
				case 192:
					message += "`";
					break;
				case 219:
					message += "[";
					break;
				case 220:
					message += "\\";
					break;
				case 221:
					message += "]";
					break;
				case 222:
					message += "'";
					break;
				default:
					message += String.fromCharCode(keyCode);
					break;
			}

			console.log("\t\tmessage=" + message);

			// Write to text.

			text.value = message;
		},

		switchPane = function (option) {

			if (option === "key") {
				document.getElementById("key").classList.remove("hidden");
				document.getElementById("mouse").classList.add("hidden");
				document.getElementById("advanced").classList.add("hidden");
				document.getElementById("sidebarKey").classList.add("navbar-item-selected");
				document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
				document.getElementById("sidebarAdvanced").classList.remove("navbar-item-selected");

			}
			else if (option === "mouse") {
				document.getElementById("key").classList.add("hidden");
				document.getElementById("mouse").classList.remove("hidden");
				document.getElementById("advanced").classList.add("hidden");
				document.getElementById("sidebarKey").classList.remove("navbar-item-selected");
				document.getElementById("sidebarMouse").classList.add("navbar-item-selected");
				document.getElementById("sidebarAdvanced").classList.remove("navbar-item-selected");
			}
			else if (option === "advanced") {
				document.getElementById("key").classList.add("hidden");
				document.getElementById("mouse").classList.add("hidden");
				document.getElementById("advanced").classList.remove("hidden");
				document.getElementById("sidebarKey").classList.remove("navbar-item-selected");
				document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
				document.getElementById("sidebarAdvanced").classList.add("navbar-item-selected");
			}
		},
		
		// Shows some information about urlnp (called when urlnp image is clicked).
		
		secret = function () {
			console.log("\tfunction secret");
			// var randomNumber = Math.floor(Math.random() * 10) + 1;
			generateAlert_(chrome.i18n.getMessage("optionsSecret"), false);
		},
		
		// Generate alert overlay (popup message).
		// From the sample Google extension, Proxy Settings by Mike West.
		
		generateAlert_ = function (msg, close) {
			console.log("\tfunction generateAlert_");
			var success = document.createElement('div');
			success.classList.add('overlay');
			success.setAttribute('role', 'alert');
			success.textContent = msg;
			document.body.appendChild(success);
		
			setTimeout(function() { success.classList.add('visible'); }, 10);
			setTimeout(function() {
				if (close === false) {
					// success.classList.remove('visible');
					document.body.removeChild(success);
				} else {
					window.close();
				}
			}, 3000);
		},
	
		DOMContentLoaded = function () {
			console.log("\tfunction DOMContentLoaded");
			initOptions();
			document.getElementById("sidebarImage").addEventListener("click", secret, false);
			document.getElementById("sidebarKey").addEventListener("click", function () {switchPane("key");}, false);
			document.getElementById("sidebarMouse").addEventListener("click", function () {switchPane("mouse");}, false);
			document.getElementById("sidebarAdvanced").addEventListener("click", function () {switchPane("advanced");}, false);
			document.getElementById("keyIncrementInput").addEventListener("keydown", function () {setKey(event, 1);}, false);
			document.getElementById("keyDecrementInput").addEventListener("keydown", function () {setKey(event, 2);}, false);
			document.getElementById("keyClearInput").addEventListener("keydown", function () {setKey(event, 3);}, false);
			document.getElementById("keyFastIncrementInput").addEventListener("keydown", function () {setKey(event, 4);}, false);
			document.getElementById("keyFastDecrementInput").addEventListener("keydown", function () {setKey(event, 5);}, false);
			document.getElementById("saveInput").addEventListener("click", wrapperSave, false);
			document.getElementById("resetInput").addEventListener("click", wrapperReset, false);
		};

		// Public methods list.
		console.log("\treturn (URLNP.Options)");

		return {
			DOMContentLoaded: DOMContentLoaded
		};
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);

// refactor keys to key and mousebuttons to mouse?
