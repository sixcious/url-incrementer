/**
 * URL Next Plus Options
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Options = URLNP.Options || function () {

  var DOM = {}; // Map to cache DOM elements: key=id, value=element
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
      key = [0,0]; // Stores the key event modifiers [0] and key code [1],

  /**
   * Loads the DOM content needed to display the options page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    var ids = document.querySelectorAll("[id]"),
        i18ns = document.querySelectorAll("[data-i18n]"),
        el,
        i;
    // Cache DOM elements
    for (i = 0; i < ids.length; i++) {
      el = ids[i];
      DOM["#" + el.id] = el;
    }
    // Set i18n (internationalization) text from messages.json
    for (i = 0; i < i18ns.length; i++) {
      el = i18ns[i];
      el[el.dataset.i18n] = chrome.i18n.getMessage(el.id.replace(/-/g, '_'));
    }
    // Add Event Listeners to the DOM elements
    DOM["#keyboard-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); }, false);
    DOM["#keyboard-shortcuts-button"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    //DOM["#mode-next-prev-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    //DOM["#mode-plus-minus-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinksPriority": this.value /*this.options[this.selectedIndex].value*/}); }, false);
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultSelectionPriority": this.value}); }, false);
    DOM["#selection-custom-save-button"].addEventListener("click", function () { customSelection("save"); }, false);
    DOM["#selection-custom-test-button"].addEventListener("click", function() { customSelection("test"); }, false);
    DOM["#interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value > 0 ? +this.value : 1}); }, false);
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultBase": +this.value}); });
    DOM["#base-case-lowercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    DOM["#base-case-uppercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    DOM["#key-plus-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-minus-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-next-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-prev-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    DOM["#key-clear-input"].addEventListener("keydown", function () { setKey(event); writeInput(this, key); }, false);
    //DOM["#key-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"keyEnabled": this.checked}); }, false);
    //DOM["#key-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"keyQuickEnabled": this.checked}); }, false);
    DOM["#key-plus-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyPlus": key}); }, false);
    DOM["#key-minus-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyMinus": key}); }, false);
    DOM["#key-next-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyNext": key}); }, false);
    DOM["#key-prev-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyPrev": key}); }, false);
    DOM["#key-clear-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyClear": key}); }, false);
    DOM["#key-plus-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyPlus": []}); writeInput(DOM["#key-plus-input"], []); }, false);
    DOM["#key-minus-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyMinus": []}); writeInput(DOM["#key-minus-input"], []); }, false);
    DOM["#key-next-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyNext": []}); writeInput(DOM["#key-next-input"], []); }, false);
    DOM["#key-prev-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyPrev": []}); writeInput(DOM["#key-prev-input"], []); }, false);
    DOM["#key-clear-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyClear": []}); writeInput(DOM["#key-clear-input"], []); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      //DOM["#mode-" + items.defaultMode + "-input"].checked = true;
      DOM["#links-select"].value = items.defaultLinksPriority;
      DOM["#selection-select"].value = items.defaultSelectionPriority;
      DOM["#selection-custom"].className = items.defaultSelectionPriority === "custom" ? "display-block fade-in" : "display-none";
      if (items.defaultSelectionCustom) {
        DOM["#selection-custom-url-textarea"].value = items.defaultSelectionCustom.url;
        DOM["#selection-custom-pattern-input"].value = items.defaultSelectionCustom.pattern;
        DOM["#selection-custom-flags-input"].value = items.defaultSelectionCustom.flags;
        DOM["#selection-custom-group-input"].value = items.defaultSelectionCustom.group;
        DOM["#selection-custom-index-input"].value = items.defaultSelectionCustom.index;
      }
      DOM["#interval-input"].value = items.defaultInterval;
      DOM["#base-select"].value = items.defaultBase;
      DOM["#base-case"].className = items.defaultBase > 10 ? "display-block fade-in" : "display-none";
      DOM["#base-case-lowercase-input"].checked = items.defaultBaseCase === "lowercase";
      DOM["#base-case-uppercase-input"].checked = items.defaultBaseCase === "uppercase";
      DOM["#keyboard-shortcuts"].className = items.shortcuts === "chrome" ? "display-block" : "display-none";
      DOM["#internal-shortcuts"].className = items.shortcuts === "internal" ? "display-block" : "display-none";
      writeInput(DOM["#key-plus-input"], items.keyPlus);
      writeInput(DOM["#key-minus-input"], items.keyMinus);
      writeInput(DOM["#key-next-input"], items.keyNext);
      writeInput(DOM["#key-prev-input"], items.keyPrev);
      writeInput(DOM["#key-clear-input"], items.keyClear);
    });
    DOM["#optional-permissions-request-button"].addEventListener("click", function () {
      chrome.permissions.request({ permissions: ["declarativeContent"], origins: ["<all_urls>"]},
      function(granted) {
        if (granted) {
          console.log("got ya!");
          chrome.storage.sync.set({"shortcuts": "internal"});
          DOM["#keyboard-shortcuts"].className = "display-none";
          DOM["#internal-shortcuts"].className = "display-block fade-in";
          chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
            chrome.declarativeContent.onPageChanged.addRules([{
              conditions: [ new chrome.declarativeContent.PageStateMatcher(/*{pageUrl: {}}*/)],
              actions: [new chrome.declarativeContent.RequestContentScript({js: ["js/shortcuts.js"]})]
            }]);
          });
        } else { 
          console.log("nopers!");
        }
      });
    });
    DOM["#optional-permissions-remove-button"].addEventListener("click", function() {
      if (chrome.declarativeContent) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
      }
      chrome.storage.sync.set({"shortcuts": "chrome"});
      DOM["#internal-shortcuts"].className = "display-none";
      DOM["#keyboard-shortcuts"].className = "display-block fade-in";
      chrome.permissions.remove({ permissions: ["declarativeContent"], origins: ["<all_urls>"]}, function(removed) {
        if (removed) {
          console.log("removed!");
        } else {
          console.log("not removed...???");
        }
      });
    });
  }

  /**
   * Validates the custom selection regular expression fields and then performs
   * the desired action (test or save).
   * 
   * @param action the action to perform (test or save)
   * 
   * @private
   */
  function customSelection(action) {
    var url = DOM["#selection-custom-url-textarea"].value,
        pattern = DOM["#selection-custom-pattern-input"].value,
        flags = DOM["#selection-custom-flags-input"].value,
        group = +DOM["#selection-custom-group-input"].value,
        index = +DOM["#selection-custom-index-input"].value,
        regexp,
        matches,
        selection,
        selectionStart;
    try {
      regexp = new RegExp(pattern, flags);
      matches = regexp.exec(url);
      if (!matches || !pattern) {
        throw chrome.i18n.getMessage("selection_custom_match_error");
      }
      if (group < 0) {
        throw chrome.i18n.getMessage("selection_custom_group_error");
      }
      if (index < 0) {
        throw chrome.i18n.getMessage("selection_custom_index_error");
      }
      if (!matches[group]) {
        throw chrome.i18n.getMessage("selection_custom_matchgroup_error");
      }
      selection = matches[group].substring(index);
      if (!selection || selection === "") {
        throw chrome.i18n.getMessage("selection_custom_matchindex_error");
      }
      selectionStart = matches.index + index;
      if (selectionStart > url.length || selectionStart + selection.length > url.length) {
        throw chrome.i18n.getMessage("selection_custom_matchindex_error");
      }
      if (!/^[a-z0-9]+$/i.test(url.substring(selectionStart, selectionStart + selection.length))) {
        throw url.substring(selectionStart, selectionStart + selection.length) + " " + chrome.i18n.getMessage("selection_custom_matchnotalphanumeric_error");
      }
    } catch (e) {
      DOM["#selection-custom-message-span"].textContent = e;
      return;
    }
    if (action === "test") {
      DOM["#selection-custom-message-span"].textContent = chrome.i18n.getMessage("selection_custom_test_success");
      DOM["#selection-custom-url-textarea"].setSelectionRange(selectionStart, selectionStart + selection.length);
      DOM["#selection-custom-url-textarea"].focus();
    } else if (action === "save") {
      DOM["#selection-custom-message-span"].textContent = chrome.i18n.getMessage("selection_custom_save_success");
      chrome.storage.sync.set({"defaultSelectionCustom": { url: url, pattern: pattern, flags: flags, group: group, index: index }});
    }
  }

  /**
   * Sets the key that was pressed on a key event. This is neseded shortly after
   * to write the key to the input value and to save the key to storage.
   * 
   * @param event the key event fired
   * @private
   */
  function setKey(event) {
    console.log("setKey(event=" + event + ")");
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
    console.log("writeInput(input=" + input + ", key=" + key + ")");
    var keyCodeString = key && key[1] ? KEY_CODE_STRING_MAP[key[1]] : "";
    // Write the input value based on the key event modifier bits and key code
    // using KEY_CODE_STRING_MAP for special cases or String.fromCharCode()
    input.value =
      !key || (!key[0] && !key[1])    ? "(Not set)" :
      ((key[0] & FLAG_KEY_ALT)        ? "Alt+"   : "") +
      ((key[0] & FLAG_KEY_CTRL)  >> 1 ? "Ctrl+"  : "") +
      ((key[0] & FLAG_KEY_SHIFT) >> 2 ? "Shift+" : "") +
      ((key[0] & FLAG_KEY_META)  >> 3 ? "Meta+"  : "") +
      (keyCodeString ? keyCodeString : String.fromCharCode(key[1]));
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);