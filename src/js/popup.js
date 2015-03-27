/*

Derived from:
Copyright (c) 2009, Google Inc.
Proxy Settings, a sample Google extension, by Mike West
http://code.google.com/chrome/extensions/samples.html
License: BSD

Copyright (c) 2012 Roy Six
http://code.google.com/p/urli/
License: LGPL v3.0

*/

console.log("urli popup starting");

// JavaScript Revealing Module Pattern

var URLI = URLI || {};
URLI.Popup = URLI.Popup || function () {

	//"use strict";

	console.log("function URLI.Popup");

	var urli,
		currentTab,
		selectionStart = -1,
		fieldsetGroups = document.querySelectorAll('#' + 'setupForm' + ' > fieldset'), // Nodelist containing cached reference to the fieldset groups.

		// ? can also do document.getElementById("decrementImage").onclick = clickDecrement;
		// Gets the current state of urli (enabled status)
		// and the appropriate images are loaded accordingly.  Then adds event listeners for the DOM elemetns and loads the
		// localization from messages.json for the form.

		DOMContentLoaded = function () {
			console.log("\tfunction DOMContentLoaded");

			// Add Event Listeners to the DOM elements.

			console.log("\t\tadding event listeners");
			document.getElementById("incrementImage").addEventListener("click", clickIncrement, false);
			document.getElementById("decrementImage").addEventListener("click", clickDecrement, false);
			document.getElementById("clearImage").addEventListener("click", clickClear, false);
			document.getElementById("setupImage").addEventListener("click", toggleForm, false);
			document.getElementById("URLTextarea").addEventListener("mouseup", handleURL, false);
			document.getElementById("URLTextarea").addEventListener("keyup", handleURL, false);
			document.getElementById("acceptInput").addEventListener("click", submitForm, false);
			document.getElementById("cancelInput").addEventListener("click", toggleForm, false);
			document.getElementById("setupForm").addEventListener("click", dispatchFormClick_.bind(this));
		
			// i18n for messages.json.

			console.log("\t\tadding i18n text");
			document.getElementById("incrementImage").title = chrome.i18n.getMessage("popupIncrementImage");
			document.getElementById("decrementImage").title = chrome.i18n.getMessage("popupDecrementImage");
			document.getElementById("clearImage").title = chrome.i18n.getMessage("popupClearImage");
			document.getElementById("setupImage").title = chrome.i18n.getMessage("popupSetupImage");
			document.getElementById("URLLegend").innerText = chrome.i18n.getMessage("popupURLLegend");
			document.getElementById("URLLabel").innerText = chrome.i18n.getMessage("popupURLLabel"); 
			document.getElementById("selectionLabel").innerText = chrome.i18n.getMessage("popupSelectionLabel"); 
			document.getElementById("optionsLegend").innerText = chrome.i18n.getMessage("popupOptionsLegend");
			document.getElementById("incrementLabel").innerText = chrome.i18n.getMessage("popupIncrementLabel");
			document.getElementById("zerosLabel").innerText = chrome.i18n.getMessage("popupZerosLabel");
			document.getElementById("acceptInput").value = chrome.i18n.getMessage("popupAcceptInput");
			document.getElementById("cancelInput").value = chrome.i18n.getMessage("popupCancelInput");

			// Get urli and update the images depending on urli's enabled state.

			chrome.runtime.sendMessage({greeting: "getUrli"},
				function (response) {
					urli = response;
					console.log("\t\tgetting urli (urli.enabled=" + urli.enabled+")");
					updateImages();
				}
			);

			// Get currentTab.

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
		
		// Generate alert overlay (popup message).
		// From the sample Google extension, Proxy Settings by Mike West.
		
		generateAlert_ = function (msg, close) {
			console.log("\tfunction generateAlert_");
			var	success = document.createElement('div'),
				ul = document.createElement('ul'),
				li,
				i,
				length;

			success.classList.add('overlay');
			success.setAttribute('role', 'alert');
			ul.classList.add('overlay_list');

			for (i = 0, length = msg.length; i < length; i++) {
				li = document.createElement('li');
				li.appendChild(document.createTextNode(msg[i]));
				ul.appendChild(li);
			}
			success.appendChild(ul);
			//success.textContent = msg;
			document.body.appendChild(success);

			setTimeout(function() { success.classList.add('visible'); }, 10);
			setTimeout(function() {
				if (close === false) {
					// success.classList.remove('visible');
					document.body.removeChild(success);
				} else {
					window.close();
				}
			}, 3000);
		},
		
		// Click event handler on the form.
		// From the sample Google extension, Proxy Settings by Mike West.
		
		dispatchFormClick_ = function (e) {
			console.log("\tfunction dispatchFormClick_");
			var t = e.target;
		
			// Walk up the tree until we hit `form > fieldset` or fall off the top
		
			while (t && (t.nodeName !== 'FIELDSET' || t.parentNode.nodeName !== 'FORM')) {
				t = t.parentNode;
			}
		
			if (t) {
				changeActive_(t);
				return false;
			}
		
			return true;
		},
		
		// Sets the form's active config group.
		// From the sample Google extension, Proxy Settings by Mike West.
		
		changeActive_ = function (fieldset) {
			console.log("\tfunction changeActive_");
			var	el,
				i,
				length;
			for (i = 0, length = fieldsetGroups.length; i < length; i++) {
				el = fieldsetGroups[i];
		
				if (el === fieldset) {
					el.classList.add('active');
				} else {
					el.classList.remove('active');
				}
			}
		
			recalcDisabledInputs_();
		},
		
		// Recalculates the disabled state of the form's input elements, based
		// on the currently active group.
		// From the sample Google extension, Proxy Settings by Mike West.
		
		recalcDisabledInputs_ = function () {
			console.log("\tfunction recalcDisabledInputs_");
			var	el,
				inputs,
				i,
				j,
				length,
				lengthJ;
		
			for (i = 0, length = fieldsetGroups.length; i < length; i++) {
				el = fieldsetGroups[i];
				inputs = el.querySelectorAll("input:not([type='radio']), select, textarea");
		
				if (el.classList.contains('active')) {
					for (j = 0, lengthJ = inputs.length; j < lengthJ; j++) {
						inputs[j].removeAttribute('disabled');
					}
		
				} else {
		
					for (j = 0, lengthJ = inputs.length; j < lengthJ; j++) {
						inputs[j].setAttribute('disabled', 'disabled');
					}
		
				}
			}
		};

		// Public methods list.
		return {
			DOMContentLoaded: DOMContentLoaded
		};
}();

// DOMContentLoaded will fire when the DOM is loaded but unlike "load" it does not wait for images, etc.
// It is being standardized in HTML5

document.addEventListener("DOMContentLoaded", URLI.Popup.DOMContentLoaded, false);
