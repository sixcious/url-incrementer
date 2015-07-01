/**
 * URL Next Plus Popup
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {

  var instance = {}, // Tab instance cache
      items_ = {}, // Storage items cache
      DOM = {}; // Map to cache DOM elements: key=id, value=element

  /**
   * Loads the DOM content needed to display the popup page.
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
    DOM["#next-input"].title = chrome.i18n.getMessage("popup_next_input");
    DOM["#prev-input"].title = chrome.i18n.getMessage("popup_prev_input");
    DOM["#clear-input"].title = chrome.i18n.getMessage("popup_clear_input");
    DOM["#next-prev-setup-input"].title = chrome.i18n.getMessage("popup_next_prev_setup_input");
    DOM["#plus-minus-setup-input"].title = chrome.i18n.getMessage("popup_plus_minus_setup_input");
    DOM["#plus-minus-setup-h3"].textContent = chrome.i18n.getMessage("popup_plus_minus_setup_h3");
    DOM["#url-label"].textContent = chrome.i18n.getMessage("popup_url_label");
    DOM["#selection-label"].textContent = chrome.i18n.getMessage("popup_selection_label");
    DOM["#interval-label"].textContent = chrome.i18n.getMessage("popup_interval_label");
    DOM["#plus-minus-setup-accept-input"].value = chrome.i18n.getMessage("popup_accept_input");
    DOM["#plus-minus-setup-cancel-input"].value = chrome.i18n.getMessage("popup_cancel_input");
    // Add Event Listeners to the DOM elements
    DOM["#next-input"].addEventListener("click", clickNext, false);
    DOM["#prev-input"].addEventListener("click", clickPrev, false);
    DOM["#clear-input"].addEventListener("click", clickClear, false);
    DOM["#next-prev-setup-input"].addEventListener("click", setupNextPrev, false);
    DOM["#plus-minus-setup-input"].addEventListener("click", toggleView, false);
    DOM["#plus-minus-setup-cancel-input"].addEventListener("click", toggleView, false);
    DOM["#plus-minus-setup-accept-input"].addEventListener("click", setupPlusMinus, false);
    DOM["#url-textarea"].addEventListener("mouseup", selectURL, false);
    DOM["#url-textarea"].addEventListener("keyup", selectURL, false);
    // Initialize popup content
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {file: "js/next-prev.js", runAt: "document_end"}, function() {
        chrome.tabs.executeScript(tabs[0].id, {code: "URLNP.NextPrev.getLinks(document);", runAt: "document_end"}, function(results){
          chrome.runtime.getBackgroundPage(function(backgroundPage) {
            chrome.storage.sync.get(null, function(items) {
              items_ = items;
              instance = backgroundPage.URLNP.Background.getInstance(tabs[0].id);
              if (!instance || instance.tab.url !== tabs[0].url) {
                instance = backgroundPage.URLNP.Background.buildInstance(instance, tabs[0], items, results[0]);
              }
              updateControls();
              DOM["#next-prev-setup-input"].className = items_.animationsEnabled ? "hvr-wobble-bottom" : "";
              DOM["#plus-minus-setup-input"].className = items_.animationsEnabled ? "hvr-wobble-bottom" : "";
              // Plus Minus initialization:
              DOM["#url-textarea"].value = instance.tab.url; // or tab.url
              DOM["#selection-input"].value = instance.selection;
              DOM["#selection-start-input"].value = instance.selectionStart;
              DOM["#interval-input"].value = instance.interval;
            });
          });
        });
      });
    });
  }

  /**
   * Updates this tab to the next URL if the instance is enabled.
   * 
   * @private
   */
  function clickNext() {
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLNP.UI.clickHoverCss(this, "hvr-wobble-horizontal-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.updateTab(instance, "next", "popup");
      });
    }
  }

  /**
   * Updates this tab to the previous URL if the instance is enabled.
   * 
   * @private
   */
  function clickPrev() {
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLNP.UI.clickHoverCss(this, "hvr-wobble-horizontal-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.updateTab(instance, "prev", "popup");
      });
    }
  }

  /**
   * Clears and disables this tab's instance if it is enabled.
   * 
   * @private
   */
  function clickClear() {
    if (instance.enabled) {
      instance.enabled = false;
      updateControls();
      if (items_.animationsEnabled) {
        URLNP.UI.clickHoverCss(this, "hvr-buzz-out-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.setInstance(instance.tab.id, undefined);
      });
    }
  }

  /**
   * Toggles the popup between the controls and the setup views.
   * 
   * @private
   */
  function toggleView() {
    var setup;
    switch (this.id) {
      case "plus-minus-setup-input": // Hide controls, show plus minus setup
        DOM["#controls"].className = "fade-out";
        setTimeout(function () {
          DOM["#controls"].classList.add("display-none");
          DOM["#plus-minus-setup"].className = "display-block fade-in";
          chrome.runtime.getBackgroundPage(function(backgroundPage) {
            var bgInstance = backgroundPage.URLNP.Background.getInstance(instance.tab.id);
            instance = bgInstance ? bgInstance : instance;
            DOM["#url-textarea"].value = instance.tab.url;
            DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
            DOM["#url-textarea"].focus();
            DOM["#selection-input"].value = instance.selection;
            DOM["#selection-start-input"].value = instance.selectionStart;
            DOM["#interval-input"].value = instance.interval;
          });
        }, 300);
        break;
      case "plus-minus-setup-accept-input":  // Hide setup, show controls
      case "plus-minus-setup-cancel-input":
        setup = "#" + this.id.split("setup")[0] + "setup";
        DOM[setup].className = "fade-out";
        setTimeout(function () {
          DOM[setup].classList.add("display-none");
          DOM["#controls"].className = "display-block fade-in";
          updateControls(); // Needed to reset hover.css click effect
        }, 300);
        break;
      default:
        break;
    }
  }

  /**
   * Updates the control images based on whether the instance is enabled.
   * 
   * @private
   */
  function updateControls() {
    var className = instance.enabled ? items_.animationsEnabled ? "hvr-grow" : "" : "disabled";
    DOM["#next-input"].className = className;
    DOM["#prev-input"].className = className;
    DOM["#clear-input"].className = className;
  }

  /**
   * Makes the instance work in next prev mode.
   * 
   * @private
   */
  function setupNextPrev() {
    var mode = "next-prev";
    if (!instance.enabled || instance.mode !== mode) {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        instance.enabled = true;
        instance.mode = mode;
        backgroundPage.URLNP.Background.setInstance(instance.tab.id, instance);
        toggleView.call(DOM["#next-prev-setup-accept-input"]);
        updateControls();
      });
    }
  }
  
  /**
   * Sets up the instance in plus minus mode. First validates user input for any
   * errors, then saves and enables the instance, then toggles the view back to
   * the controls.
   * 
   * @private
   */
  function setupPlusMinus() {
    var mode = "plus-minus", // DOM["#mode"].value, //DOM["#setup"].mode.value,
        url = DOM["#url-textarea"].value,
        selection = DOM["#selection-input"].value,
        selectionStart = +DOM["#selection-start-input"].value,
        interval = +DOM["#interval-input"].value,
        errors = [ // 0 index for selection and 1 index for interval errors
          selection === "" ? chrome.i18n.getMessage("popup_selection_blank_error") :
          url.indexOf(selection) === -1 ? chrome.i18n.getMessage("popup_selection_notinurl_error") :
          !/^[a-z0-9]+$/i.test(selection) ? chrome.i18n.getMessage("popup_selection_notalphanumeric_error") :
          selectionStart < 0 || url.substr(selectionStart, selection.length) !== selection ? chrome.i18n.getMessage("popup_selectionstart_invalid_error") : "",
          interval <= 0 ? chrome.i18n.getMessage("popup_interval_invalid_error") : ""
        ];
    // We can tell there was an error if some of the array slots weren't empty
    if (errors.some(function(error) { return error !== ""; })) {
      URLNP.UI.generateAlert(errors);
    } else {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        instance.enabled = true;
        instance.mode = mode;
        instance.interval = interval;
        instance.selection = selection;
        instance.selectionStart = selectionStart;
        backgroundPage.URLNP.Background.setInstance(instance.tab.id, instance);
        toggleView.call(DOM["#plus-minus-setup-accept-input"]);
        updateControls();
      });
    }
  }

  /**
   * Handle URL selection on mouseup and keyup events. Saves the selectionStart
   * to a hidden input and updates the selection input to the selected text.
   * 
   * @private
   */
  function selectURL() {
    DOM["#selection-start-input"].value = DOM["#url-textarea"].selectionStart;
    DOM["#selection-input"].value = window.getSelection().toString();
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);