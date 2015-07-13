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
    DOM["#basic-settings-h3"].textContent = chrome.i18n.getMessage("options_basic_settings_h3");
    DOM["#basic-settings-p"].textContent = chrome.i18n.getMessage("options_basic_settings_p");
    DOM["#animations-enable-label"].textContent = chrome.i18n.getMessage("options_animations_enable_label");
    DOM["#default-mode-label"].textContent = chrome.i18n.getMessage("options_default_mode_label");
    DOM["#default-mode-next-prev-option"].textContent = chrome.i18n.getMessage("options_default_mode_next_prev_option");
    DOM["#default-mode-plus-minus-option"].textContent = chrome.i18n.getMessage("options_default_mode_plus_minus_option");
    DOM["#plus-minus-settings-h3"].textContent = chrome.i18n.getMessage("options_plus_minus_settings_h3");
    DOM["#plus-minus-settings-p"].textContent = chrome.i18n.getMessage("options_plus_minus_settings_p");
    DOM["#default-selection-label"].textContent = chrome.i18n.getMessage("options_default_selection_label");
    DOM["#default-interval-label"].textContent = chrome.i18n.getMessage("options_default_interval_label");
    DOM["#default-base-label"].textContent = chrome.i18n.getMessage("options_default_base_label");
    DOM["#base-case-lowercase-label"].textContent = chrome.i18n.getMessage("popup_base_case_lowercase_label");
    DOM["#base-case-uppercase-label"].textContent = chrome.i18n.getMessage("popup_base_case_uppercase_label");
    DOM["#next-prev-settings-h3"].textContent = chrome.i18n.getMessage("options_next_prev_settings_h3");
    DOM["#next-prev-settings-p"].textContent = chrome.i18n.getMessage("options_next_prev_settings_p");
    DOM["#default-links-label"].textContent = chrome.i18n.getMessage("options_default_links_label");
    DOM["#default-links-attributes-option"].textContent = chrome.i18n.getMessage("options_default_links_attributes_option");
    DOM["#default-links-innerHTML-option"].textContent = chrome.i18n.getMessage("options_default_links_innerHTML_option");
    DOM["#same-domain-policy-enable-label"].textContent = chrome.i18n.getMessage("options_same_domain_policy_enable_label");
    // Add Event Listeners to the DOM elements
    DOM["#keyboard-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); }, false);
    DOM["#keyboard-shortcuts-button"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/configureCommands"}); });
    DOM["#animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"animationsEnabled": this.checked}); }, false);
    DOM["#default-mode-next-prev-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-mode-plus-minus-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#default-links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinksPriority": this.value /*this.options[this.selectedIndex].value*/}); }, false);
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultSelectionPriority": this.value}); }, false);
    DOM["#selection-custom-button"].addEventListener("click", function () { customSelection("save"); }, false);
    DOM["#selection-custom-test-button"].addEventListener("click", function() { customSelection("test"); }, false);
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

  /**
   * TODO
   * 
   * @private
   */
  function customSelection(action) {
    var url = DOM["#selection-custom-url"].value,
        pattern = DOM["#selection-custom-pattern"].value,
        flags = DOM["#selection-custom-flags"].value,
        group = +DOM["#selection-custom-group"].value,
        index = +DOM["#selection-custom-index"].value,
        regexp,
        matches,
        selection,
        selectionStart;
    try {
      // if (!/^$|\bg\b|\bm\b|\bi\b|\bgm\b|\bgi\b|\bmg\b|\bmi\b|ig\b|im\b|\bgmi\b|\bgim\b|\bmgi\b|\bmig\b|\bigm\b|\bimg\b/.test(flags)) {
      //   throw "Flags can only be g, m, or i";
      // }
      regexp = new RegExp(pattern, flags);
      matches = regexp.exec(url);
      if (!matches || !pattern) {
        throw "no match found";
      }
      if (group < 0) {
        throw "Group must be 0 or higher";
      }
      if (index < 0) {
        throw "Index must be 0 or higher";
      }
      if (!matches[group]) {
        throw "Match found, but not in group entered";
      }
      selection = matches[group].substring(index);
      if (!selection || selection === "") {
        throw "Match found but index is not right";
      }
      selectionStart = matches.index + index;
      console.log("matches[group]=" + matches[group]);
      console.log("selection is.." + selection);
      console.log("selectionSTart is" + selectionStart);
      console.log("url in selectionSTart index is " + url.charAt(selectionStart));
      if (selectionStart > url.length || selectionStart + selection.length > url.length) {
        throw "Match found but index is not right";
      }
      if (!/^[a-z0-9]+$/i.test(url.substring(selectionStart, selectionStart + selection.length))) {
        throw url.substring(selectionStart, selectionStart + selection.length) + " is not alphanumeric";
      }
    } catch (error) {
      console.log(error);
      DOM["#selection-custom-span"].textContent = error;
      return;
    }
    if (action === "test") {
      DOM["#selection-custom-span"].textContent = "Success!";
      DOM["#selection-custom-url"].setSelectionRange(selectionStart, selectionStart + selection.length);
      DOM["#selection-custom-url"].focus();
    } else if (action === "save") {
      DOM["#selection-custom-span"].textContent = "Saved!";
      chrome.storage.sync.set({"defaultSelectionCustom": { url: url, pattern: pattern, flags: flags, group: group, index: index }});
    }
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);