/*

URL+N for Google Chrome
Copyright (c) 2011-2015 Roy Six
License: LGPL v3.0

Derived from:
Proxy Settings, a sample Google Chrome extension
Copyright (c) 2009, Google Inc.
License: BSD

*/

console.log("popup starting");

// JavaScript Revealing Module Pattern

var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {
  
	console.log("function URLNP.Popup");

	var urlnp,
		currentTab,
		selectionStart = -1,
		uiHelper = URLNP.UIHelper,
		
    /**
     * Loads the DOM content needed to display the popup.
     * 
     * @public
     */
		DOMContentLoaded = function () {
			console.log("\tfunction DOMContentLoaded");
			// Add Event Listeners to the DOM elements (inputs)
			// Note: You can also do (for example):
			// document.getElementById("decrementImage").onclick = clickDecrement;
			console.log("\t\tadding event listeners");
			document.getElementById("next-input").addEventListener("click", clickIncrement, false);
			document.getElementById("prev-input").addEventListener("click", clickDecrement, false);
			document.getElementById("clear-input").addEventListener("click", clickClear, false);
			document.getElementById("setup-input").addEventListener("click", toggleForm, false);
			document.getElementById("url-textarea").addEventListener("mouseup", handleURL, false);
			document.getElementById("url-textarea").addEventListener("keyup", handleURL, false);
			document.getElementById("accept-input").addEventListener("click", submitForm, false);
			document.getElementById("cancel-input").addEventListener("click", toggleForm, false);
			document.getElementById("popup-form").addEventListener("click", uiHelper.dispatchFormClick_.bind(this));
			// Set localization text (i18n) from messages.json
			console.log("\t\tadding i18n text");
			document.getElementById("next-input").title = chrome.i18n.getMessage("popup_next_input");
			document.getElementById("prev-input").title = chrome.i18n.getMessage("popup_prev_input");
			document.getElementById("clear-input").title = chrome.i18n.getMessage("popup_clear_input");
			document.getElementById("setup-input").title = chrome.i18n.getMessage("popup_setup_input");
			document.getElementById("url-legend").innerText = chrome.i18n.getMessage("popup_url_legend");
			document.getElementById("url-label").innerText = chrome.i18n.getMessage("popup_url_label"); 
			document.getElementById("selection-label").innerText = chrome.i18n.getMessage("popup_selection_label"); 
			document.getElementById("interval-label").innerText = chrome.i18n.getMessage("popup_interval_label");
			document.getElementById("accept-input").value = chrome.i18n.getMessage("popup_accept_input");
			document.getElementById("cancel-input").value = chrome.i18n.getMessage("popup_cancel_input");
			// Check the currentstate (enabled or disabled) and update the input
			// images accordingly
			chrome.runtime.sendMessage({greeting: "getUrli"},
				function (response) {
					urlnp = response;
					console.log("\t\tgetting urlnp (urlnp.enabled=" + urlnp.enabled+")");
					updateImages();
				}
			);
			// Set the current tab
			chrome.tabs.getSelected(null,
				function (tab) {
					currentTab = tab;
					console.log("\t\tgetting currentTab (currentTab.id=" + currentTab.id +")");
				}
			);
		},
		
		
    /**
     * Initializes the popup form each time the tab is updated or when the
     * user clicks on the setup input to show the form.
     * 
     * @private
     */ 
		initForm = function (response) {
			console.log("\tfunction initForm");
			// Fill out the form elements' contents and load the default values
			selectionStart = response.selectionStart;
			document.getElementById("url-textarea").value = currentTab.url;
			document.getElementById("url-textarea").setSelectionRange(selectionStart, selectionStart + response.selection.length);
			document.getElementById("selection-input").value = response.selection;
			document.getElementById("interval-input").value = response.defaultIncrement;
		},
		
		// Changes the class of the images to either disabled or enabled
		// depending on the response (state of response.enabled).
		updateImages = function () {
			console.log("\tfunction updateImages");
			var imageNodeList,
				i,
				length;
		
			// Get the images.  Assume they're disabled, their default state in the
			// HTML (we really don't know yet).
		
			imageNodeList = document.querySelectorAll(".disabled");
		
			// If the images disabled nodelist is empty, it means they're
			// currently enabled instead, so get them.
		
			if (imageNodeList.length === 0) {
				imageNodeList = document.querySelectorAll(".enabled");
			}
		
			// If urlnp is enabled, images should be enabled.
		
			if (urlnp.enabled) {
				console.log("\t\turlnp enabled so images enabled");
				for (i = 0, length = imageNodeList.length; i < length; i++) {
					imageNodeList[i].className = "enabled";
				}
			}
		
			// Else urlnp is not enabled, images should be disabled.
		
			else {
				console.log("\t\turlnp disabled so images disabled");
				for (i = 0, length = imageNodeList.length; i < length; i++) {
					imageNodeList[i].className = "disabled";
				}
			}
		},
		
		// Handle URL event on mouseup and onkeyup for selection.
		handleURL = function () {
			console.log("\tfunction handleURL");
			// Stores the selectionStart for later (to be returned to background.html).
			selectionStart = document.getElementById("url-textarea").selectionStart;
			// Update the "selectionInput" element to show the selected text.
			document.getElementById("selection-input").value = window.getSelection().toString();
			console.log("\t\tselection-input.value=" + document.getElementById("selection-input").value);
		},
		
		// Called when the user clicks on the Accept button on the form.  Checks
		// to make sure there are no errors with any of the fields, and if not,
		// passes the data back to the urlnp object in background.html.
		submitForm = function () {
			console.log("\tfunction submitForm");
			var errorMessage = [],
				errorCount = 0,
				selection = document.getElementById("selection-input").value,
				interval = document.getElementById("interval-input").value,
				i,
				length;
		
			// ERROR If the user selected text somewhere else and released the
			// mouse in the textearea element.  Unfortunately, selectionStart
			// will be 0 and we can't disallow legitimate selections from
			// 0th position in the URL (as unlikely as they may be).
		
			// if (selectionStart === 0) {
				// Do something.
			// }
		
			// ERROR If the selected text from the URL are not digits (0-9).
		
		// 	for (i = 0, length = selection.length; i < length; i++) {
		// 		if (selection.charCodeAt(i) < 48 || selection.charCodeAt(i) > 57) {
		// 			errorMessage[errorCount++] = chrome.i18n.getMessage("popupSelectionNaNError");
		// 			break;
		// 		}
		// 	}
		
			// ERROR If the selection is blank.
		
			if (selection === "") {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_empty_error");
			}
		
			// ERROR If the selection is not a part of the URL.
		
			if (currentTab.url.indexOf(selection) === -1) {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_notinurl_error");
			}
		
			// ERROR If the interval is not a number.
		// 	for (i = 0, length = interval.length; i < length; i++) {
		// 		if (interval.charCodeAt(i) < 48 || interval.charCodeAt(i) > 57) {
		// 			errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_nan_error");
		// 			break;
		// 		}
		// 	}
		
			// ERROR If the interval is blank.
		
			if (interval === "") {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_empty_error");
			}
		
			// ERROR If the interval is 0.
		
			if (interval === "0") {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_0_error");
			}

			// If there was an error, show the error message
		
			if (errorCount !== 0) {
				console.log("\t\terrorMessage:" + errorMessage);
				uiHelper.generateAlert_(errorMessage, false);
			}
		
			// Else there was not an error (successful)...
		
			else {
				console.log("\t\tsuccess -- now enabling urlnp");
				// Stores the form's information into urlnp, update the images
				// (enabled) and hide the form by toggling it.
				urlnp.enabled = true;
				urlnp.tab = currentTab;
				chrome.runtime.sendMessage({greeting: "onPopupFormAccept", enabled: urlnp.enabled, tab: currentTab, selection: selection, selectionStart: selectionStart, increment: increment}, function (response) {});
				updateImages();
				toggleForm();
			}
		},
		
		// User clicked on Increment image; need to find out if urlnp is enabled
		// and if the current tab is urlnp's tab before sending a request to
		// increment via modifyUrliAndUpdateTab.
		
		clickIncrement = function () {
			console.log("\tfunction clickIncrement");
			if (urlnp.enabled && urlnp.tab.id === currentTab.id) {
				console.log("\t\tincrementing urlnp");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Increment"}, function (response) {});
			}
		},
		
		// User clicked on Decrement image; need to find out if urlnp is enabled
		// and if the current tab is urlnp's tab before sending a request to
		// decrement via modifyU?rliAndUpdateTab.
		
		clickDecrement = function () {
			console.log("\tfunction clickDecrement");
			if (urlnp.enabled && urlnp.tab.id === currentTab.id) {
				console.log("\t\tdecrementing urlnp");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Decrement"}, function (response) {});
			}
		},
		
		// Send request to clear urlnp's info and then go to
		// updateImages to set images to "off."  Enabled should always
		// return false so a request to fetch urlnp seems redundant, but
		// unavoidable without adding a new function...
		
		clickClear = function () {
			console.log("\tfunction clickClear");
			if (urlnp.enabled) {
				console.log("\t\tclearing urlnp");
				urlnp.enabled = false;
				chrome.runtime.sendMessage({greeting: "clearUrli"}, function (response) {});
				updateImages();
			}
		},
		
		/**
		 * Toggles the popup form. When the user clicks the setup input, the form
		 * will expand and be visible. When the user clicks the Cancel input, the
		 * form will be hidden and the popup controls view will return.
		 */ 
		toggleForm = function () {
			console.log("\tfunction toggleForm");
			var form = document.getElementById("popup-form"),
			    controls = document.getElementById("popup-controls");
			console.log("\t\tform.style.display=" + form.style.display);
			if (form.style.display === "block") {
  			// Hide form, show controls, reduce body (popup window) size
				form.style.display = "none";
				controls.style.display = "inline";
				document.body.style.width = "82px";
				document.body.style.height = "16px";
				document.body.style.background = "#EDECEB";
			} else {
  			// Show form, hide controls, increase body (popup window) size, update tab
				form.style.display = "block";
				controls.style.display = "none";
				document.body.style.width = "auto" /*'583px' */;
				document.body.style.height = "auto"/*'287px'*/;
				document.body.style.background = "#FFFFFF";
				chrome.tabs.getSelected(null,
					function(tab) {
						currentTab = tab;
						chrome.runtime.sendMessage({greeting: "processSelection", url: currentTab.url}, initForm);
					}
				);
			}
		};

		// Public methods list.
		return {
			DOMContentLoaded: DOMContentLoaded
		};
		
}();

// DOMContentLoaded will fire when the DOM is loaded but unlike "load" it does not wait for images, etc.
// It is being standardized in HTML5

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);
