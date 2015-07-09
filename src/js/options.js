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
    DOM["#default-links-label"].textContent = chrome.i18n.getMessage("options_default_links_label");
    DOM["#default-links-attributes-option"].textContent = chrome.i18n.getMessage("options_default_links_attributes_option");
    DOM["#default-links-innerHTML-option"].textContent = chrome.i18n.getMessage("options_default_links_innerHTML_option");
    DOM["#default-interval-label"].textContent = chrome.i18n.getMessage("options_default_interval_label");
    DOM["#animations-enable-label"].textContent = chrome.i18n.getMessage("options_animations_enable_label");
    // Add Event Listeners to the DOM elements
    DOM["#keyboard-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); }, false);
    DOM["#keyboard-shortcuts-button"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    DOM["#default-mode-next-prev-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-mode-plus-minus-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinksPriority": this.value /*this.options[this.selectedIndex].value*/}); }, false);
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultSelection": this.value}); }, false);
    DOM["#selection-custom-button"].addEventListener("click", function() { chrome.storage.sync.set({"defaultSelectionCustom": {url: DOM["#selection-custom-url"].value, pattern: DOM["#selection-custom-pattern"].value, flags: /\bg\b|\bm\b|\bi\b|\bgm\b|\bmi\b|\bgmi\b/.test(DOM["#selection-custom-flags"].value) ? DOM["#selection-custom-flags"].value : "", group: +DOM["#selection-custom-group"].value > 0 ? +DOM["#selection-custom-group"].value : 0, index: +DOM["#selection-custom-index"].value > 0 ? +DOM["#selection-custom-index"].value : 0}}); }, false);
    DOM["#selection-custom-test-button"].addEventListener("click", function() {
      var pattern = DOM["#selection-custom-pattern"].value,
          flags = DOM["#selection-custom-flags"].value,
          group = +DOM["#selection-custom-group"].value,
          index = +DOM["#selection-custom-index"].value;
    var rex = new RegExp(pattern, flags);
    var matches = rex.exec(DOM["#selection-custom-url"].value),
              selection = matches[group],
          selectionStart = matches.index + index;
    if (matches) {
      console.log("match! group :" + matches[group] + " index:" + matches.index + index);
                  DOM["#selection-custom-url"].setSelectionRange(selectionStart, selectionStart + selection.length); //instance.selectionStart + instance.selection.length);
            DOM["#selection-custom-url"].focus();
    } else {
      console.log("no match!");
    }
    // var re1 = /(?:=|\/)(\d+)/, // RegExp to find prefixes = and / with numbers
    //     re2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
    //     matches;
    // return (matches = re1.exec(url)) ? {selection: matches[1], selectionStart: matches.index + 1} :
    //       (matches = re2.exec(url)) ? {selection: matches[0], selectionStart: matches.index} :
    //                                   {selection: "", selectionStart: -1};
      
    });
    DOM["#default-interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value > 0 ? +this.value : 1}); }, false);
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = this.value > 10 ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultBase": this.value}); });
    DOM["#base-case-lowerCase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    DOM["#base-case-upperCase-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      DOM["#default-mode-" + items.defaultMode + "-input"].checked = true;
      DOM["#default-links-select"].value = items.defaultLinksPriority;
      DOM["#selection-select"].value = items.defaultSelection;
      DOM["#selection-custom"].className = items.defaultSelection === "custom" ? "display-block fade-in" : "display-none";
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
      DOM["#base-case-lowerCase-input"].checked = items.defaultBaseCase === "lowerCase";
      DOM["#base-case-upperCase-input"].checked = items.defaultBaseCase === "upperCase";
    });
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);