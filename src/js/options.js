// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.Options");

/**
 * URL Next Plus Options.
 * 
 * Uses the JavaScript Revealing Module Pattern.
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
        // names = document.querySelectorAll("[name]"),
        i;
    for (i = 0; i < ids.length; i++) {
      DOM["#" + ids[i].id] = ids[i];
    }
    // for (i = 0; i < names.length; i++) {
    //   console.log("name:" + names[i].name);
    //   DOM["@" + names[i].name] = names[i];
    // }
    // Set localization text (i18n) from messages.json
    DOM["#keyboard-shortcuts-h3"].innerText = chrome.i18n.getMessage("options_keyboard_shortcuts_h3");
    DOM["#keyboard-shortcuts-p"].innerText = chrome.i18n.getMessage("options_keyboard_shortcuts_p");
    DOM["#keyboard-shortcuts-quick-enable-label"].innerText = chrome.i18n.getMessage("options_keyboard_shortcuts_quick_enable_label");
    DOM["#keyboard-shortcuts-a"].innerText = chrome.i18n.getMessage("options_keyboard_shortcuts_a");
    DOM["#default-settings-h3"].innerText = chrome.i18n.getMessage("options_default_settings_h3");
    DOM["#default-settings-p"].innerText = chrome.i18n.getMessage("options_default_settings_p");
    DOM["#default-mode-label"].innerText = chrome.i18n.getMessage("options_default_mode_label");
    DOM["#default-mode-use-links-option"].innerText = chrome.i18n.getMessage("options_default_mode_use_links_option");
    DOM["#default-mode-modify-url-option"].innerText = chrome.i18n.getMessage("options_default_mode_modify_url_option");
    DOM["#default-links-label"].innerText = chrome.i18n.getMessage("options_default_links_label");
    DOM["#default-links-attributes-option"].innerText = chrome.i18n.getMessage("options_default_links_attributes_option");
    DOM["#default-links-innerHTML-option"].innerText = chrome.i18n.getMessage("options_default_links_innerHTML_option");
    DOM["#default-interval-label"].innerText = chrome.i18n.getMessage("options_default_interval_label");
    DOM["#animations-enable-label"].innerText = chrome.i18n.getMessage("options_animations_enable_label");
    // Add Event Listeners to the DOM elements
    DOM["#keyboard-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); }, false);
    DOM["#keyboard-shortcuts-a"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    // DOM["#default-mode-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.options[this.selectedIndex].value}); }, false);
    DOM["#default-mode-use-links-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-mode-modify-url-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value}); }, false);
    // DOM["#default-links-attributes-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinks": this.value}); }, false);
    // DOM["#default-links-innerHTML-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinks": this.value}); }, false);
    DOM["#default-links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinks": this.options[this.selectedIndex].value}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      // DOM["#default-mode-select"].value = items.defaultMode;
      DOM["#default-mode-" + items.defaultMode + "-input"].checked = true;
      // DOM["#default-links-" + items.defaultLinks + "-input"].checked = true;
      DOM["#default-links-select"].value = items.defaultLinks;
      DOM["#default-interval-input"].value = items.defaultInterval;
    });
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);