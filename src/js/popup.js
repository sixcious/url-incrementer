/*

URL+N for Google Chrome
Copyright (c) 2011-2015 Roy Six
License: LGPL v3.0

Derived from:
Proxy Settings, a sample Google Chrome extension
Copyright (c) 2009, Google Inc.
License: BSD

*/

console.log("urli popup starting");

// JavaScript Revealing Module Pattern

var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {
  
	console.log("function URLNP.Popup");

	var urli,
		currentTab,
		selectionStart = -1,
		fieldsetGroups = document.querySelectorAll('#' + 'setupForm' + ' > fieldset'), // Nodelist containing cached reference to the fieldset groups.
		
    /**
     * Loads the DOM content needed to display the popup.
     */
		DOMContentLoaded = function () {
			console.log("\tfunction DOMContentLoaded");
			// Add Event Listeners to the DOM elements (inputs)
			// Note: You can also do (for example):
			// document.getElementById("decrementImage").onclick = clickDecrement;
			console.log("\t\tadding event listeners");
			document.getElementById("next-plus-input").addEventListener("click", clickIncrement, false);
			document.getElementById("prev-minus-input").addEventListener("click", clickDecrement, false);
			document.getElementById("clear-input").addEventListener("click", clickClear, false);
			document.getElementById("setup-input").addEventListener("click", toggleForm, false);
			document.getElementById("url-textarea").addEventListener("mouseup", handleURL, false);
			document.getElementById("url-textarea").addEventListener("keyup", handleURL, false);
			document.getElementById("accept-input").addEventListener("click", submitForm, false);
			document.getElementById("cancel-input").addEventListener("click", toggleForm, false);
			document.getElementById("popup-form").addEventListener("click", dispatchFormClick_.bind(this));
			// Set localization text (i18n) from messages.json
			console.log("\t\tadding i18n text");
			document.getElementById("next-plus-input").title = chrome.i18n.getMessage("popup_next_plus_input_title");
			document.getElementById("prev-minus-input").title = chrome.i18n.getMessage("popup_prev_minus_input_title");
			document.getElementById("clear-butto").title = chrome.i18n.getMessage("popup_clear_input_title");
			document.getElementById("setup-button").title = chrome.i18n.getMessage("popup_setup_input_title");
			document.getElementById("url-legened").innerText = chrome.i18n.getMessage("popup_url_legend");
			document.getElementById("url-label").innerText = chrome.i18n.getMessage("popup_url_label"); 
			document.getElementById("selection-label").innerText = chrome.i18n.getMessage("popup_selection_label"); 
			document.getElementById("settings-legend").innerText = chrome.i18n.getMessage("popup_settings_legend");
			document.getElementById("interval-label").innerText = chrome.i18n.getMessage("popup_interval_label");
			document.getElementById("zeros-label").innerText = chrome.i18n.getMessage("popup_zeros_label");
			document.getElementById("accept-input").value = chrome.i18n.getMessage("popup_accept_input");
			document.getElementById("cancel-input").value = chrome.i18n.getMessage("popup_cancel_input");
			// Check the currentstate (enabled or disabled) and update the input
			// images accordingly
			chrome.runtime.sendMessage({greeting: "getUrli"},
				function (response) {
					urli = response;
					console.log("\t\tgetting urli (urli.enabled=" + urli.enabled+")");
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
		
		
		// Sets default values for elements in the form everytime the tab is
		// updated or when the user clicks on the Setup image to get to the
		// form.

		initForm = function (response) {
			console.log("\tfunction initForm");

			// Fill out the form elements' contents.
			// Loads the default values.

			selectionStart = response.selectionStart;
			document.getElementById("URLTextarea").value = currentTab.url;
			document.getElementById("URLTextarea").setSelectionRange(selectionStart, selectionStart + response.selection.length);
			document.getElementById("selectionInput").value = response.selection;
			document.getElementById("incrementInput").value = response.defaultIncrement;
			document.getElementById("zerosInput").checked = response.defaultZeros === "1" ? true : false;
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
		
			// If urli is enabled, images should be enabled.
		
			if (urli.enabled) {
				console.log("\t\turli enabled so images enabled");
				for (i = 0, length = imageNodeList.length; i < length; i++) {
					imageNodeList[i].className = "enabled";
				}
			}
		
			// Else urli is not enabled, images should be disabled.
		
			else {
				console.log("\t\turli disabled so images disabled");
				for (i = 0, length = imageNodeList.length; i < length; i++) {
					imageNodeList[i].className = "disabled";
				}
			}
		},
		
		// Handle URL event on mouseup and onkeyup for selection.
		
		handleURL = function () {
			console.log("\tfunction handleURL");

			// Stores the selectionStart for later (to be returned to background.html).
		
			selectionStart = document.getElementById("URLTextarea").selectionStart;
		
			// Update the "selectionInput" element to show the selected text.
			document.getElementById("selectionInput").value = window.getSelection().toString();
			console.log("\t\tselectionInput.value=" + document.getElementById("selectionInput").value);
		},
		
		// Called when the user clicks on the Accept button on the form.  Checks
		// to make sure there are no errors with any of the fields, and if not,
		// passes the data back to the urli object in background.html.
		
		submitForm = function () {
			console.log("\tfunction submitForm");
			var errorMessage = [],
				errorCount = 0,
				selection = document.getElementById("selectionInput").value,
				increment = document.getElementById("incrementInput").value,
				zeros = document.getElementById("zerosInput").checked,
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
				errorMessage[errorCount++] = chrome.i18n.getMessage("popupSelectionBlankError");
			}
		
			// ERROR If the selection is not a part of the URL.
		
			if (currentTab.url.indexOf(selection) === -1) {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popupSelectionNotInURLError");
			}
		
			// ERROR If the increment is not a number.
		
			for (i = 0, length = increment.length; i < length; i++) {
				if (increment.charCodeAt(i) < 48 || increment.charCodeAt(i) > 57) {
					errorMessage[errorCount++] = chrome.i18n.getMessage("popupIncrementNaNError");
					break;
				}
			}
		
			// ERROR If the increment is blank.
		
			if (increment === "") {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popupIncrementBlankError");
			}
		
			// ERROR If the increment is 0.
		
			if (increment === "0") {
				errorMessage[errorCount++] = chrome.i18n.getMessage("popupIncrementZeroError");
			}

			// If there was an error, show the error message
		
			if (errorCount !== 0) {
				console.log("\t\terrorMessage:" + errorMessage);
				generateAlert_(errorMessage, false);
			}
		
			// Else there was not an error (successful)...
		
			else {
				console.log("\t\tsuccess -- now enabling urli");
				// Stores the form's information into urli, update the images
				// (enabled) and hide the form by toggling it.
				urli.enabled = true;
				urli.tab = currentTab;
				chrome.runtime.sendMessage({greeting: "onPopupFormAccept", enabled: urli.enabled, tab: currentTab, selection: selection, selectionStart: selectionStart, increment: increment, zeros: zeros}, function (response) {});
				updateImages();
				toggleForm();
			}
		},
		
		// User clicked on Increment image; need to find out if urli is enabled
		// and if the current tab is urli's tab before sending a request to
		// increment via modifyUrliAndUpdateTab.
		
		clickIncrement = function () {
			console.log("\tfunction clickIncrement");
			if (urli.enabled && urli.tab.id === currentTab.id) {
				console.log("\t\tincrementing urli");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Increment"}, function (response) {});
			}
		},
		
		// User clicked on Decrement image; need to find out if urli is enabled
		// and if the current tab is urli's tab before sending a request to
		// decrement via modifyU?rliAndUpdateTab.
		
		clickDecrement = function () {
			console.log("\tfunction clickDecrement");
			if (urli.enabled && urli.tab.id === currentTab.id) {
				console.log("\t\tdecrementing urli");
				chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Decrement"}, function (response) {});
			}
		},
		
		// Send request to clear urli's info and then go to
		// updateImages to set images to "off."  Enabled should always
		// return false so a request to fetch urli seems redundant, but
		// unavoidable without adding a new function...
		
		clickClear = function () {
			console.log("\tfunction clickClear");
			if (urli.enabled) {
				console.log("\t\tclearing urli");
				urli.enabled = false;
				chrome.runtime.sendMessage({greeting: "clearUrli"}, function (response) {});
				updateImages();
			}
		},
		
		// Shows or hides the form.  For example, this is called each time the
		// user presses the "Cancel" button to hide it and go back to the 
		// initial images popup.  Or when the "Setup" Image is pressed to do the
		// opposite.
		
		toggleForm = function () {
			console.log("\tfunction toggleForm");
			var form = document.getElementById("form"),
				images = document.getElementById("images");
		
			console.log("\t\tform.style.display=" + form.style.display);

			// Hide form, show images, reduce body (popup window) size.

			if (form.style.display === "block") {
				form.style.display = "none";
				images.style.display = "inline";
				document.body.style.width = "82px";
				document.body.style.height = "16px";
				document.body.style.background = "#EDECEB";
			}
		
			// Show form, hide images, increase body (popup window) size, update tab
		
			else {
				form.style.display = "block";
				images.style.display = "none";
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
		},
		


		// Public methods list.
		return {
			DOMContentLoaded: DOMContentLoaded
		};
}();

// DOMContentLoaded will fire when the DOM is loaded but unlike "load" it does not wait for images, etc.
// It is being standardized in HTML5

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);
