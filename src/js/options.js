/**
 * TODO
 */ 

console.log("options.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * TODO
 */ 
URLNP.Options = URLNP.Options || function () {
	
	console.log("function URLNP.Options");
	
	var	FLAG_KEY_NONE = 0x0, // 0000
  	  FLAG_KEY_ALT = 0x1, // 0001
  		FLAG_KEY_CTRL = 0x2, // 0010
  		FLAG_KEY_SHIFT = 0x4, // 0100
  		FLAG_KEY_META = 0x8, // 1000
  		FLAG_MOUSE_NONE = 0X0, // 00
  		KEY_CODE_STRING_MAP = { // Map for key codes that don't have String values
  		  "8": "Backspace",
  		  "9": "Tab",
  		  "13": "Enter",	
  		  // "16": "Shift",
  		  // "17": "Ctrl",	
  		  // "18": "Alt",
  		  "19": "Pause",	
  		  "20": "Caps Lock",
  		  "27": "Esc",	
  		  "32": "Space",
  		  "33": "Page Up",	
  		  "34": "Page Down",
  		  "35": "End",	
  		  "36": "Home",
  		  "37": "Left Arrow",	
  		  "38": "Up Arrow",
  		  "39": "Right Arrow",	
  		  "40": "Down Arrow",
  		  "45": "Insert",	
  		  "46": "Delete",
  		  "96": "0 (Numpad)",
  		  "97": "1 (Numpad)",
  		  "98": "2 (Numpad)",
  		  "99": "3 (Numpad)",
  		  "100": "4 (Numpad)",
  		  "101": "5 (Numpad)",
  		  "102": "6 (Numpad)",
  		  "103": "7 (Numpad)",
  		  "104": "8 (Numpad)",
  		  "105": "9 (Numpad)",
  		  "106": "* (Numpad)",
  		  "107": "+ (Numpad)",
  		  "109": "- (Numpad)",
  		  "110": ". (Numpad)",
  		  "111": "/ (Numpad)",
  		  "112": "F1",
  		  "113": "F2",
  		  "114": "F3",
  		  "115": "F4",
  		  "116": "F5",
  		  "117": "F6",
  		  "118": "F7",
  		  "119": "F8",
  		  "120": "F9",
  		  "121": "F10",
  		  "122": "F11",
  		  "123": "F12",
  		  "144": "Num Lock",
  		  "145": "Scroll Lock",
  		  "186": ";",	
  		  "187": "=",
  		  "188": ",",	
  		  "189": "-",
  		  "190": ".",	
  		  "191": "/",
  		  "192": "`",	
  		  "219": "[",
  		  "220": "\\",	
  		  "221": "]",
  		  "222": "'"
  		},
  		uiHelper = URLNP.UIHelper,
  		// keyCodeIncrement,
  		// keyEventIncrement,
  		// keyCodeDecrement,
  		// keyEventDecrement,
  		// keyCodeClear,
  		// keyEventClear,
  		// keyCodeFastIncrement,
  		// keyEventFastIncrement,
  		// keyCodeFastDecrement,
  		// keyEventFastDecrement,

  /**
   * Initializes the options page. This method is called from the body onload.
   * It initializes the i18n (internationalization) from messages.json and
   * populates the options form.
   */
  initOptions = function () {
  	console.log("\tfunction initOptions");
  	i18n();
  	populateForm();
  },
	
	/**
	 * TODO
	 * i18n (Internationalization) from messages.json.
	 */
  i18n = function () {
  	console.log("\tfunction i18n");
  	document.getElementById("title").innerText = chrome.i18n.getMessage("options_title");
  	document.getElementById("shortcuts").innerText = chrome.i18n.getMessage("options_shortcuts");
  	document.getElementById("advanced").innerText = chrome.i18n.getMessage("options_advanced");
  	document.getElementById("keyHeader").innerText = chrome.i18n.getMessage("options_shortcuts_keys");
  	document.getElementById("keyLabel").innerText = chrome.i18n.getMessage("options_shortcuts_enable_keys_label");
  	document.getElementById("keyFastLabel").innerText = chrome.i18n.getMessage("options_shortcuts_enable_quick_keys_label");
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
  	document.getElementById("defaultIntervalLabel").innerText = chrome.i18n.getMessage("options_interval_label");
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
    chrome.storage.sync.get(null, function (o) {
  		// Key.
  		// keyCodeIncrement = parseInt(o.keyCodeIncrement);
  		// keyEventIncrement = parseInt(o.keyEventIncrement);
  		// keyCodeDecrement = parseInt(o.keyCodeDecrement);
  		// keyEventDecrement = parseInt(localStorage.keyEventDecrement);
  		// keyCodeClear = parseInt(localStorage.keyCodeClear);
  		// keyEventClear = parseInt(localStorage.keyEventClear);
  		// keyCodeFastIncrement = parseInt(localStorage.keyCodeFastIncrement);
  		// keyEventFastIncrement = parseInt(localStorage.keyEventFastIncrement);
  		// keyCodeFastDecrement = parseInt(localStorage.keyCodeFastDecrement);
  		// keyEventFastDecrement = parseInt(localStorage.keyEventFastDecrement);
  		document.getElementById("keyInput").checked = o.keyEnabled;
  		document.getElementById("keyFastInput").checked = o.keyQuickEnabled;
  		writeToText(document.getElementById("keyIncrementInput"), o.keyNext[0], o.keyNext[1]);
  		writeToText(document.getElementById("keyDecrementInput"), o.keyPrev[0], o.keyPrev[1]);
  		writeToText(document.getElementById("keyClearInput"), o.keyClear[0], o.keyClear[1]);
  		writeToText(document.getElementById("keyFastIncrementInput"), o.keyQuickNext[0], o.keyQuickNext[1]);
  		writeToText(document.getElementById("keyFastDecrementInput"), o.keyQuickPrev[0], o.keyQuickPrev[1]);
  		document.getElementById("mouseInput").checked = o.mouseEnabled;
  		document.getElementById("mouseFastInput").checked = o.mouseQuickEnabled;
  		setRadio(document.getElementsByName("mouseIncrement"), o.mouseNext);
  		setRadio(document.getElementsByName("mouseDecrement"), o.mousePrev);
  		setRadio(document.getElementsByName("mouseClear"), o.mouseClear);
  		setRadio(document.getElementsByName("mouseFastIncrement"), o.mouseQuickNext);
  		setRadio(document.getElementsByName("mouseFastDecrement"), o.mouseQuickPrev);
  		document.getElementById("defaultIntervalInput").value = o.defaultInterval;
  		setRadio(document.getElementsByName("selectionAlgorithm"), o.selectionAlgorithm);
    });
	},
	
		// Wrapper function to save options (called when Save button is clicked).
	
		wrapperSave = function () {
			console.log("\tfunction wrapperSave");
			if (saveOptions()) {
				uiHelper.generateAlert_(chrome.i18n.getMessage("optionsSaveSuccess"), false);
			}
		},
		
		// Wrapper function to reset options (called when Reset button is clicked).
		
		wrapperReset = function () {
			console.log("\tfunction wrapperReset");
			resetOptions();
			uiHelper.generateAlert_(chrome.i18n.getMessage("optionsResetSuccess"), false);
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
				uiHelper.generateAlert_(chrome.i18n.getMessage("optionsKeyError"), false);
				return false;
			}
		
			// If the user decides to map multiple functions to the same mouse
			// button, do not allow them to save.
	
			if ((document.getElementById("mouseInput").checked) && ((mouseIncrement === mouseDecrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseClear && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseFastIncrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseFastDecrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseClear && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseFastIncrement && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseFastDecrement && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseClear === mouseFastIncrement && mouseClear !== FLAG_MOUSE_NONE) || (mouseClear === mouseFastDecrement && mouseClear !== FLAG_MOUSE_NONE) || (mouseFastIncrement === mouseFastDecrement && mouseFastIncrement !== FLAG_MOUSE_NONE))) {
				uiHelper.generateAlert_(chrome.i18n.getMessage("optionsMouseError"), false);
				return false;
			}
		
			// If the user sets the increment to a value other than a number,
			// do not allow them to save.
		
			for (i = 0, length = defaultIncrement.length; i < length; i++) {
				if (defaultIncrement.charCodeAt(i) < 48 || defaultIncrement.charCodeAt(i) > 57) {
					uiHelper.generateAlert_(chrome.i18n.getMessage("popupIncrementNaNError"), false);
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
			var message = "",
			    keyString = KEY_CODE_STRING_MAP[keyCode];
			// keyEvent.
			message = (keyEvent & FLAG_KEY_ALT)        ? message + "Alt "   : message;
			message = (keyEvent & FLAG_KEY_CTRL)  >> 1 ? message + "Ctrl "  : message;
			message = (keyEvent & FLAG_KEY_SHIFT) >> 2 ? message + "Shift " : message;
			message = (keyEvent & FLAG_KEY_META)  >> 3 ? message + "Meta "  : message;
			// keyCode.
			console.log("keyString is " + keyString);
			message += keyString === undefined ? String.fromCharCode(keyCode) : keyString;
			console.log("\t\tmessage=" + message);
			// Write to text.
			text.value = message;
		},

		switchPane = function (option) {

			if (option === "shortcuts") {
				document.getElementById("shortcuts").classList.remove("hidden");
				document.getElementById("advanced").classList.add("hidden");
				document.getElementById("sidebarKey").classList.add("navbar-item-selected");
				document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
				document.getElementById("sidebarAdvanced").classList.remove("navbar-item-selected");
			}	else if (option === "advanced") {
				document.getElementById("advanced").classList.remove("hidden");
				document.getElementById("shortcuts").classList.add("hidden");
				document.getElementById("sidebarKey").classList.remove("navbar-item-selected");
				document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
				document.getElementById("sidebarAdvanced").classList.add("navbar-item-selected");
			}
		},
		
		// Shows some information about urlnp (called when urlnp image is clicked).
		secret = function () {
			console.log("\tfunction secret");
			// var randomNumber = Math.floor(Math.random() * 10) + 1;
			uiHelper.generateAlert_(chrome.i18n.getMessage("options_secret"), false);
		},
		
		// // Generate alert overlay (popup message).
		// // From the sample Google extension, Proxy Settings by Mike West.
		
		// generateAlert_ = function (msg, close) {
		// 	console.log("\tfunction generateAlert_");
		// 	var success = document.createElement('div');
		// 	success.classList.add('overlay');
		// 	success.setAttribute('role', 'alert');
		// 	success.textContent = msg;
		// 	document.body.appendChild(success);
		
		// 	setTimeout(function() { success.classList.add('visible'); }, 10);
		// 	setTimeout(function() {
		// 		if (close === false) {
		// 			// success.classList.remove('visible');
		// 			document.body.removeChild(success);
		// 		} else {
		// 			window.close();
		// 		}
		// 	}, 3000);
		// },
	
		DOMContentLoaded = function () {
			console.log("\tfunction DOMContentLoaded");
			initOptions();
			document.getElementById("sidebarImage").addEventListener("click", secret, false);
		// 	document.getElementById("sidebarKey").addEventListener("click", function () {switchPane("key");}, false);
		// 	document.getElementById("sidebarMouse").addEventListener("click", function () {switchPane("mouse");}, false);
		// 	document.getElementById("sidebarAdvanced").addEventListener("click", function () {switchPane("advanced");}, false);
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
