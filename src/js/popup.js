// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.Popup");

/**
 * URL Next Plus Popup.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */
var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {

  var instance, // Caches this tab's instance
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
    console.log("DOMContentLoaded()");
    // Cache DOM elements
    var ids = document.querySelectorAll("[id]"),
        i;
    for (i = 0; i < ids.length; i++) {
      DOM["#" + ids[i].id] = ids[i];
    }
    // Set localization text (i18n) from messages.json
    DOM["#next-input"].title = chrome.i18n.getMessage("popup_next_input");
    DOM["#prev-input"].title = chrome.i18n.getMessage("popup_prev_input");
    DOM["#clear-input"].title = chrome.i18n.getMessage("popup_clear_input");
    DOM["#setup-use-links-input"].title = chrome.i18n.getMessage("popup_setup_input");
    DOM["#setup-modify-url-input"].title = chrome.i18n.getMessage("popup_setup_input");
    DOM["#url-label"].innerText = chrome.i18n.getMessage("popup_url_label");
    DOM["#selection-label"].innerText = chrome.i18n.getMessage("popup_selection_label");
    DOM["#interval-label"].innerText = chrome.i18n.getMessage("popup_interval_label");
    DOM["#setup-use-links-accept-input"].value = chrome.i18n.getMessage("popup_accept_input");
    DOM["#setup-use-links-cancel-input"].value = chrome.i18n.getMessage("popup_cancel_input");
    DOM["#setup-modify-url-accept-input"].value = chrome.i18n.getMessage("popup_accept_input");
    DOM["#setup-modify-url-cancel-input"].value = chrome.i18n.getMessage("popup_cancel_input");
    // Add Event Listeners to the DOM elements
    DOM["#next-input"].addEventListener("click", clickNext, false);
    DOM["#prev-input"].addEventListener("click", clickPrev, false);
    DOM["#clear-input"].addEventListener("click", clickClear, false);
    DOM["#setup-use-links-input"].addEventListener("click",  function () { toggleView(this); }, false);
    DOM["#setup-modify-url-input"].addEventListener("click", function () { toggleView(this); }, false);
    DOM["#setup-use-links-cancel-input"].addEventListener("click", function () { toggleView(this); }, false);
    DOM["#setup-modify-url-cancel-input"].addEventListener("click", function () { toggleView(this); }, false);
    DOM["#setup-use-links-accept-input"].addEventListener("click", submitForm, false);
    DOM["#setup-modify-url-accept-input"].addEventListener("click", submitForm, false);
    DOM["#url-textarea"].addEventListener("mouseup", selectURL, false);
    DOM["#url-textarea"].addEventListener("keyup", selectURL, false);
    // Get this active tab's instance and update images
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        chrome.storage.sync.get(null, function(o) {
          instance = backgroundPage.URLNP.Background.getInstance(tabs[0], o);
          DOM["#url-textarea"].value = instance.tab.url;
          DOM["#selection-input"].value = instance.selection;
          DOM["#interval-input"].value = instance.interval;
          updateImages();
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
    console.log("clickNext()");
    if (instance.enabled) {
      console.log("\tgoing next");
      chrome.runtime.sendMessage({greeting: "updateTab", direction: "next", id: instance.tab.id}, function (response) {});
    }
  }

  /**
   * Updates this tab to the previous URL if the instance is enabled.
   * 
   * @private
   */
  function clickPrev() {
    console.log("clickPrev()");
    if (instance.enabled) {
      console.log("\tgoing prev");
      chrome.runtime.sendMessage({greeting: "updateTab", direction: "prev", id: instance.tab.id}, function (response) {});
    }
  }

  /**
   * Clears and disables this tab's instance if it is enabled.
   * 
   * @private
   */
  function clickClear() {
    console.log("clickClear()");
    if (instance.enabled) {
      console.log("\tclearing instance");
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.setInstance(instance.tab, undefined);
        instance.enabled = false;
        updateImages();
      });
    }
  }

  /**
   * Toggles the popup between the controls and the setup views.
   * 
   * @param el the element that triggered the toggle (e.g. the input/button)
   * @private
   */
  function toggleView(el) {
    console.log("toggleView(el)");
    switch (el.id) {
      case "setup-use-links-input":
        DOM["#controls"].className = "fade-out";
        setTimeout(function() {
          DOM["#controls"].classList.add("display-none");
          DOM["#setup-use-links"].className = "display-block fade-in";
        }, 300);
        break;
      case "setup-modify-url-input":
        DOM["#controls"].className = "fade-out";
        setTimeout(function() {
          DOM["#controls"].classList.add("display-none");
          DOM["#setup-modify-url"].className = "display-block fade-in";
          DOM["#url-textarea"].focus();
          DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
        }, 300);
        break;
      case "setup-use-links-accept-input":
      case "setup-use-links-cancel-input":
        DOM["#setup-use-links"].className = "fade-out";
        setTimeout(function() {
          DOM["#setup-use-links"].classList.add("display-none");
          DOM["#controls"].className = "display-block fade-in";
        }, 300);
        break;
      case "setup-modify-url-accept-input":
      case "setup-modify-url-cancel-input":
        DOM["#setup-modify-url"].className = "fade-out";
        setTimeout(function() {
          DOM["#setup-modify-url"].classList.add("display-none");
          DOM["#controls"].className = "display-block fade-in";
        }, 300);
        break;
      default:
        break;
    }
  }

  /**
   * Updates the images' class to either enabled or disabled depending on
   * whether this instance is enabled.
   * 
   * @private
   */
  function updateImages() {
    console.log("updateImages()");
    var className = instance.enabled ? "enabled" : "disabled";
    DOM["#next-input"].className = className;
    DOM["#prev-input"].className = className;
    DOM["#clear-input"].className = className;
  }

  /**
   * Handle URL selection on mouseup and keyup events. Saves the selectionStart
   * to a temp value and updates the selection input to show the selected text.
   * 
   * @private
   */
  function selectURL() {
    console.log("selectURL()");
    instance.tempSelectionStart = DOM["#url-textarea"].selectionStart;
    DOM["#selection-input"].value = window.getSelection().toString();
    console.log("\tselection-input.value=" + DOM["selection-input"].value);
  }

  /**
   * Submits the form. First validates user input for any errors then saves the
   * values to the instance and toggles the view back to the controls.
   * 
   * @private
   */
  function submitForm() {
    console.log("submitForm()");
    var selection = DOM["#selection-input"].value,
        interval = DOM["#interval-input"].value,
        errors = [
          selection === "" ? chrome.i18n.getMessage("popup_selection_blank_error") : "",
          instance.tab.url.indexOf(selection) === -1 ? chrome.i18n.getMessage("popup_selection_notinurl_error") : "",
          interval === "" ? chrome.i18n.getMessage("popup_interval_blank_error") : "",
          interval === "0" ? chrome.i18n.getMessage("popup_interval_0_error") : "",
          parseInt(interval, 10) < 0 ? chrome.i18n.getMessage("popup_interval_negative_error") : ""
        ];
    // We can tell there was an error if any of the array slots weren't empty
    if (errors[0] !== "" || errors[1] !== "" || errors[2] !== "" || errors[3] !== "") {
      console.log("\terrors:" + errors);
      URLNP.UI.generateAlert(errors);
    } else {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        chrome.storage.sync.get(null, function(o) {
          instance.enabled = true;
          instance.mode = "modify-url";
          instance.interval = interval;
          instance.selection = selection;
          instance.selectionStart = instance.tempSelectionStart;
          instance.tempSelectionStart = undefined;
          backgroundPage.URLNP.Background.setInstance(instance.tab, instance);
          toggleView(DOM["#setup-modify-url-accept-input"]);
          updateImages();
          if (o.keyEnabled) {
            console.log("\t\tadding keyListener");
            chrome.tabs.sendMessage(instance.tab.id, {greeting: "addKeyListener"}, function (response) {});
          }
        });
      });
    }
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);