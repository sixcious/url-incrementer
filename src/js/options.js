// TODO

console.log("URLNP.Options");

/**
 * URL Next Plus Options.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */ 
var URLNP = URLNP || {};
URLNP.Options = URLNP.Options || function() {

  var FLAG_KEY_NONE = 0x0, // 0000
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
        "37": "Left", // \u2190 
        "38": "Up", // \u2191
        "39": "Right", // \u2192
        "40": "Down", // \u2193
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
      key = [0,0], // Stores the keyEventBits [0] and keyCode [1] on keydown
      $ = document.getElementById.bind(document); // Cache DOM document

  /**
   * Loads the DOM content needed to display the options page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    console.log("DOMContentLoaded()");
    // Add Event Listeners to the DOM elements (inputs)
    console.log("\tadding event listeners");
    $("key-next-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
    $("key-prev-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
    $("key-clear-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
    $("key-quick-next-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
    $("key-quick-prev-input").addEventListener("keydown", function () { setKey(event); writeToText(this, key); }, false);
    $("key-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyEnabled': this.checked}); }, false);
    $("key-quick-enable-input").addEventListener("change", function() { chrome.storage.sync.set({'keyQuickEnabled': this.checked}); }, false);
    $("key-next-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyNext': key}); }, false);
    $("key-prev-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyPrev': key}); }, false);
    $("key-clear-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyClear': key}); }, false);
    $("key-quick-next-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyQuickNext': key}); }, false);
    $("key-quick-prev-input").addEventListener("keyup", function() { chrome.storage.sync.set({'keyQuickPrev': key}); }, false);
    $("default-mode-select").addEventListener("change", function() { chrome.storage.sync.set({'defaultMode': this.options[this.selectedIndex].value}); }, false);
    $("default-interval-input").addEventListener("change", function() { chrome.storage.sync.set({'defaultInterval': this.value}); }, false);
    // Set localization text (i18n) from messages.json
    console.log("\tadding i18n text");
    $("shortcut-keys").innerText = chrome.i18n.getMessage("options_shortcut_keys");
    $("key-enable-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_enable_label");
    $("key-quick-enable-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_enable_label");
    $("key-p").innerText = chrome.i18n.getMessage("options_shortcut_keys_p");
    $("key-next-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_next_label");
    $("key-prev-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_prev_label");
    $("key-clear-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_clear_label");
    $("key-quick-next-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_next_label");
    $("key-quick-prev-label").innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_prev_label");
    $("default-settings").innerText = chrome.i18n.getMessage("options_default_settings");
    $("default-settings-p").innerText = chrome.i18n.getMessage("options_default_settings_p");
    $("default-mode-label").innerText = chrome.i18n.getMessage("options_default_mode_label");
    $("default-mode-use-links-option").innerText = chrome.i18n.getMessage("options_default_mode_use_links_option");
    $("default-mode-modify-url-option").innerText = chrome.i18n.getMessage("options_default_mode_modify_url_option");
    $("default-interval-label").innerText = chrome.i18n.getMessage("options_default_interval_label");
    $("save-disclaimer").innerText = chrome.i18n.getMessage("options_save_disclaimer");
    // Populate values from storage
    console.log("\tpopulating values from storage");
    chrome.storage.sync.get(null, function (o) {
      $("key-enable-input").checked = o.keyEnabled;
      $("key-quick-enable-input").checked = o.keyQuickEnabled;
      writeToText($("key-next-input"), o.keyNext);
      writeToText($("key-prev-input"), o.keyPrev);
      writeToText($("key-clear-input"), o.keyClear);
      writeToText($("key-quick-next-input"), o.keyQuickNext);
      writeToText($("key-quick-prev-input"), o.keyQuickPrev);
      $("default-mode-select").value = o.defaultMode;
      $("default-interval-input").value = o.defaultInterval;
    });
  }

  /**
   * Sets the key that was pressed on a keydown event. This is needed shortly
   * after to write the key to the text field and to save the key to storage.
   * 
   * @param event the keydown event fired
   * @private
   */ 
  function setKey(event) {
    console.log("setKey(event)");
    // Set key [0] as the event modifiiers OR'd together and [1] as the key code
    key = [
            (event.altKey   ? FLAG_KEY_ALT   : FLAG_KEY_NONE) | // 0001
            (event.ctrlKey  ? FLAG_KEY_CTRL  : FLAG_KEY_NONE) | // 0010
            (event.shiftKey ? FLAG_KEY_SHIFT : FLAG_KEY_NONE) | // 0100
            (event.metaKey  ? FLAG_KEY_META  : FLAG_KEY_NONE),  // 1000
            event.which
    ];
  }

  /**
   * Writes the key to the text field. Uses the KEY_CODE_STRING_MAP in case of
   * special characters that String.fromCharCode() doesn't display.
   * 
   * @param text the text input to write to
   * @param key the key object that was pressed
   * @private
   */ 
  function writeToText(text, key) {
    console.log("writeToText(text, key)");
    console.log("\ttext.id=" + text.id);
    console.log("\tkey=[" + key[0] + "," + key[1] + "]");
    var value = "",
        keyCodeString = KEY_CODE_STRING_MAP[key[1]];
    // Check key[0] (the keyEventBits) with the bitmask flags
    value = (key[0] & FLAG_KEY_ALT)        ? value + "Alt + "   : value;
    value = (key[0] & FLAG_KEY_CTRL)  >> 1 ? value + "Ctrl + "  : value;
    value = (key[0] & FLAG_KEY_SHIFT) >> 2 ? value + "Shift + " : value;
    value = (key[0] & FLAG_KEY_META)  >> 3 ? value + "Meta + "  : value;
    // Check key[1] (the keyCode) with the KEY_CODE_STRING_MAP or get it direct
    value += keyCodeString !== undefined ? keyCodeString : String.fromCharCode(key[1]);
    console.log("\tvalue=" + value);
    // Write to text
    text.value = value;
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);