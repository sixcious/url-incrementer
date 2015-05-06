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
  		  "37": "Left",	
  		  "38": "Up",
  		  "39": "Right",	
  		  "40": "Down",
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
		  keyNext,
  		keyPrev,
  		keyClear,
  		keyQuickNext,
  		keyQuickPrev,
  		uiHelper = URLNP.UIHelper,

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
  	document.getElementById("shortcuts-keys").innerText = chrome.i18n.getMessage("options_shortcuts_keys");
  	document.getElementById("key-enable-label").innerText = chrome.i18n.getMessage("options_shortcuts_key_enable_label");
  	document.getElementById("key-quick-enable-label").innerText = chrome.i18n.getMessage("options_shortcuts_key_quick_enable_label");
  	document.getElementById("key-p").innerText = chrome.i18n.getMessage("options_shortcuts_keys_description");
  	document.getElementById("key-next-label").innerText = chrome.i18n.getMessage("options_shortcuts_next_label");
  	document.getElementById("key-prev-label").innerText = chrome.i18n.getMessage("options_shortcuts_prev_label");
  	document.getElementById("key-clear-label").innerText = chrome.i18n.getMessage("options_shortcuts_clear_label");
  	document.getElementById("key-quick-next-label").innerText = chrome.i18n.getMessage("options_shortcuts_quick_next_label");
  	document.getElementById("key-quick-prev-label").innerText = chrome.i18n.getMessage("options_shortcuts_quick_prev_label");
  // 	document.getElementById("shortcut-mouse-buttons").innerText = chrome.i18n.getMessage("optionsMouseHeader");
  // 	document.getElementById("mouse-enable-label").innerText = chrome.i18n.getMessage("optionsMouseLabel");
  // 	document.getElementById("mouse-quick-enable-label").innerText = chrome.i18n.getMessage("optionsMouseFastLabel");
  // 	document.getElementById("mouse-p").innerText = chrome.i18n.getMessage("optionsMouseP");
  // 	document.getElementById("mouseIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseIncrementLabel");
  // 	document.getElementById("mouseDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseDecrementLabel");
  // 	document.getElementById("mouseClearLabel").innerText = chrome.i18n.getMessage("optionsMouseClearLabel");
  // 	document.getElementById("mouseFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseFastIncrementLabel");
  // 	document.getElementById("mouseFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseFastDecrementLabel");
  // 	document.getElementById("mouseLeftIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
  // 	document.getElementById("mouseMiddleIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
  // 	document.getElementById("mouseRightIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
  // 	document.getElementById("mouseNoneIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
  // 	document.getElementById("mouseLeftDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
  // 	document.getElementById("mouseMiddleDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
  // 	document.getElementById("mouseRightDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
  // 	document.getElementById("mouseNoneDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
  // 	document.getElementById("mouseLeftClearLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
  // 	document.getElementById("mouseMiddleClearLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
  // 	document.getElementById("mouseRightClearLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
  // 	document.getElementById("mouseNoneClearLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
  // 	document.getElementById("mouseLeftFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
  // 	document.getElementById("mouseMiddleFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
  // 	document.getElementById("mouseRightFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
  // 	document.getElementById("mouseNoneFastIncrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
  // 	document.getElementById("mouseLeftFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseLeftLabel");
  // 	document.getElementById("mouseMiddleFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseMiddleLabel");
  // 	document.getElementById("mouseRightFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseRightLabel");
  // 	document.getElementById("mouseNoneFastDecrementLabel").innerText = chrome.i18n.getMessage("optionsMouseNoneLabel");
  // 	document.getElementById("advancedHeader").innerText = chrome.i18n.getMessage("optionsAdvancedHeader");
  // 	document.getElementById("defaultSubHeader").innerText = chrome.i18n.getMessage("optionsDefaultSubHeader");
  // 	document.getElementById("defaultP").innerText = chrome.i18n.getMessage("optionsDefaultP");
  // 	document.getElementById("defaultIntervalLabel").innerText = chrome.i18n.getMessage("options_interval_label");
  // 	document.getElementById("selectionAlgorithmSubHeader").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmSubHeader");
  // 	document.getElementById("selectionAlgorithmP").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmP");
  // 	document.getElementById("selectionAlgorithmCommonPrefixesLabel").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmCommonPrefixesLabel");
  // 	document.getElementById("selectionAlgorithmCommonPrefixesP").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmCommonPrefixesP");
  // 	document.getElementById("selectionAlgorithmLastNumberLabel").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmLastNumberLabel");
  // 	document.getElementById("selectionAlgorithmLastNumberP").innerText = chrome.i18n.getMessage("optionsSelectionAlgorithmLastNumberP");
  // 	document.getElementById("saveInput").value = chrome.i18n.getMessage("optionsSaveInput");
  // 	document.getElementById("resetInput").value = chrome.i18n.getMessage("optionsResetInput");
  	document.getElementById("save-disclaimer").innerText = chrome.i18n.getMessage("options_save_disclaimer");
  },
	
	populateForm = function () {
		console.log("\tfunction populateForm");
    chrome.storage.sync.get(null, function (o) {
  		document.getElementById("key-enable-input").checked = o.keyEnabled;
  		document.getElementById("key-quick-enable-input").checked = o.keyQuickEnabled;
  		writeToText(document.getElementById("key-next-input"), o.keyNext[0], o.keyNext[1]);
  		writeToText(document.getElementById("key-prev-input"), o.keyPrev[0], o.keyPrev[1]);
  		writeToText(document.getElementById("key-clear-input"), o.keyClear[0], o.keyClear[1]);
  		writeToText(document.getElementById("key-quick-next-input"), o.keyQuickNext[0], o.keyQuickNext[1]);
  		writeToText(document.getElementById("key-quick-prev-input"), o.keyQuickPrev[0], o.keyQuickPrev[1]);
  		// document.getElementById("mouseInput").checked = o.mouseEnabled;
  		// document.getElementById("mouseFastInput").checked = o.mouseQuickEnabled;
  		// setRadio(document.getElementsByName("mouseIncrement"), o.mouseNext);
  		// setRadio(document.getElementsByName("mouseDecrement"), o.mousePrev);
  		// setRadio(document.getElementsByName("mouseClear"), o.mouseClear);
  		// setRadio(document.getElementsByName("mouseFastIncrement"), o.mouseQuickNext);
  		// setRadio(document.getElementsByName("mouseFastDecrement"), o.mouseQuickPrev);
  		// document.getElementById("defaultIntervalInput").value = o.defaultInterval;
  		// setRadio(document.getElementsByName("selectionAlgorithm"), o.selectionAlgorithm);
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
			var keyCode = event.which,
				  keyEvent = event,
				  keyEventBits;
			// Find the keyEvents (Alt, Ctrl, Shift, Meta) fired.
			keyEventBits = FLAG_KEY_NONE;
			keyEventBits = keyEvent.altKey 	 ? keyEventBits | FLAG_KEY_ALT   : keyEventBits;
			keyEventBits = keyEvent.ctrlKey  ? keyEventBits | FLAG_KEY_CTRL  : keyEventBits;
			keyEventBits = keyEvent.shiftKey ? keyEventBits | FLAG_KEY_SHIFT : keyEventBits;
			keyEventBits = keyEvent.metaKey  ? keyEventBits | FLAG_KEY_META  : keyEventBits;
			// Stores the keyCode and keyEvent, and then writes to the text box.
			switch (key) {
				case 1: // Next
				  keyNext = [keyEventBits, keyCode];
					writeToText(document.getElementById("key-next-input"), keyNext[0], keyNext[1]);
					break;
				case 2: // Prev
				  keyPrev = [keyEventBits, keyCode];
					writeToText(document.getElementById("key-prev-input"), keyPrev[0], keyPrev[1]);
					break;
				case 3: // Clear
				  keyClear = [keyEventBits, keyCode];
					writeToText(document.getElementById("key-clear-input"), keyClear[0], keyClear[1]);
					break;
				case 4: // QuickNext
				  keyQuickNext = [keyEventBits, keyCode];
					writeToText(document.getElementById("key-quick-next-input"), keyQuickNext[0], keyQuickNext[1]);
					break;
				case 5: // QuickPrev
				  keyQuickPrev = [keyEventBits, keyCode];
					writeToText(document.getElementById("key-quick-prev-input"), keyQuickPrev[0], keyQuickPrev[1]);
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
				document.getElementById("shortcuts-page").classList.remove("hidden");
				document.getElementById("advanced-page").classList.add("hidden");
				// document.getElementById("sidebarKey").classList.add("navbar-item-selected");
				// document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
				// document.getElementById("sidebarAdvanced").classList.remove("navbar-item-selected");
			}	else if (option === "advanced") {
				document.getElementById("advanced-page").classList.remove("hidden");
				document.getElementById("shortcuts-page").classList.add("hidden");
				// document.getElementById("sidebarKey").classList.remove("navbar-item-selected");
				// document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
				// document.getElementById("sidebarAdvanced").classList.add("navbar-item-selected");
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
	
	/**
	 * TODO
	 */ 
    DOMContentLoaded = function () {
			console.log("\tfunction DOMContentLoaded");
			initOptions();
			document.getElementById("secret-input").addEventListener("click", secret, false);
			document.getElementById("shortcuts").addEventListener("click", function () {switchPane("shortcuts");}, false);
			document.getElementById("advanced").addEventListener("click", function () {switchPane("advanced");}, false);
			document.getElementById("key-next-input").addEventListener("keydown", function () {setKey(event, 1);}, false);
			document.getElementById("key-prev-input").addEventListener("keydown", function () {setKey(event, 2);}, false);
			document.getElementById("key-clear-input").addEventListener("keydown", function () {setKey(event, 3);}, false);
			document.getElementById("key-quick-next-input").addEventListener("keydown", function () {setKey(event, 4);}, false);
			document.getElementById("key-quick-prev-input").addEventListener("keydown", function () {setKey(event, 5);}, false);
		// 	document.getElementById("saveInput").addEventListener("click", wrapperSave, false);
		// 	document.getElementById("resetInput").addEventListener("click", wrapperReset, false);
			// Saves to storage
			document.getElementById("key-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyEnabled': document.getElementById("key-enable-input").checked}, function() {} );}, false);
			document.getElementById("key-quick-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyQuickEnabled': document.getElementById("key-quick-enable-input").checked}, function() {} );}, false);
			document.getElementById("key-next-input").addEventListener("keyup", function() {	chrome.storage.sync.set({'keyNext': keyNext}, function() {} );}, false);
			document.getElementById("key-prev-input").addEventListener("keyup", function() {	chrome.storage.sync.set({'keyPrev': keyPrev}, function() {} );}, false);
			document.getElementById("key-clear-input").addEventListener("keyup", function() {	chrome.storage.sync.set({'keyClear': keyClear}, function() {} );}, false);
  		document.getElementById("key-quick-next-input").addEventListener("keyup", function() {	chrome.storage.sync.set({'keyQuickNext': keyQuickNext}, function() {} );}, false);
			document.getElementById("key-quick-prev-input").addEventListener("keyup", function() {	chrome.storage.sync.set({'keyQuickPrev': keyQuickPrev}, function() {} );}, false);
			
		};

		// Public methods list.
		console.log("\treturn (URLNP.Options)");

		return {
			DOMContentLoaded: DOMContentLoaded
		};
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);

// refactor keys to key and mousebuttons to mouse?
