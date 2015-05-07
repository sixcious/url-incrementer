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
  		// FLAG_MOUSE_NONE = 0X0, // 00
  		KEY_CODE_STRING_MAP = { // Map for key codes that don't have String values
  		  "8": "Backspace",
  		  "9": "Tab",
  		  "13": "Enter",
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
		  key, // Stores the keyEventBits and keyCode on keydown for keyup event

  /**
   * Loads the DOM content needed to display the options page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  DOMContentLoaded = function () {
		console.log("\tfunction DOMContentLoaded");
  	// Add Event Listeners to the DOM elements (inputs)
    console.log("\t\tadding event listeners");
		document.getElementById("secret-input").addEventListener("click", clickSecret, false);
		// document.getElementById("shortcuts").addEventListener("click", function () { switchPane("shortcuts");}, false);
		// document.getElementById("advanced").addEventListener("click", function () { switchPane("advanced");}, false);
		document.getElementById("key-next-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key);}, false);
		document.getElementById("key-prev-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key);}, false);
		document.getElementById("key-clear-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key);}, false);
		document.getElementById("key-quick-next-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key);}, false);
		document.getElementById("key-quick-prev-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key);}, false);
		document.getElementById("key-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyEnabled': this.checked}, function() {} );}, false);
		document.getElementById("key-quick-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyQuickEnabled': this.checked}, function() {} );}, false);
		document.getElementById("key-next-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyNext': key}, function() {} );}, false);
		document.getElementById("key-prev-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyPrev': key}, function() {} );}, false);
		document.getElementById("key-clear-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyClear': key}, function() {} );}, false);
		document.getElementById("key-quick-next-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyQuickNext': key}, function() {} );}, false);
		document.getElementById("key-quick-prev-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyQuickPrev': key}, function() {} );}, false);
  	// Set localization text (i18n) from messages.json
  	console.log("\t\tadding i18n text");
  	document.getElementById("title").innerText = chrome.i18n.getMessage("options_title");
  // 	document.getElementById("shortcuts").innerText = chrome.i18n.getMessage("options_shortcuts");
  // 	document.getElementById("advanced").innerText = chrome.i18n.getMessage("options_advanced");
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
  	// Populate values from storage
  	console.log("\t\tpopulating values from storage");
    chrome.storage.sync.get(null, function (o) {
  		document.getElementById("key-enable-input").checked = o.keyEnabled;
  		document.getElementById("key-quick-enable-input").checked = o.keyQuickEnabled;
  		writeToText(document.getElementById("key-next-input"), o.keyNext);
  		writeToText(document.getElementById("key-prev-input"), o.keyPrev);
  		writeToText(document.getElementById("key-clear-input"), o.keyClear);
  		writeToText(document.getElementById("key-quick-next-input"), o.keyQuickNext);
  		writeToText(document.getElementById("key-quick-prev-input"), o.keyQuickPrev);
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

  /**
   * Sets the key that was pressed. This is needed later to write the key to
   * the text field and also to save the key to storage.
   * 
   * @param event the keydown event fired
   * 
   * @private
   */ 
	setKey = function (event) {
		console.log("\tfunction storeKey");
		var keyEventBits;
		// Find the keyEventBits (Alt, Ctrl, Shift, Meta) from the event
		keyEventBits = FLAG_KEY_NONE;
		keyEventBits = event.altKey 	? keyEventBits | FLAG_KEY_ALT   : keyEventBits;
		keyEventBits = event.ctrlKey  ? keyEventBits | FLAG_KEY_CTRL  : keyEventBits;
		keyEventBits = event.shiftKey ? keyEventBits | FLAG_KEY_SHIFT : keyEventBits;
		keyEventBits = event.metaKey  ? keyEventBits | FLAG_KEY_META  : keyEventBits;
		// Set the key as the keyEventBits and the keyCode
		key = [keyEventBits, event.which];
	},

	/**
	 * Writes the key to the text field. Uses the KEY_CODE_STRING_MAP in case of
	 * special characters that String.fromCharCode() doesn't display.
	 * 
	 * @param text the text input to write to
	 * @param key the key object that was pressed
	 * 
	 * @private
	 */ 
	writeToText = function (text, key) {
		console.log("\tfunction writeToText");
		console.log("\t\ttext=" + text);
		console.log("\t\tkey=[" + key[0] + "," + key[1] + "]");
		var message = "",
		    keyEventBits = key[0],
		    keyCode = key[1],
		    keyCodeString = KEY_CODE_STRING_MAP[keyCode];
		// keyEventBits message
		message = (keyEventBits & FLAG_KEY_ALT)        ? message + "Alt + "   : message;
		message = (keyEventBits & FLAG_KEY_CTRL)  >> 1 ? message + "Ctrl + "  : message;
		message = (keyEventBits & FLAG_KEY_SHIFT) >> 2 ? message + "Shift + " : message;
		message = (keyEventBits & FLAG_KEY_META)  >> 3 ? message + "Meta + "  : message;
		// keyCode message
		message += keyCodeString !== undefined ? keyCodeString : String.fromCharCode(keyCode);
		console.log("\t\tmessage=" + message);
		// Write to text.
		text.value = message;
	},
	
	/**
	 * Called when the secret image is clicked. This function is explicitly
	 * needed instead of writing it in the anonymous function for the event
	 * because otherwise the options page will close automatically.
	 * 
	 * @private
	 */
	clickSecret = function () {
		console.log("\tfunction clickSecret");
    URLNP.UIHelper.generateAlert_([chrome.i18n.getMessage("options_secret")], false);
	};
	
// 	// Gets the value of the checked radio button from the named radio group.
// 	getRadio = function (radio) {
// 		console.log("\tfunction getRadio");
// 		var i,
// 			length;
// 		for (i = 0, length = radio.length; i < length; i++) {
// 			if (radio[i].checked) {
// 				return radio[i].value;
// 			}
// 		}
// 	},

// 	// Sets (checks) the radio button from the named radio group to the value.
// 	setRadio = function (radio, value) {
// 		console.log("\tfunction setRadio");
// 		var i,
// 			length;
// 		for (i = 0, length = radio.length; i < length; i++) {
// 			if (radio[i].value === value) {
// 				radio[i].checked = true;
// 				break;
// 			}
// 		}
// 	},

// 	switchPane = function (option) {
// 		if (option === "shortcuts") {
// 			document.getElementById("shortcuts-page").classList.remove("hidden");
// 			document.getElementById("advanced-page").classList.add("hidden");
// 			// document.getElementById("sidebarKey").classList.add("navbar-item-selected");
// 			// document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
// 			// document.getElementById("sidebarAdvanced").classList.remove("navbar-item-selected");
// 		}	else if (option === "advanced") {
// 			document.getElementById("advanced-page").classList.remove("hidden");
// 			document.getElementById("shortcuts-page").classList.add("hidden");
// 			// document.getElementById("sidebarKey").classList.remove("navbar-item-selected");
// 			// document.getElementById("sidebarMouse").classList.remove("navbar-item-selected");
// 			// document.getElementById("sidebarAdvanced").classList.add("navbar-item-selected");
// 		}
// 	},

	
		// // Wrapper function to save options (called when Save button is clicked).
	
		// wrapperSave = function () {
		// 	console.log("\tfunction wrapperSave");
		// 	if (saveOptions()) {
		// 		uiHelper.generateAlert_(chrome.i18n.getMessage("optionsSaveSuccess"), false);
		// 	}
		// },
		
		// // Wrapper function to reset options (called when Reset button is clicked).
		
		// wrapperReset = function () {
		// 	console.log("\tfunction wrapperReset");
		// 	resetOptions();
		// 	uiHelper.generateAlert_(chrome.i18n.getMessage("optionsResetSuccess"), false);
		// },
		
		// // Saves options to localStorage.
		
		// saveOptions = function () {
		// 	console.log("\tfunction saveOptions");
		// 	var mouseIncrement = parseInt(getRadio(document.getElementsByName("mouseIncrement"))),
		// 		mouseDecrement = parseInt(getRadio(document.getElementsByName("mouseDecrement"))),
		// 		mouseClear = parseInt(getRadio(document.getElementsByName("mouseClear"))),
		// 		mouseFastIncrement = parseInt(getRadio(document.getElementsByName("mouseFastIncrement"))),
		// 		mouseFastDecrement = parseInt(getRadio(document.getElementsByName("mouseFastDecrement"))),
		// 		defaultIncrement = document.getElementById("defaultIncrementInput").value,
		// 		i,
		// 		length;

		// 	// If the user decides to map multiple functions to the same key,
		// 	// do not allow them to save.

		// 	if ((document.getElementById("keyInput").checked) && ((keyEventIncrement === keyEventDecrement && keyCodeIncrement === keyCodeDecrement) || (keyEventIncrement === keyEventClear && keyCodeIncrement === keyCodeClear) || (keyEventIncrement === keyEventFastIncrement && keyCodeIncrement === keyCodeFastIncrement) || (keyEventIncrement === keyEventFastDecrement && keyCodeIncrement === keyCodeFastDecrement) || (keyEventDecrement === keyEventClear && keyCodeDecrement === keyCodeClear) || (keyEventDecrement === keyEventFastIncrement && keyCodeDecrement === keyCodeFastIncrement) || (keyEventDecrement === keyEventFastDecrement && keyCodeDecrement === keyCodeFastDecrement) || (keyEventClear === keyEventFastIncrement && keyCodeClear === keyCodeFastIncrement) || (keyEventClear === keyEventFastDecrement && keyCodeClear === keyCodeFastDecrement) || (keyEventFastIncrement === keyEventFastDecrement && keyCodeFastIncrement === keyCodeFastDecrement))) {
		// 		uiHelper.generateAlert_(chrome.i18n.getMessage("optionsKeyError"), false);
		// 		return false;
		// 	}
		
		// 	// If the user decides to map multiple functions to the same mouse
		// 	// button, do not allow them to save.
	
		// 	if ((document.getElementById("mouseInput").checked) && ((mouseIncrement === mouseDecrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseClear && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseFastIncrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseIncrement === mouseFastDecrement && mouseIncrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseClear && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseFastIncrement && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseDecrement === mouseFastDecrement && mouseDecrement !== FLAG_MOUSE_NONE) || (mouseClear === mouseFastIncrement && mouseClear !== FLAG_MOUSE_NONE) || (mouseClear === mouseFastDecrement && mouseClear !== FLAG_MOUSE_NONE) || (mouseFastIncrement === mouseFastDecrement && mouseFastIncrement !== FLAG_MOUSE_NONE))) {
		// 		uiHelper.generateAlert_(chrome.i18n.getMessage("optionsMouseError"), false);
		// 		return false;
		// 	}
		
		// 	// If the user sets the increment to a value other than a number,
		// 	// do not allow them to save.
		
		// 	for (i = 0, length = defaultIncrement.length; i < length; i++) {
		// 		if (defaultIncrement.charCodeAt(i) < 48 || defaultIncrement.charCodeAt(i) > 57) {
		// 			uiHelper.generateAlert_(chrome.i18n.getMessage("popupIncrementNaNError"), false);
		// 			return false;
		// 		}
		// 	}
		
		// 	// Save the form data into localStorage.

		// 	localStorage.keyEnabled = document.getElementById("keyInput").checked === true ? 1 : 0;
		// 	localStorage.keyFastEnabled = document.getElementById("keyFastInput").checked === true ? 1 : 0;
		// 	localStorage.keyCodeIncrement = keyCodeIncrement;
		// 	localStorage.keyEventIncrement = keyEventIncrement;
		// 	localStorage.keyCodeDecrement = keyCodeDecrement;
		// 	localStorage.keyEventDecrement = keyEventDecrement;
		// 	localStorage.keyCodeClear = keyCodeClear;
		// 	localStorage.keyEventClear = keyEventClear;
		// 	localStorage.keyCodeFastIncrement = keyCodeFastIncrement;
		// 	localStorage.keyEventFastIncrement = keyEventFastIncrement;
		// 	localStorage.keyCodeFastDecrement = keyCodeFastDecrement;
		// 	localStorage.keyEventFastDecrement = keyEventFastDecrement;
		
		// 	localStorage.mouseEnabled = document.getElementById("mouseInput").checked === true ? 1 : 0;
		// 	localStorage.mouseFastEnabled = document.getElementById("mouseFastInput").checked === true ? 1 : 0;
		// 	localStorage.mouseIncrement = mouseIncrement;
		// 	localStorage.mouseDecrement = mouseDecrement;
		// 	localStorage.mouseClear = mouseClear;
		// 	localStorage.mouseFastIncrement = mouseFastIncrement;
		// 	localStorage.mouseFastDecrement = mouseFastDecrement;
		
		// 	localStorage.defaultIncrement = defaultIncrement;
		// 	localStorage.selectionAlgorithm = getRadio(document.getElementsByName("selectionAlgorithm"));
		
		// 	// Let the background page know the options were saved/updated.
		
		// 	chrome.runtime.sendMessage({greeting: "onOptionsFormSave"}, function () {});
		
		// 	return true;
		// },
		
		// // Resets options to defaults.
		
		// resetOptions = function () {
		// 	console.log("\tfunction resetOptions");
		// 	chrome.runtime.sendMessage({greeting: "onOptionsFormReset"}, function (response) {populateForm();});
		// },

	// Public methods
	return {
		DOMContentLoaded: DOMContentLoaded
	};
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);