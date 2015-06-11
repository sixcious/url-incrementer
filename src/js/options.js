// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.Options");

/**
 * URL Next Plus Options.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */
var URLNP = URLNP || {};
URLNP.Options = URLNP.Options || function () {

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
      key = [0,0], // Stores the key event modifiers [0] and key code [1],
      DOM = {}; // Map to cache DOM elements: key=id, value=element

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
    // Cache DOM elements
    var ids = document.querySelectorAll("[id]"),
        i;
    for (i = 0; i < ids.length; i++) {
      DOM["#" + ids[i].id] = ids[i];
    }
    // Set localization text (i18n) from messages.json
    DOM["#shortcut-keys-h3"].innerText = chrome.i18n.getMessage("options_shortcut_keys_h3");
    DOM["#key-enable-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_enable_label");
    DOM["#key-quick-enable-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_enable_label");
    DOM["#key-p"].innerText = chrome.i18n.getMessage("options_shortcut_keys_p");
    DOM["#key-next-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_next_label");
    DOM["#key-prev-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_prev_label");
    DOM["#key-clear-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_clear_label");
    DOM["#key-quick-next-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_next_label");
    DOM["#key-quick-prev-label"].innerText = chrome.i18n.getMessage("options_shortcut_keys_quick_prev_label");
    DOM["#default-settings-h3"].innerText = chrome.i18n.getMessage("options_default_settings_h3");
    DOM["#default-settings-p"].innerText = chrome.i18n.getMessage("options_default_settings_p");
    DOM["#default-mode-label"].innerText = chrome.i18n.getMessage("options_default_mode_label");
    DOM["#default-mode-use-links-option"].innerText = chrome.i18n.getMessage("options_default_mode_use_links_option");
    DOM["#default-mode-modify-url-option"].innerText = chrome.i18n.getMessage("options_default_mode_modify_url_option");
    DOM["#default-interval-label"].innerText = chrome.i18n.getMessage("options_default_interval_label");
    DOM["#save-disclaimer"].innerText = chrome.i18n.getMessage("options_save_disclaimer");
    // Add Event Listeners to the DOM elements
    DOM["#key-next-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-prev-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-clear-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-quick-next-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-quick-prev-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"keyEnabled": this.checked}); }, false);
    DOM["#key-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"keyQuickEnabled": this.checked}); }, false);
    DOM["#key-next-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyNext": key}); }, false);
    DOM["#key-prev-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyPrev": key}); }, false);
    DOM["#key-clear-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyClear": key}); }, false);
    DOM["#key-quick-next-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyQuickNext": key}); }, false);
    DOM["#key-quick-prev-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyQuickPrev": key}); }, false);
    DOM["#default-mode-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.options[this.selectedIndex].value}); }, false);
    DOM["#default-interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": this.value}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#key-enable-input"].checked = items.keyEnabled;
      DOM["#key-quick-enable-input"].checked = items.keyQuickEnabled;
      writeInput(DOM["#key-next-input"], items.keyNext);
      writeInput(DOM["#key-prev-input"], items.keyPrev);
      writeInput(DOM["#key-clear-input"], items.keyClear);
      writeInput(DOM["#key-quick-next-input"], items.keyQuickNext);
      writeInput(DOM["#key-quick-prev-input"], items.keyQuickPrev);
      DOM["#default-mode-select"].value = items.defaultMode;
      DOM["#default-interval-input"].value = items.defaultInterval;
    });
  }

  /**
   * Sets the key that was pressed on a key event. This is needed shortly after
   * to write the key to the input value and to save the key to storage.
   * 
   * @param event the key event fired
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
   * Writes the key to the input value.
   * 
   * @param input the input to write to
   * @param key the key object to write
   * @private
   */
  function writeInput(input, key) {
    console.log("writeInput(input, key)");
    var keyCodeString = KEY_CODE_STRING_MAP[key[1]];
    // Write the input value based on the key event modifier bits and key code
    // using KEY_CODE_STRING_MAP for special cases or String.fromCharCode()
    input.value =
      ((key[0] & FLAG_KEY_ALT)        ? "Alt + "   : "") +
      ((key[0] & FLAG_KEY_CTRL)  >> 1 ? "Ctrl + "  : "") +
      ((key[0] & FLAG_KEY_SHIFT) >> 2 ? "Shift + " : "") +
      ((key[0] & FLAG_KEY_META)  >> 3 ? "Meta + "  : "") +
      (keyCodeString !== undefined ? keyCodeString : String.fromCharCode(key[1]));
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);