/**
 * URL Plus Options
 * 
 * @author Roy Six
 * @namespace
 */
var URLP = URLP || {};
URLP.Options = URLP.Options || function () {

  var DOM = {}, // Map to cache DOM elements: key=id, value=element
      FLAG_KEY_NONE = 0x0, // 0000
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
      key = [0,0]; // Stores the key event modifiers [0] and key code [1]

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
      el[el.dataset.i18n] = chrome.i18n.getMessage(el.id.replace(/-/g, '_').replace(/\*.*/, ''));
    }
    // Add Event Listeners to the DOM elements
    DOM["#keyboard-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); });
    DOM["#keyboard-shortcuts-button"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#key-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"keyQuickEnabled": this.checked}); });
    DOM["#mouse-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"mouseQuickEnabled": this.checked}); });
    DOM["#key-plus-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-minus-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-next-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-prev-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-clear-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-plus-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyPlus": key, "keyEnabled": true}); DOM["#key-enable-img"].className = "display-inline"; });
    DOM["#key-minus-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyMinus": key, "keyEnabled": true}); DOM["#key-enable-img"].className = "display-inline";});
    DOM["#key-next-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyNext": key, "keyEnabled": true}); DOM["#key-enable-img"].className = "display-inline"; });
    DOM["#key-prev-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyPrev": key, "keyEnabled": true}); DOM["#key-enable-img"].className = "display-inline";});
    DOM["#key-clear-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyClear": key, "keyEnabled": true}); DOM["#key-enable-img"].className = "display-inline"; });
    DOM["#key-plus-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyPlus": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-plus-input"], []); });
    DOM["#key-minus-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyMinus": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-minus-input"], []); });
    DOM["#key-next-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyNext": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-next-input"], []); });
    DOM["#key-prev-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyPrev": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-prev-input"], []); });
    DOM["#key-clear-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyClear": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-clear-input"], []); });
    DOM["#mouse-plus-select"].addEventListener("change", function() { chrome.storage.sync.set({"mousePlus": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-minus-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseMinus": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-next-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseNext": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-prev-select"].addEventListener("change", function() { chrome.storage.sync.set({"mousePrev": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-clear-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseClear": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#optional-permissions-request-button"].addEventListener("click", requestPermissions);
    DOM["#optional-permissions-remove-button"].addEventListener("click", removePermissions);
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); });
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"selectionPriority": this.value}); });
    DOM["#selection-custom-save-button"].addEventListener("click", function () { customSelection("save"); });
    DOM["#selection-custom-test-button"].addEventListener("click", function() { customSelection("test"); });
    DOM["#interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"interval": +this.value > 0 ? +this.value : 1}); });
    DOM["#leading-zeros-pad-by-detection-input"].addEventListener("change", function() { chrome.storage.sync.set({ "leadingZerosPadByDetection": this.checked}); });
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"base": +this.value}); });
    DOM["#base-case-lowercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"baseCase": this.value}); });
    DOM["#base-case-uppercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"baseCase": this.value}); });
    DOM["#links-select"].addEventListener("change", function () { chrome.storage.sync.set({"linksPriority": this.value}); });
    DOM["#same-domain-policy-enable-input"].addEventListener("change", function() { chrome.storage.sync.set({"sameDomainPolicy": this.checked}); });
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#keyboard-shortcuts"].className = items.shortcuts === "chrome" ? "display-block" : "display-none";
      DOM["#internal-shortcuts"].className = items.shortcuts === "internal" ? "display-block" : "display-none";
      DOM["#key-quick-enable-input"].checked = items.keyQuickEnabled;
      DOM["#mouse-quick-enable-input"].checked = items.mouseQuickEnabled;
      DOM["#key-enable-img"].className = items.keyEnabled ? "display-inline" : "display-none";
      DOM["#mouse-enable-img"].className = items.mouseEnabled ? "display-inline" : "display-none";
      writeInput(DOM["#key-plus-input"], items.keyPlus);
      writeInput(DOM["#key-minus-input"], items.keyMinus);
      writeInput(DOM["#key-next-input"], items.keyNext);
      writeInput(DOM["#key-prev-input"], items.keyPrev);
      writeInput(DOM["#key-clear-input"], items.keyClear);
      DOM["#mouse-plus-select"].value = items.mousePlus;
      DOM["#mouse-minus-select"].value = items.mouseMinus;
      DOM["#mouse-next-select"].value = items.mouseNext;
      DOM["#mouse-prev-select"].value = items.mousePrev;
      DOM["#mouse-clear-select"].value = items.mouseClear;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      DOM["#selection-select"].value = items.selectionPriority;
      DOM["#selection-custom"].className = items.selectionPriority === "custom" ? "display-block fade-in" : "display-none";
      DOM["#selection-custom-url-textarea"].value = items.selectionCustom.url;
      DOM["#selection-custom-pattern-input"].value = items.selectionCustom.pattern;
      DOM["#selection-custom-flags-input"].value = items.selectionCustom.flags;
      DOM["#selection-custom-group-input"].value = items.selectionCustom.group;
      DOM["#selection-custom-index-input"].value = items.selectionCustom.index;
      DOM["#interval-input"].value = items.interval;
      DOM["#leading-zeros-pad-by-detection-input"].checked = items.leadingZerosPadByDetection;
      DOM["#base-select"].value = items.base;
      DOM["#base-case"].className = items.base > 10 ? "display-block fade-in" : "display-none";
      DOM["#base-case-lowercase-input"].checked = items.baseCase === "lowercase";
      DOM["#base-case-uppercase-input"].checked = items.baseCase === "uppercase";
      DOM["#links-select"].value = items.linksPriority;
      DOM["#same-domain-policy-enable-input"].checked = items.sameDomainPolicy;
      DOM["#support-a"].href = "https://chrome.google.com/webstore/detail/url-plus/" + chrome.runtime.id + "/support";
      //DOM["#review-a"].href = "https://chrome.google.com/webstore/detail/url-plus/" + chrome.runtime.id + "/reviews";
    });
  }

  /**
   * Requests permissions in order to enable and bring up internal shortcuts.
   * 
   * @private
   */
  function requestPermissions() {
    chrome.permissions.request({ permissions: ["declarativeContent"], origins: ["<all_urls>"]}, function(granted) {
      if (granted) {
        chrome.storage.sync.set({"shortcuts": "internal"});
        DOM["#keyboard-shortcuts"].className = "display-none";
        DOM["#internal-shortcuts"].className = "display-block fade-in";
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
          chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher()],
            actions: [new chrome.declarativeContent.RequestContentScript({js: ["js/shortcuts.js"]})]
          }]);
        });
      }
    });
  }

  /**
   * Removes permissions that were previously granted and brings back Chrome
   * shortcuts.
   * 
   * @private
   */
  function removePermissions() {
    if (chrome.declarativeContent) {
      chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {});
    }
    chrome.permissions.remove({ permissions: ["declarativeContent"], origins: ["<all_urls>"]}, function(removed) {
      if (removed) {
        chrome.storage.sync.set({"shortcuts": "chrome"});
        DOM["#internal-shortcuts"].className = "display-none";
        DOM["#keyboard-shortcuts"].className = "display-block fade-in";
      }
    });
  }

  /**
   * Sets the enabled state of keyboard shortcuts.
   * 
   * @private
   */
  function setKeyEnabled() {
    chrome.storage.sync.get(null, function(items) {
      var enabled = items.keyPlus.length !== 0 || items.keyMinus.length !== 0 || items.keyNext.length !== 0 || items.keyPrev.length !== 0 || items.keyClear.length !== 0;
      chrome.storage.sync.set({"keyEnabled": enabled}, function() {
        DOM["#key-enable-img"].className = enabled ? "display-inline" : "display-none";
      });
    });
  }

  /**
   * Sets the enabled state of mouse button shortcuts.
   * 
   * @private
   */
  function setMouseEnabled() {
    chrome.storage.sync.get(null, function(items) {
      var enabled = items.mousePlus !== 0 || items.mouseMinus !== 0 || items.mouseNext !== 0 || items.mousePrev !== 0 || items.mouseClear !== 0;
      chrome.storage.sync.set({"mouseEnabled": enabled}, function() {
        DOM["#mouse-enable-img"].className = enabled ? "display-inline" : "display-none";
      });
    });
  }

  /**
   * Sets the key that was pressed on a keydown event. This is needed afterwards
   * to write the key to the input value and save the key to storage on keyup.
   * 
   * @param event the key event fired
   * @private
   */
  function setKey(event) {
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
    var keyCodeString = key && key[1] ? KEY_CODE_STRING_MAP[key[1]] : "";
    // Write the input value based on the key event modifier bits and key code
    // using KEY_CODE_STRING_MAP for special cases or String.fromCharCode()
    input.value =
      !key || key.length === 0        ? chrome.i18n.getMessage("key_notset_option") :
      ((key[0] & FLAG_KEY_ALT)        ? "Alt+"   : "") +
      ((key[0] & FLAG_KEY_CTRL)  >> 1 ? "Ctrl+"  : "") +
      ((key[0] & FLAG_KEY_SHIFT) >> 2 ? "Shift+" : "") +
      ((key[0] & FLAG_KEY_META)  >> 3 ? "Meta+"  : "") +
      (keyCodeString ? keyCodeString : String.fromCharCode(key[1]));
  }

  /**
   * Validates the custom selection regular expression fields and then performs
   * the desired action.
   * 
   * @param action the action to perform (test or save)
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
      if (!pattern || !matches) {
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
      chrome.storage.sync.set({"selectionCustom": { url: url, pattern: pattern, flags: flags, group: group, index: index }});
    }
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLP.Options.DOMContentLoaded);