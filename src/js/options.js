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
        i;
    for (i = 0; i < ids.length; i++) {
      DOM["#" + ids[i].id] = ids[i];
    }
    // Set localization text (i18n) from messages.json
    DOM["#shortcut-keys-h3"].innerText = chrome.i18n.getMessage("options_shortcut_keys_h3");
    DOM["#shortcut-keys-a"].innerText = chrome.i18n.getMessage("options_shortcut_keys_a");
    DOM["#default-settings-h3"].innerText = chrome.i18n.getMessage("options_default_settings_h3");
    DOM["#default-settings-p"].innerText = chrome.i18n.getMessage("options_default_settings_p");
    DOM["#default-mode-label"].innerText = chrome.i18n.getMessage("options_default_mode_label");
    DOM["#default-mode-use-links-option"].innerText = chrome.i18n.getMessage("options_default_mode_use_links_option");
    DOM["#default-mode-modify-url-option"].innerText = chrome.i18n.getMessage("options_default_mode_modify_url_option");
    DOM["#default-interval-label"].innerText = chrome.i18n.getMessage("options_default_interval_label");
    DOM["#animations-enable-label"].innerText = chrome.i18n.getMessage("options_animations_enable_label");
    // Add Event Listeners to the DOM elements
    DOM["#shortcut-keys-a"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#default-mode-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.options[this.selectedIndex].value}); }, false);
    DOM["#default-interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value}); }, false);
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#default-mode-select"].value = items.defaultMode;
      DOM["#default-interval-input"].value = items.defaultInterval;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
    });
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);