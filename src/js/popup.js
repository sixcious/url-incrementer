/**
 * URL Plus Popup
 * 
 * @author Roy Six
 * @namespace
 */
var URLP = URLP || {};
URLP.Popup = URLP.Popup || function () {

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
    DOM["#plus-input"].addEventListener("click", clickPlus);
    DOM["#minus-input"].addEventListener("click", clickMinus);
    DOM["#clear-input"].addEventListener("click", clickClear);
    DOM["#setup-input"].addEventListener("click", toggleView);
    DOM["#accept-button"].addEventListener("click", setup);
    DOM["#cancel-button"].addEventListener("click", toggleView);
    DOM["#url-textarea"].addEventListener("mouseup", selectURL);
    DOM["#url-textarea"].addEventListener("keyup", selectURL);
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; });
    // Initialize popup content
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      chrome.storage.sync.get(null, function(items) {
        items_ = items;
        chrome.runtime.getBackgroundPage(function(backgroundPage) {
          instance = backgroundPage.URLP.Background.getInstance(tabs[0].id);
          if (!instance) {
            instance = backgroundPage.URLP.Background.buildInstance(instance, tabs[0], items_);
          }
          updateControls();
          DOM["#setup-input"].className = items_.animationsEnabled ? "hvr-grow" : "";
          DOM["#url-textarea"].value = instance.url;
          DOM["#selection-input"].value = instance.selection;
          DOM["#selection-start-input"].value = instance.selectionStart;
          DOM["#interval-input"].value = instance.interval;
          DOM["#base-select"].value = instance.base;
          DOM["#base-case"].className = instance.base > 10 ? "display-block fade-in" : "display-none";
          DOM["#base-case-lowercase-input"].checked = instance.baseCase === "lowercase";
          DOM["#base-case-uppercase-input"].checked = instance.baseCase === "uppercase";
          DOM["#leading-zeros-input"].checked = instance.leadingZeros;
        });
      });
    });
  }

  /**
   * Updates this tab by incrementing the URL if the instance is enabled.
   * 
   * @private
   */
  function clickPlus() {
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLP.UI.clickHoverCss(this, "hvr-push-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLP.Background.updateTab(instance, "plus", "popup", function(result) {
          instance = result;
        });
      });
    }
  }

  /**
   * Updates this tab by decrementing the URL if the instance is enabled.
   * 
   * @private
   */
  function clickMinus() {
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLP.UI.clickHoverCss(this, "hvr-push-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLP.Background.updateTab(instance, "minus", "popup", function(result) {
          instance = result;
        });
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
        URLP.UI.clickHoverCss(this, "hvr-push-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLP.Background.setInstance(instance.tabId, undefined);
      });
      if (items_.shortcuts === "internal" && items_.keyEnabled && !items_.keyQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "removeKeyListener"});
      }
      if (items_.shortcuts === "internal" && items_.mouseEnabled && !items_.mouseQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "removeMouseListener"});
      }
    }
  }

  /**
   * Toggles the popup between the controls and setup views.
   * 
   * @private
   */
  function toggleView() {
    switch (this.id) {
      case "setup-input": // Hide controls, show setup
        DOM["#controls"].className = "fade-out";
        setTimeout(function () {
          DOM["#controls"].classList.add("display-none");
          DOM["#setup"].className = "display-block fade-in";
          DOM["#url-textarea"].value = instance.url;
          DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
          DOM["#url-textarea"].focus();
          DOM["#selection-input"].value = instance.selection;
          DOM["#selection-start-input"].value = instance.selectionStart;
        }, 300);
        break;
      case "accept-button": // Hide setup, show controls
      case "cancel-button":
        DOM["#setup"].className = "fade-out";
        setTimeout(function () {
          DOM["#setup"].classList.add("display-none");
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
    var className = instance.enabled ? items_.animationsEnabled ? "hvr-grow"  : "" : "disabled";
    DOM["#plus-input"].className = className;
    DOM["#minus-input"].className = className;
    DOM["#clear-input"].className = className;
  }
  
  /**
   * Sets up the instance in plus minus mode. First validates user input for any
   * errors, then saves and enables the instance, then toggles the view back to
   * the controls.
   * 
   * @private
   */
  function setup() {
    var url = DOM["#url-textarea"].value,
        selection = DOM["#selection-input"].value,
        selectionStart = +DOM["#selection-start-input"].value,
        interval = +DOM["#interval-input"].value,
        base = +DOM["#base-select"].value,
        baseCase = DOM["#base-case-uppercase-input"].checked ? "uppercase" : DOM["#base-case-lowercase-input"].checked ? "lowercase" : undefined,
        selectionparse = parseInt(selection, base).toString(base),
        leadingZeros = DOM["#leading-zeros-input"].checked,
        errors = [ // [0] = selection errors and [1] = interval errors
          selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
          url.indexOf(selection) === -1 ? chrome.i18n.getMessage("selection_notinurl_error") :
          !/^[a-z0-9]+$/i.test(selection) ? chrome.i18n.getMessage("selection_notalphanumeric_error") :
          selectionStart < 0 || url.substr(selectionStart, selection.length) !== selection ? chrome.i18n.getMessage("selectionstart_invalid_error") :
          isNaN(parseInt(selection, base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionparse.length) + selectionparse.toUpperCase()) ? chrome.i18n.getMessage("selection_base_error") : "",
          interval <= 0 ? chrome.i18n.getMessage("interval_invalid_error") : ""
        ];
    // We can tell there was an error if some of the array slots weren't empty
    if (errors.some(function(error) { return error !== ""; })) {
      errors.unshift(chrome.i18n.getMessage("oops_error"));
      URLP.UI.generateAlert(errors);
    } else {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        instance.enabled = true;
        instance.selection = selection;
        instance.selectionStart = selectionStart;
        instance.interval = interval;
        instance.base = base;
        instance.baseCase = baseCase;
        instance.leadingZeros = leadingZeros;
        backgroundPage.URLP.Background.setInstance(instance.tabId, instance);
        if (items_.shortcuts === "internal" && items_.keyEnabled && !items_.quickKeyEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addKeyListener"});
        }
        if (items_.shortcuts === "internal" && items_.mouseEnabled && !items_.quickMouseEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addMouseListener"});
        }
        toggleView.call(DOM["#accept-button"]);
      });
    }
  }

  /**
   * Handle URL selection on mouseup and keyup events. Saves the selectionStart
   * to a hidden input and updates the selection input to the selected text and
   * checks the leading zeros checkbox based on leading zeros present.
   * 
   * @private
   */
  function selectURL() {
    DOM["#selection-input"].value = window.getSelection().toString();
    DOM["#selection-start-input"].value = DOM["#url-textarea"].selectionStart;
    DOM["#leading-zeros-input"].checked = DOM["#selection-input"].value.charAt(0) === '0' && DOM["#selection-input"].value.length > 1;
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLP.Popup.DOMContentLoaded);