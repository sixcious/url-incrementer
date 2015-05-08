/**
 * TODO
 */ 

console.log("options.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * URL Next Plus Options function.
 */ 
URLNP.Options = URLNP.Options || function () {
	
	console.log("URLNP.Options");
	
  var	FLAG_KEY_NONE = 0x0, // 0000
  	  FLAG_KEY_ALT = 0x1, // 0001
  		FLAG_KEY_CTRL = 0x2, // 0010
  		FLAG_KEY_SHIFT = 0x4, // 0100
  		FLAG_KEY_META = 0x8, // 1000
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
		console.log("function DOMContentLoaded");
  	// Add Event Listeners to the DOM elements (inputs)
    console.log("\tadding event listeners");
		document.getElementById("key-next-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
		document.getElementById("key-prev-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
		document.getElementById("key-clear-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
		document.getElementById("key-quick-next-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
		document.getElementById("key-quick-prev-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
		document.getElementById("key-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyEnabled': this.checked}); }, false);
		document.getElementById("key-quick-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyQuickEnabled': this.checked}); }, false);
		document.getElementById("key-next-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyNext': key}); }, false);
		document.getElementById("key-prev-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyPrev': key}); }, false);
		document.getElementById("key-clear-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyClear': key}); }, false);
		document.getElementById("key-quick-next-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyQuickNext': key}); }, false);
		document.getElementById("key-quick-prev-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyQuickPrev': key}); }, false);
		document.getElementById("default-action-select").addEventListener("change", function() { chrome.storage.sync.set({'defaultAction': this.options[this.selectedIndex].value}); }, false);
		document.getElementById("default-interval-input").addEventListener("change", function() { chrome.storage.sync.set({'defaultInterval': this.value}); }, false);
  	// Set localization text (i18n) from messages.json
  	console.log("\tadding i18n text");
  	document.getElementById("shortcut-keys").innerText = chrome.i18n.getMessage("options_shortcut_keys");
  	document.getElementById("key-enable-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_enable_label");
  	document.getElementById("key-quick-enable-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_enable_label");
  	document.getElementById("key-p").innerText = chrome.i18n.getMessage("options_shortcut_keys_p");
  	document.getElementById("key-next-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_next_label");
  	document.getElementById("key-prev-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_prev_label");
  	document.getElementById("key-clear-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_clear_label");
  	document.getElementById("key-quick-next-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_next_label");
  	document.getElementById("key-quick-prev-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_prev_label");
  	document.getElementById("default-settings").innerText = chrome.i18n.getMessage("options_default_settings");
  	document.getElementById("default-settings-p").innerText = chrome.i18n.getMessage("options_default_settings_p");
    document.getElementById("default-action-label").innerText = chrome.i18n.getMessage("options_default_action_label");
    document.getElementById("default-action-scan-page-option").innerText = chrome.i18n.getMessage("options_default_action_scan_page_option");
    document.getElementById("default-action-modify-url-option").innerText = chrome.i18n.getMessage("options_default_action_modify_url_option");
    document.getElementById("default-interval-label").innerText = chrome.i18n.getMessage("options_default_interval_label");
    document.getElementById("save-disclaimer").innerText = chrome.i18n.getMessage("options_save_disclaimer");
  	// Populate values from storage
  	console.log("\tpopulating values from storage");
    chrome.storage.sync.get(null, function (o) {
  		document.getElementById("key-enable-input").checked = o.keyEnabled;
  		document.getElementById("key-quick-enable-input").checked = o.keyQuickEnabled;
  		writeToText(document.getElementById("key-next-input"), o.keyNext);
  		writeToText(document.getElementById("key-prev-input"), o.keyPrev);
  		writeToText(document.getElementById("key-clear-input"), o.keyClear);
  		writeToText(document.getElementById("key-quick-next-input"), o.keyQuickNext);
  		writeToText(document.getElementById("key-quick-prev-input"), o.keyQuickPrev);
  		document.getElementById("default-action-select").value = o.defaultAction;
  		document.getElementById("default-interval-input").value = o.defaultInterval;
    });
	},

  /**
   * Sets the key that was pressed. This is needed later to write the key to
   * the text field and also to save the key to storage. Executes on keydown
   * events.
   * 
   * @param event the keydown event fired
   * 
   * @private
   */ 
	setKey = function (event) {
		console.log("function setKey");
		var keyEventBits;
		// Set the keyEventBits (Alt, Ctrl, Shift, Meta) from the event
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
		console.log("function writeToText");
		console.log("\ttext.id=" + text.id);
		console.log("\tkey=[" + key[0] + "," + key[1] + "]");
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
		console.log("\tmessage=" + message);
		// Write to text.
		text.value = message;
	};

	// Public methods
	return {
		DOMContentLoaded: DOMContentLoaded
	};
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);