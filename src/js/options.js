/**
 * URL Next Plus Options
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Options = URLNP.Options || function () {

  var DOM = {}; // Map to cache DOM elements: key=id, value=element

  /**
   * Loads the DOM content needed to display the options page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    // Cache DOM elements
    var ids = document.querySelectorAll("[id]"),
        i;
    for (i = 0; i < ids.length; i++) {
      DOM["#" + ids[i].id] = ids[i];
    }
    // Set i18n (internationalization) text from messages.json
    DOM["#keyboard-shortcuts-h3"].textContent = chrome.i18n.getMessage("options_keyboard_shortcuts_h3");
    DOM["#keyboard-shortcuts-p"].textContent = chrome.i18n.getMessage("options_keyboard_shortcuts_p");
    DOM["#keyboard-shortcuts-quick-enable-label"].textContent = chrome.i18n.getMessage("options_keyboard_shortcuts_quick_enable_label");
    DOM["#keyboard-shortcuts-button"].textContent = chrome.i18n.getMessage("options_keyboard_shortcuts_button");
    DOM["#default-settings-h3"].textContent = chrome.i18n.getMessage("options_default_settings_h3");
    DOM["#default-settings-p"].textContent = chrome.i18n.getMessage("options_default_settings_p");
    DOM["#default-mode-label"].textContent = chrome.i18n.getMessage("options_default_mode_label");
    DOM["#default-mode-next-prev-option"].textContent = chrome.i18n.getMessage("options_default_mode_next_prev_option");
    DOM["#default-mode-plus-minus-option"].textContent = chrome.i18n.getMessage("options_default_mode_plus_minus_option");
    DOM["#animations-enable-label"].textContent = chrome.i18n.getMessage("options_animations_enable_label");
    DOM["#default-links-label"].textContent = chrome.i18n.getMessage("options_default_links_label");
    DOM["#default-links-attributes-option"].textContent = chrome.i18n.getMessage("options_default_links_attributes_option");
    DOM["#default-links-innerHTML-option"].textContent = chrome.i18n.getMessage("options_default_links_innerHTML_option");
    DOM["#default-selection-label"].textContent = chrome.i18n.getMessage("options_default_selection_label");
    DOM["#default-interval-label"].textContent = chrome.i18n.getMessage("options_default_interval_label");
    DOM["#default-base-label"].textContent = chrome.i18n.getMessage("options_default_base_label");
    DOM["#base-case-lowercase-label"].textContent = chrome.i18n.getMessage("popup_base_case_lowercase_label");
    DOM["#base-case-uppercase-label"].textContent = chrome.i18n.getMessage("popup_base_case_uppercase_label");
    // Add Event Listeners to the DOM elements
    DOM["#keyboard-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); }, false);
    DOM["#keyboard-shortcuts-button"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    DOM["#default-mode-next-prev-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-mode-plus-minus-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinksPriority": this.value /*this.options[this.selectedIndex].value*/}); }, false);
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultSelection": this.value}); }, false);
    DOM["#selection-custom-button"].addEventListener("click", function() { chrome.storage.sync.set({"defaultSelectionCustom": {url: DOM["#selection-custom-url"].value, pattern: DOM["#selection-custom-pattern"].value, flags: /\bg\b|\bm\b|\bi\b|\bgm\b|\bgi\b|\bmi\b|\bgmi\b/.test(DOM["#selection-custom-flags"].value) ? DOM["#selection-custom-flags"].value : "", group: +DOM["#selection-custom-group"].value > 0 ? +DOM["#selection-custom-group"].value : 0, index: +DOM["#selection-custom-index"].value > 0 ? +DOM["#selection-custom-index"].value : 0}}); }, false);
    DOM["#selection-custom-test-button"].addEventListener("click", function() {
      var url = DOM["#selection-custom-url"].value,
          pattern = DOM["#selection-custom-pattern"].value,
          flags = DOM["#selection-custom-flags"].value,
          group = +DOM["#selection-custom-group"].value,
          index = +DOM["#selection-custom-index"].value,
          rex = new RegExp(pattern, flags),
          matches = rex.exec(url),
          selection,
          selectionStart;
          console.log("matches=" + matches);
    if (matches) {
      selection = matches[group];
      selectionStart = matches.index + index;
      console.log("Matches:" + matches  + " Selection:" + selection + " SelectionStart:" + selectionStart);
      if (matches && selection && selectionStart <= url.length && selectionStart + selection.length <= url.length) {
        DOM["#selection-custom-url"].setSelectionRange(selectionStart, selectionStart + selection.length);
        DOM["#selection-custom-url"].focus();
      }
    } else {
      console.log("ERROR: No Match!");
    }
      
    });
    DOM["#default-interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value > 0 ? +this.value : 1}); }, false);
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultBase": +this.value}); });
    DOM["#base-case-lowercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    DOM["#base-case-uppercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      DOM["#default-mode-" + items.defaultMode + "-input"].checked = true;
      DOM["#default-links-select"].value = items.defaultLinksPriority;
      DOM["#selection-select"].value = items.defaultSelectionPriority;
      DOM["#selection-custom"].className = items.defaultSelectionPriority === "custom" ? "display-block fade-in" : "display-none";
      if (items.defaultSelectionCustom) {
        DOM["#selection-custom-url"].value = items.defaultSelectionCustom.url;
        DOM["#selection-custom-pattern"].value = items.defaultSelectionCustom.pattern;
        DOM["#selection-custom-flags"].value = items.defaultSelectionCustom.flags;
        DOM["#selection-custom-group"].value = items.defaultSelectionCustom.group;
        DOM["#selection-custom-index"].value = items.defaultSelectionCustom.index;
      }
      DOM["#default-interval-input"].value = items.defaultInterval;
      DOM["#base-select"].value = items.defaultBase;
      DOM["#base-case"].className = items.defaultBase > 10 ? "display-block fade-in" : "display-none";
      DOM["#base-case-lowercase-input"].checked = items.defaultBaseCase === "lowercase";
      DOM["#base-case-uppercase-input"].checked = items.defaultBaseCase === "uppercase";
    });
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);