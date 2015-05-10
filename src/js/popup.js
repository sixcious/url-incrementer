/**
 * TODO
 */ 

console.log("popup.js start");

var urlnp,
	  currentTab,
	  //selectionStart = -1,
	  selectionProperties = { selection: "", selectionStart: -1 };
	
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
	// Add Event Listeners to the DOM elements (inputs)
	console.log("\tadding event listeners");
	document.getElementById("next-input").addEventListener("click", clickNext, false);
	document.getElementById("prev-input").addEventListener("click", clickPrev, false);
	document.getElementById("clear-input").addEventListener("click", clickClear, false);
	document.getElementById("setup-input").addEventListener("click", toggleForm, false);
	document.getElementById("url-textarea").addEventListener("mouseup", handleURL, false);
	document.getElementById("url-textarea").addEventListener("keyup", handleURL, false);
	document.getElementById("accept-input").addEventListener("click", submitForm, false);
	document.getElementById("cancel-input").addEventListener("click", toggleForm, false);
	document.getElementById("popup-form").addEventListener("click", URLNP.UIHelper.dispatchFormClick_.bind(this));
	// Set localization text (i18n) from messages.json
	console.log("\tadding i18n text");
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
	// Set urlnp to get the enabled state and update the images
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
	  urlnp = backgroundPage.URLNP.Background.getURLNP();  
		updateImages();
	});
	// Set the current tab
	chrome.tabs.getSelected(null,
		function (tab) {
			currentTab = tab;
			console.log("\tgetting currentTab (currentTab.id=" + currentTab.id +")");
		}
	);
}
	
// Changes the class of the images to either disabled or enabled
// depending on the response (state of response.enabled).
function updateImages() {
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
	// If urlnp is enabled on this tab, images should be enabled.
	if (urlnp.enabled && ulrnp.tab.id === currentTab.id) {
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
}
	
// Handle URL event on mouseup and onkeyup for selection.
function handleURL() {
	console.log("\tfunction handleURL");
	// Stores the selectionStart for later (to be returned to background.html).
	selectionProperties.selectionStart = document.getElementById("url-textarea").selectionStart;
	// Update the "selectionInput" element to show the selected text.
	document.getElementById("selection-input").value = window.getSelection().toString();
	console.log("\t\tselection-input.value=" + document.getElementById("selection-input").value);
}
	
// Called when the user clicks on the Accept button on the form.  Checks
// to make sure there are no errors with any of the fields, and if not,
// passes the data back to the urlnp object in background.html.
function submitForm() {
	console.log("\tfunction submitForm");
	var errorMessage = [],
		errorCount = 0,
		selection = document.getElementById("selection-input").value,
		interval = document.getElementById("interval-input").value,
		i,
		length;
	// ERROR If the selected text from the URL are not digits (0-9).
// 	for (i = 0, length = selection.length; i < length; i++) {
// 		if (selection.charCodeAt(i) < 48 || selection.charCodeAt(i) > 57) {
// 			errorMessage[errorCount++] = chrome.i18n.getMessage("popupSelectionNaNError");
// 			break;
// 		}
// 	}
	// ERROR If the selection is blank.
	if (selection === "") {
		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_blank_error");
	}
	// ERROR If the selection is not a part of the URL.
	if (currentTab.url.indexOf(selection) === -1) {
		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_notinurl_error");
	}
	// ERROR If the interval is negative (-) or not a number.
	for (i = 0, length = interval.length; i < length; i++) {
		if (interval.charCodeAt(i) < 48 || interval.charCodeAt(i) > 57) {
			errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_negative_error");
			break;
		}
	}
	// ERROR If the interval is blank.
	if (interval === "") {
		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_blank_error");
	}
	// ERROR If the interval is 0.
	if (interval === "0") {
		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_0_error");
	}
	// If there was an error, show the error message
	if (errorCount !== 0) {
		console.log("\t\terrorMessage:" + errorMessage);
		URLNP.UIHelper.generateAlert_(errorMessage, false);
	}
	// Else there was not an error (successful)...
	else {
		console.log("\t\tsuccess -- now enabling urlnp");
		// Stores the form's information into urlnp, update the images
		// (enabled) and hide the form by toggling it.
		urlnp.enabled = true;
		urlnp.tab = currentTab;
		chrome.runtime.getBackgroundPage(function(backgroundPage) {
		  backgroundPage.URLNP.Background.setURLNP(urlnp);  
			updateImages();
			toggleForm();
      chrome.storage.sync.get(null, function (o) {
				if (o.keyEnabled) {
    			console.log("\t\tadding keyListener");
    			chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "setKeys", keyCodeIncrement: localStorage.keyCodeIncrement, keyEventIncrement: localStorage.keyEventIncrement, keyCodeDecrement: localStorage.keyCodeDecrement, keyEventDecrement: localStorage.keyEventDecrement, keyCodeClear: localStorage.keyCodeClear, keyEventClear: localStorage.keyEventClear}, function(response) {});
    			chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "addKeyListener"}, function (response) {});
    		}
    		// if (o.mouseEnabled) {
    		// 	console.log("\t\tadding mouseListener");
    		// 	chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "setMouse", mouseIncrement: localStorage.mouseIncrement, mouseDecrement: localStorage.mouseDecrement, mouseClear: localStorage.mouseClear}, function(response) {});
    		// 	chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "addMouseListener"}, function (response) {});
    		// }
      });
		});
		//chrome.runtime.sendMessage({greeting: "onPopupFormAccept", enabled: urlnp.enabled, tab: currentTab, selection: selection, selectionStart: selectionStart, interval: interval}, function (response) {});
	}
}
	
// User clicked on Increment image; need to find out if urlnp is enabled
// and if the current tab is urlnp's tab before sending a request to
// increment via modifyUrliAndUpdateTab.

function clickNext() {
	console.log("\tfunction clickNext");
	if (urlnp.enabled && urlnp.tab.id === currentTab.id) {
		console.log("\t\tgoing next");
		chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Next"}, function (response) {});
	}
}

// User clicked on Decrement image; need to find out if urlnp is enabled
// and if the current tab is urlnp's tab before sending a request to
// decrement via modifyU?rliAndUpdateTab.

function clickPrev() {
	console.log("\tfunction clickPrev");
	if (urlnp.enabled && urlnp.tab.id === currentTab.id) {
		console.log("\t\tgoing prev");
		chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "Prev"}, function (response) {});
	}
}

/**
 * Clears URLNP's state if it is currently enabled, thus disabling it. Then
 * calls updateImages() to set the images to a disabled/off state.
 * 
 * @private
 */ 
function clickClear() {
	console.log("\tfunction clickClear");
	if (urlnp.enabled) {
		console.log("\t\tclearing urlnp");
		chrome.runtime.getBackgroundPage(function(backgroundPage) {
		  backgroundPage.URLNP.Background.clearURLNP();
			urlnp = backgroundPage.URLNP.Background.getURLNP();
			//urlnp.enabled = false;
		  updateImages();
		});
	}
}
	
/**
 * Toggles the popup form. When the user clicks the setup input, the form
 * will expand and be visible. When the user clicks the Cancel input, the
 * form will be hidden and the popup controls view will return.
 * 
 * @private
 */ 
function toggleForm() {
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
				//chrome.runtime.sendMessage({greeting: "findSelection", url: currentTab.url}, initForm);
				// initForm();
	//console.log("\tfunction initForm");
	// Fill out the form elements' contents and load the default values
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
	  selectionProperties = backgroundPage.URLNP.Background.findSelection(currentTab.url);
	  // selectionStart = selectionProperties.selectionStart;
		document.getElementById("url-textarea").value = currentTab.url;
		document.getElementById("url-textarea").setSelectionRange(selectionProperties.selectionStart, selectionProperties.selectionStart + selectionProperties.selection.length);
		document.getElementById("selection-input").value = selectionProperties.selection;
	});
  if (!document.getElementById("interval-input").value) {
    chrome.storage.sync.get(null, function (o) {
      document.getElementById("interval-input").value = o.defaultInterval;
    });
  }
			}
		);
	}
}

document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);