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
    DOM["#mode-next-prev-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#mode-plus-minus-input"].addEventListener("change", function () {chrome.storage.sync.set({"defaultMode": this.value}); }, false);
    DOM["#links-select"].addEventListener("change", function () { chrome.storage.sync.set({"defaultLinksPriority": this.value /*this.options[this.selectedIndex].value*/}); }, false);
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultSelectionPriority": this.value}); }, false);
    DOM["#selection-custom-save-button"].addEventListener("click", function () { customSelection("save"); }, false);
    DOM["#selection-custom-test-button"].addEventListener("click", function() { customSelection("test"); }, false);
    DOM["#interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultInterval": +this.value > 0 ? +this.value : 1}); }, false);
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"defaultBase": +this.value}); });
    DOM["#base-case-lowercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    DOM["#base-case-uppercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"defaultBaseCase": this.value}); }, false);
    // Populate values from storage
    chrome.storage.sync.get(null, function(items) {
      DOM["#keyboard-shortcuts-quick-enable-input"].checked = items.quickEnabled;
      DOM["#animations-enable-input"].checked = items.animationsEnabled;
      DOM["#mode-" + items.defaultMode + "-input"].checked = true;
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
    });
    DOM["#optional-permissions-request-button"].addEventListener("click", function () { chrome.permissions.request({ permissions: ["tabs"], origins: ["<all_urls>"]}, function(granted) { if (granted) { console.log("got ya!"); DOM["#keyboard-shortcuts"].className ="display-none"; } else { console.log("nopers!");}}); });
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

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Options.DOMContentLoaded, false);