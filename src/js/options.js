// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.Options");

/**
 * URL Next Plus Options
 * 
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
    console.log("DOMContentLoaded()");
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
    DOM["#keyboard-shortcuts-a"].textContent = chrome.i18n.getMessage("options_keyboard_shortcuts_a");
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
    DOM["#keyboard-shortcuts-a"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    DOM["#default-mode-next-prev-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-mode-plus-minus-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value > 0 ? +this.value : 1}); }, false);
    DOM["#default-links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinksPriority": this.options[this.selectedIndex].value}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      DOM["#default-mode-" + items.defaultMode + "-input"].checked = true;
      DOM["#default-links-select"].value = items.defaultLinksPriority;
      DOM["#default-interval-input"].value = items.defaultInterval;
    });
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);