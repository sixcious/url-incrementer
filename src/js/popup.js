// TODO

console.log("URLNP.Popup");

/**
 * URL Next Plus Popup.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */ 
var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {

  var instance, // Stores this tab's instance
      // currentTab,
      //selectionStart = -1,
      // selectionProperties = { selection: "", selectionStart: -1 },
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
      DOM[ids[i].id] = ids[i];
    }
    // Set localization text (i18n) from messages.json
    DOM["next-input"].title = chrome.i18n.getMessage("popup_next_input");
    DOM["prev-input"].title = chrome.i18n.getMessage("popup_prev_input");
    DOM["clear-input"].title = chrome.i18n.getMessage("popup_clear_input");
    DOM["setup-use-links-input"].title = chrome.i18n.getMessage("popup_setup_input");
    DOM["setup-modify-url-input"].title = chrome.i18n.getMessage("popup_setup_input");
//DOM["url-legend").innerText = chrome.i18n.getMessage("popup_url_legend");
    DOM["url-label"].innerText = chrome.i18n.getMessage("popup_url_label"); 
    DOM["selection-label"].innerText = chrome.i18n.getMessage("popup_selection_label"); 
    DOM["interval-label"].innerText = chrome.i18n.getMessage("popup_interval_label");
    DOM["accept-input"].value = chrome.i18n.getMessage("popup_accept_input");
    DOM["cancel-input"].value = chrome.i18n.getMessage("popup_cancel_input");
    // Add Event Listeners to the DOM elements
    DOM["next-input"].addEventListener("click", clickNext, false);
    DOM["prev-input"].addEventListener("click", clickPrev, false);
    DOM["clear-input"].addEventListener("click", clickClear, false);
    DOM["setup-use-links-input"].addEventListener("click", toggleView, false);
    DOM["setup-modify-url-input"].addEventListener("click", toggleView, false);
    DOM["url-textarea"].addEventListener("mouseup", selectURL, false);
    DOM["url-textarea"].addEventListener("keyup", selectURL, false);
    DOM["accept-input"].addEventListener("click", submitForm, false);
    DOM["cancel-input"].addEventListener("click", toggleView, false);
    // Set the current tab, instance, and update images
    chrome.tabs.query({active: true}, function (tab) {
      // currentTab = tab;
      console.log("\tgetting currentTab (tab.id=" + tab.id +")");
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        console.log("backgroundPage=" + backgroundPage);
        instance = backgroundPage.URLNP.Background.getInstance(tab);
        console.log("instance=" + instance);
        DOM["url-textarea"].value = instance.tab.url;
        DOM["url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
        DOM["selection-input"].value = instance.selection;
        DOM["interval-input"].value = instance.interval;
        updateImages();
      });
    });
    // chrome.storage.sync.get(null, function (o) {
    //   DOM["interval-input"].value = o.defaultInterval;
    // });
 // 		chrome.tabs.getSelected(null,
  // 			function(tab) {
  // 				currentTab = tab;
  // 				//chrome.runtime.sendMessage({greeting: "findSelection", url: currentTab.url}, initForm);
  // 				// initForm();
  // 	//console.log("\tfunction initForm");
  // 	// Fill out the form elements' contents and load the default values
  // 	chrome.runtime.getBackgroundPage(function(backgroundPage) {
  // 	  selectionProperties = backgroundPage.URLNP.Background.findSelection(currentTab.url);
  // 	  // selectionStart = selectionProperties.selectionStart;
  // 		DOM["url-textarea"].value = currentTab.url;
  // 		DOM["url-textarea"].setSelectionRange(selectionProperties.selectionStart, selectionProperties.selectionStart + selectionProperties.selection.length);
  // 		DOM["selection-input"].value = selectionProperties.selection;
  // 	});
  //   if (!DOM["interval-input"].value) {
  //     chrome.storage.sync.get(null, function (o) {
  //       DOM["interval-input"].value = o.defaultInterval;
  //     });
  //   }
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
		  instance = {
		    enabled: false,
		    tab: instance.tab,
		    selection: "",
		    selectionStart: -1,
		    interval: 0
		  };
  		chrome.runtime.getBackgroundPage(function(backgroundPage) {
  		  backgroundPage.URLNP.Background.setInstance(instance);
  		  updateImages();
  		});
  	}
  }
  	
  /**
   * Toggles the popup between the controls and the setup views.
   * 
   * @private
   */ 
  function toggleView() {
  	console.log("toggleView()");
  	switch (this.id) {
  	  case "setup-use-links-input":
  	    DOM["popup-controls"].className = "display-none";
        DOM["popup-setup-use-links"].className = "fade-in";
        break;
      case "setup-modify-url-input":
  	    DOM["popup-controls"].className = "display-none";
        DOM["popup-setup-modify-url"].className = "fade-in";
        break;
      case "accept-input":
        DOM["popup-controls"].className = "fade-in";
        DOM["popup-setup-use-links"].className = "display-none";
        break;
      case "cancel-input":
  	    DOM["popup-controls"].className = "fade-in";
        DOM["popup-setup-use-links"].className = "display-none";
        break;
      default:
        break;
  	}


  // 	var form = DOM["popup-form"],
  // 	    controls = DOM["popup-controls"];
  // 	console.log("\t\tform.style.display=" + form.style.display);
  // 	if (form.style.display === "block") {
  // 		// Hide form, show controls, reduce body (popup window) size
  // 		form.style.display = "none";
  // 		controls.style.display = "inline";
  // 		document.body.style.width = "102px";
  // 		document.body.style.height = "16px";
  // 		document.body.style.background = "#EDECEB";
  // 	} else {
  // 		// Show form, hide controls, increase body (popup window) size, update tab
  // 		form.style.display = "block";
  // 		controls.style.display = "none";
  // 		document.body.style.width = "auto" /*'583px' */;
  // 		document.body.style.height = "auto"/*'287px'*/;
  // 		document.body.style.background = "#FFFFFF";
  // 		chrome.tabs.getSelected(null,
  // 			function(tab) {
  // 				currentTab = tab;
  // 				//chrome.runtime.sendMessage({greeting: "findSelection", url: currentTab.url}, initForm);
  // 				// initForm();
  // 	//console.log("\tfunction initForm");
  // 	// Fill out the form elements' contents and load the default values
  // 	chrome.runtime.getBackgroundPage(function(backgroundPage) {
  // 	  selectionProperties = backgroundPage.URLNP.Background.findSelection(currentTab.url);
  // 	  // selectionStart = selectionProperties.selectionStart;
  // 		DOM["url-textarea"].value = currentTab.url;
  // 		DOM["url-textarea"].setSelectionRange(selectionProperties.selectionStart, selectionProperties.selectionStart + selectionProperties.selection.length);
  // 		DOM["selection-input"].value = selectionProperties.selection;
  // 	});
  //   if (!DOM["interval-input"].value) {
  //     chrome.storage.sync.get(null, function (o) {
  //       DOM["interval-input"].value = o.defaultInterval;
  //     });
  //   }
  // 			}
  // 		);
  // 	}
  }

  /**
   * Updates the images' class to either enabled or disabled depending on
   * whether this instance is enabled.
   * 
   * @private
   */ 
  function updateImages() {
    console.log("updateImages()");
    var className = /*instance && */ instance.enabled /*&& instance.tab.id === currentTab.id */? "enabled" : "disabled";
    DOM["next-input"].className = className;
    DOM["prev-input"].className = className;
    DOM["clear-input"].className = className;
  }

  /**
   * Handle URL selection on mouseup and keyup events. Sets the instance's
   * selectionStart and updates the selection input to show the selected text.
   * 
   * @private
   */ 
  function selectURL() {
    console.log("selectURL()");
    instance.selectionStart = DOM["url-textarea"].selectionStart;
    DOM["selection-input"].value = window.getSelection().toString();
    console.log("\tselection-input.value=" + DOM["selection-input"].value);
  }
  	
  // Called when the user clicks on the Accept button on the form. Checks
  // to make sure there are no errors with any of the fields, and if not,
  // passes the data back to the urlnp object in background.html.
  function submitForm() {
  	console.log("submitForm()");
  	var selection = DOM["selection-input"].value,
        interval = DOM["interval-input"].value,
        errors = [
      	  selection === "" ? chrome.i18n.getMessage("popup_selection_blank_error") : "",
      	  instance.tab.url.indexOf(selection) === -1 ? chrome.i18n.getMessage("popup_selection_notinurl_error") : "",
      	  interval === "" ? chrome.i18n.getMessage("popup_interval_blank_error") : "",
      	  interval === "0" ? chrome.i18n.getMessage("popup_interval_0_error") : "",
      	  parseInt(interval, 10) < 0 ? chrome.i18n.getMessage("popup_interval_negative_error") : ""
    	  ];
  	if (errors.length > 0) {
  		console.log("\terrors:" + errors);
  		URLNP.UI.generateAlert(errors);
  	} else {
  	  
  	}
  	  // 	var errorMessage = [],
  // 		errorCount = 0,
  // 		selection = DOM["selection-input"].value,
  // 		interval = DOM["interval-input"].value,
  // 		i,
  // 		length;
  	// ERROR If the selected text from the URL are not digits (0-9).
  // 	for (i = 0, length = selection.length; i < length; i++) {
  // 		if (selection.charCodeAt(i) < 48 || selection.charCodeAt(i) > 57) {
  // 			errorMessage[errorCount++] = chrome.i18n.getMessage("popupSelectionNaNError");
  // 			break;
  // 		}
  // 	}
  	// ERROR If the selection is blank.

  // 	if (selection === "") {
  // 		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_blank_error");
  // 	}
  // 	// ERROR If the selection is not a part of the URL.
  // 	if (currentTab.url.indexOf(selection) === -1) {
  // 		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_notinurl_error");
  // 	}
  // 	// ERROR If the interval is negative (-) or not a number.
  // 	for (i = 0, length = interval.length; i < length; i++) {
  // 		if (interval.charCodeAt(i) < 48 || interval.charCodeAt(i) > 57) {
  // 			errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_negative_error");
  // 			break;
  // 		}
  // 	}
  // 	// ERROR If the interval is blank.
  // 	if (interval === "") {
  // 		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_blank_error");
  // 	}
  // 	// ERROR If the interval is 0.
  // 	if (interval === "0") {
  // 		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_0_error");
  // 	}
  // 	// If there was an error, show the error message
  // 	if (errorCount !== 0) {
  // 		console.log("\t\terrorMessage:" + errorMessage);
  // 		URLNP.UI.generateAlert(errorMessage);
  // 	}
  // 	// Else there was not an error (successful)...
  // 	else {
  // 		console.log("\t\tsuccess -- now enabling urlnp");
  // 		// Stores the form's information into urlnp, update the images
  // 		// (enabled) and hide the form by toggling it.
  // 		instance.enabled = true;
  // 		// urlnp.tab = currentTab;
  // 		chrome.runtime.getBackgroundPage(function(backgroundPage) {
  // 		  backgroundPage.URLNP.Background.setInstance(instance);  
  // 			updateImages();
  // 			toggleForm();
  //       chrome.storage.sync.get(null, function (o) {
  // 				if (o.keyEnabled) {
  //     			console.log("\t\tadding keyListener");
  //     			//chrome.tabs.sendMessage(instance.getTab().id, {greeting: "setKeys", keyCodeIncrement: localStorage.keyCodeIncrement, keyEventIncrement: localStorage.keyEventIncrement, keyCodeDecrement: localStorage.keyCodeDecrement, keyEventDecrement: localStorage.keyEventDecrement, keyCodeClear: localStorage.keyCodeClear, keyEventClear: localStorage.keyEventClear}, function(response) {});
  //     			chrome.tabs.sendMessage(instance.tab.id, {greeting: "addKeyListener"}, function (response) {});
  //     		}
  //       });
  // 		});
  // 		//chrome.runtime.sendMessage({greeting: "onPopupFormAccept", enabled: urlnp.enabled, tab: currentTab, selection: selection, selectionStart: selectionStart, interval: interval}, function (response) {});
  // 	}
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);