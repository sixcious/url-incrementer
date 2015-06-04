// TODO

console.log("URLNP.Background");

/**
 * URL Next Plus Background.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */ 
var URLNP = URLNP || {};
URLNP.Background = URLNP.Background || function () {

	var	instances = [];

  /**
   * Initializes the storage with the default values. The storage is initialized
   * when the extension is first installed.
   * 
   * @public
   */ 
	function initStorage() {
		console.log("initStorage()");
		chrome.storage.sync.clear();
		chrome.storage.sync.set({
		  "keyEnabled": true,
		  "keyQuickEnabled": false,
		  "keyNext": [0, 39],
		  "keyPrev": [0, 37],
		  "keyClear": [0, 13],
		  "keyQuickNext": [7, 39],
		  "keyQuickPrev": [7, 37],
		  "defaultMode": "use-links",
		  "defaultInterval": 1
    });
	}
	
	/**
	 * TODO
	 * 
	 * @param tab the tab to lookup this instance
	 * @param o   the storage object (optional)
	 * @return instance the instance
	 * @public
	 */
	function getInstance(tab, o) {
		console.log("getInstance(tab)");
		var instance = instances[tab.id],
		    selection;
		if (!instance) {
		  selection = findSelection(tab ? tab.url : "");
      instance = {
  	    enabled: false,
  	    tab: tab,
  	    selection: selection.string,
  	    selectionStart: selection.start,
  	    mode: o ? o.defaultMode : "",
  	    interval: o ? o.defaultInterval : 0
  	  };
		}
		return instance;
	}

	/**
	 * TODO
	 * 
	 * @param instance
	 * @public
	 */	
	function setInstance(instance) {
		console.log("setInstance(instance)");
		instances[instance.tab.id] = instance;
		if (!instance || !instance.enabled) {
  		console.log("\tinstance is not enabled so removing key listener");
  		chrome.tabs.sendMessage(instance.tab.id, {greeting: "removeKeyListener"}, function (response) {});
      chrome.tabs.onUpdated.removeListener(updateListeners);
      instances[instance.tab.id] = undefined;
		}
	}

	/**
	 * Modifies the URL by the user's selection by either incrementing or
	 * decrementing the selection. The URL is then updated in the tab object.
	 * 
	 * @param instance  the instance containing properties like URL and selection
	 * @param direction the direction to go (next/increment or prev/decrement)
	 * @return JSON object {modified url, selection string that was modified}
	 * @private
	 */
	function modifyURL(instance, direction) {
		console.log("modifyURL(instance, direction)");
		console.log("url=" + url + "\nselectionString=" + selectionString + "\nselectionStart=" + selectionStart + "\ninterval=" + interval + "\naction=" + action);
		var	firstPartURL = url.substring(0, selectionStart),
			secondPartURL = url.substring(selectionStart + selectionString.length),
			selectionInteger = parseInt(selectionString, 10), // Base 10 needed due to bug with parseInt for leading zeros
			selectionStringLength = selectionString.length,
			newSelectionStringLength,
			countZeros = 0,
			differenceInAmountOfDigits,
			paddedZeros = "",
			length,
			i,
			leadingzeros = false,
			alphanumeric = false;
			
		// The user somehow was able to submit the form without properly
		// selecting the selection from the URL textArea.
		if (selectionStart < 0) {
			return; // URL won't change.
		}
		// Is the selection alphanumeric?
		for (i = 0; i < selectionStringLength; i++) {
			if (selectionString.charCodeAt(i) < 48 || selectionString.charCodeAt(i) > 57) {
			  alphanumeric = true;
				break;
			}
		}
		// Does the selection have leading 0s?
		if (selectionString.charAt(0) === '0') {
		  leadingzeros = true;
		}
		
		// Alphanumeric Modification
		if (alphanumeric) {
		  var lastChar = 0;
	    for (i = selectionStringLength - 1; i >= 0; i--) {
	      var temp = selectionString.charCodeAt(i);
	      switch (temp) {
	        case 90:
	          continue;
          case 122:
            continue;
          default:
            if (temp >= 65 && temp <= 90) {
             // selectionString.charC
            }
            
          break;
	      }
	      // A - Z is 65 - 90
		    // a - z is 97 - 122
		     // if () {
		        
		     // }
		     
		  }
		  selectionString = action === "next" ? (selectionInteger + interval).toString() : 
		                    action === "prev" ? (selectionInteger - interval).toString() :
		                    "";
		// 	if (action === "next") {
		// 		selectionString = (selectionInteger + interval).toString();
		// 	} else if (action === "prev") {
		// 		selectionString = (selectionInteger - interval >= 0 ? selectionInteger - interval : 0).toString();
		// 	}
		}
		// Leading 0s
		else if (leadingzeros) {
			// Count how many leading zeros there are.
			for (i = 0; i < selectionStringLength; i++) {
				// If we encounter the first non-zero digit, stop counting
				// leading zeros.
				if (selectionString.charAt(i) === '0') {
					 countZeros++;
				} else {
					break;
				}
			}
			if (action === "next") {
				// selectionInteger already strips the zeros, we only care about the value here.
				selectionString = (selectionInteger + interval).toString();
			}
			else if (action === "prev") {
				// selectionInteger already strips the zeros, we only care about the value here.
				selectionString = (selectionInteger - interval >= 0 ? selectionInteger - interval : 0).toString();
			}
			// Just gets the length (without the zeros) before doing the increment/decrement.
			// VERSION 2 FIX:  Added "selectionInteger === 0 ? 0" in case of 0, we should just
			// make the length always zero (even though a digit of 0 is really a length of 1)
			// because in cases of "000" it would go to "0000" in decrement or "0001" in increment.
			selectionStringLength = selectionInteger === 0 ? 0 : (selectionInteger.toString()).length;
			// Now count how many digits there are after the increment.
			newSelectionStringLength = selectionString.length;
			// The difference in amount of digits is found by simply
			// subtracting the lengths of the new and original
			// selectionStrings.  E.g., original = "9" and new = "10"
			// would mean a difference of one digit.  Note there is no
			// no need to cast the absolute value in case of decrement.
			differenceInAmountOfDigits = newSelectionStringLength - selectionStringLength;
			// To find out how many zeros to pad, just count how many
			// zeros there were to begin with.  Then subtract the
			// difference in amount of digits between the original and
			// new (as calculated above).  This is because if the new
			// takes up one or more digits compared to the original,
			// then we should remove one or more zeros accordingly.
			// E.g. original = "009" and new = "010" means we need to
			// remove one of the leading zeros and only pad one zero
			// instead of two.

			length = countZeros - differenceInAmountOfDigits;
			for (i = 0; i < length; i++) {
				paddedZeros += "0";
			}

			// Pad with zeros.

			selectionString = paddedZeros + selectionString;
		}

		// Either there are no leading zeros or the user wants them removed.
		// Therefore, just use selectionInteger instead of the string.
		// A check on the subtraction of pageValue needs to be done to ensure
		// that the user cannot decrement below 0 (design decision).

		else {
		// 	if (action === "next") {
		// 		selectionString = (selectionInteger + interval).toString();
		// 	} else if (action === "prev") {
		// 		selectionString = (selectionInteger - interval >= 0 ? selectionInteger - interval : 0).toString();
		// 	}
    selectionString = action === "next" ? (selectionInteger + interval).toString() : 
                      action === "prev" ? (selectionInteger - interval).toString() :
                      "";
		}

		// Update the tab object with the updated url and save it in urlnp.
		// Also save the "new" selectionString (which was just incremented
		// or decremented in this function).

		console.log("\t\treturn url:" + firstPartURL + selectionString + secondPartURL);
		console.log("\t\treturn selectionString:" + selectionString);
		return {url: firstPartURL + selectionString + secondPartURL, selectionString: selectionString};
	}

  /**
   * Finds a selection in the url to modify.First looks for common prefixes
   * that come before numbers, such as = (equals) and / (slash). Example URLs:
   * 
   * http://www.google.com?page=1234
   * http://www.google.com/1234
   * 
   * If no prefixes with numbers exist, finds the last number in the url.
   * 
   * @param url the url to find the selection in
   * @return JSON object {string (selection string), start (selection start)}
   * @public
   */ 
	function findSelection(url) {
		console.log("findSelection(url)");
		var re1 = /(?:=|\/)(\d+)/, // RegExp to find prefixes = and / with numbers
		    re2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
		    matches;
		return (matches = re1.exec(url)) !== null ? {string:matches[1], start:matches.index + 1} :
           (matches = re2.exec(url)) !== null ? {string:matches[0], start:matches.index} :
           {string:"", start:-1};
	}

  /**
   * TODO
   * 
   * @param request
   * @public
   */ 
	function updateTab(request) {
		console.log("updateTab(request)");
		// var	urlAndSelection = modifyURL(urlnp.getTab().url, urlnp.getSelection(), urlnp.getSelectionStart(), parseInt(urlnp.getInterval(), 10), request.action),
		// 	tab = urlnp.getTab();
		var urlAndSelection = modifyURL(instances[request.id], request.direction);
		tab.url = urlAndSelection.url;
		urlnp.setTab(tab);					// Update urlnp's tab.
		urlnp.setSelection(urlAndSelection.selectionString);	// Update urlnp's selection.
		// updateTab(); removed old updatetab function and renamed this method to update tab because the old function was only being used here
		// Begin updatetab function code
			// After the url is modified in modifyurl, go ahead and update
	// the tab to the new url using the chrome API's chrome.tabs.update.
				console.log("\tfunction updateTab");
		chrome.tabs.get(instance.tab.id, function(tab) {
			if (tab.id === urlnp.getTab().id) {
				console.log("\t\tupdating tab id:" + urlnp.getTab().id);
				chrome.tabs.update(tab.id, {url:urlnp.getTab().url});
			}
		});
		// end old updatetab function code
    chrome.storage.sync.get(null, function (o) {
		  if (o.keyEnabled) {
	      chrome.tabs.onUpdated.addListener(updateListeners);
		  }
    });
		// if (localStorage.keyEnabled) {
		// 	chrome.tabs.onUpdated.addListener(updateListeners);
		// }
	}

  /**
   * TODO
   * 
   * @param request
   * @public
   */ 
	function quickUpdateTab(request) {
		console.log("\tfunction fastUpdateTab");
		chrome.tabs.get(instance.tab.id, // TODO get the instance in quick funcitonality setup
			function (tab) {
				var	selection = findSelection(tab.url),
					urlAndSelection = modifyURL(tab.url, selection.string, selection.start, parseInt(localStorage.defaultInterval), request.action);
				if (urlAndSelection !== undefined){
 					chrome.tabs.update(tab.id, {url:urlAndSelection.url});
				}
			}
		);
	}
	
		// Necessary for the keys/mouse.  When the tab changes the URL due to
	// increment or decrement, we must send another request to add
	// a keyListener to the new URL page.  This function is called by the
	// tab listener chrome.tabs.onUpdated.addListener(updateListeners),
	// in modifyUrliAndUpdateTab.
  /**
   * TODO
   * 
   * @param tabId
   * @param changeInfo
   * @param tab
   * @private
   */ 
	function updateListeners(tabId, changeInfo, tab) {
		console.log("\tfunction updateListeners");
		if (!urlnp.getEnabled()) { // Forces the listener to be removed on this tab.
			console.log("\t\treturn: nothing because removing listener");
			chrome.tabs.onUpdated.removeListener(arguments.callee);
			return;
		}
		if (tabId !== urlnp.getTab().id) {
			console.log("\t\treturn: nothing because tabId !== urlnp.getTab().id");
			return;
		}
		chrome.storage.sync.get(null, function (o) {
			if (o.keyEnabled) {
				console.log("\t\tadding keyListener");
				chrome.tabs.sendMessage(tabId, {greeting: "setKeys", keyNext: o.keyNext, keyPrev: o.keyPrev, keyClear: o.keyClear}, function(response) {});
				chrome.tabs.sendMessage(tabId, {greeting: "addKeyListener"}, function (response){});
			}
		});
	}

  // Return Public Functions
	return {
		initStorage: initStorage,
		getInstance: getInstance,
		setInstance: setInstance,
		updateTab: updateTab,
		quickUpdateTab: quickUpdateTab,
		findSelection: findSelection
	};
}();

// If first run, initialize localStorage and go to options.html.
// TODO: Remove the details.reason === "update" after this release
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install" || details.reason === "update") {
    console.log("URL Next Plus installed or updated");
    URLNP.Background.initStorage();
    chrome.runtime.openOptionsPage();
  }
});

// Listen for requests from chrome.runtime.sendMessage
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log("!request.greeting=" + (request && request.greeting ? request.greeting : "Unknown Request"));
    switch (request.greeting) {
			case "updateTab": // From popup or content_script (shortcuts.js)
				URLNP.Background.updateTab(request);
				break;
			case "quickUpdateTab": // From content_script (shortcuts.js)
				URLNP.Background.quickUpdateTab(request);
				break;
      default:
        break;
    }
    sendResponse({});
  }
);


// 	/**
// 	 * TODO
// 	 * 
// 	 * @public
// 	 */
// 	function clearInstance(instance) {
// 		console.log("clearInstance(instance)");
// 		console.log("\tremoving keyListener");
// 		chrome.tabs.sendMessage(instance.getTab().id, {greeting: "removeKeyListener"}, function (response) {});
// 		chrome.tabs.onUpdated.removeListener(updateListeners);
// 		//urlnp.clear();
// 		instances[instance.id] = instance;
// 	}

// 	onPopupFormAccept = function (request) {
// 		console.log("\tfunction onPopupFormAccept");
// 		urlnp.setEnabled(request.enabled);
// 		urlnp.setTab(request.tab);
// 		urlnp.setSelection(request.selection);
// 		urlnp.setSelectionStart(request.selectionStart);
// 		urlnp.setInterval(request.interval);

// 		if (localStorage.keyEnabled === "1") {
// 			console.log("\t\tadding keyListener");
// 			chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "setKeys", keyCodeIncrement: localStorage.keyCodeIncrement, keyEventIncrement: localStorage.keyEventIncrement, keyCodeDecrement: localStorage.keyCodeDecrement, keyEventDecrement: localStorage.keyEventDecrement, keyCodeClear: localStorage.keyCodeClear, keyEventClear: localStorage.keyEventClear}, function(response) {});
// 			chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "addKeyListener"}, function (response) {});
// 		}
// 		if (localStorage.mouseEnabled === "1") {
// 			console.log("\t\tadding mouseListener");
// 			chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "setMouse", mouseIncrement: localStorage.mouseIncrement, mouseDecrement: localStorage.mouseDecrement, mouseClear: localStorage.mouseClear}, function(response) {});
// 			chrome.tabs.sendMessage(urlnp.getTab().id, {greeting: "addMouseListener"}, function (response) {});
// 		}
// 	},


// 	checkIfFastIsEnabled = function () {
// 		console.log("\tfunction checkIfFastIsEnabled");
// 		chrome.tabs.getSelected(null,
// 			function (tab) {
// 				if (localStorage.keyEnabled === "1" && localStorage.keyFastEnabled === "1") {
// 					console.log("\t\tadding fastKeyListener");
// 					chrome.tabs.sendMessage(tab.id, {greeting: "setFastKeys", keyCodeFastIncrement: localStorage.keyCodeFastIncrement, keyEventFastIncrement: localStorage.keyEventFastIncrement, keyCodeFastDecrement: localStorage.keyCodeFastDecrement, keyEventFastDecrement: localStorage.keyEventFastDecrement}, function (response) {});
// 					chrome.tabs.sendMessage(tab.id, {greeting: "addFastKeyListener"}, function (response) {});
// 				}
// 			}
// 		);
// 	},
	
// 	checkIfScanIsEnabled = function (request) {
//   	console.log("\tfunction checkIfScanIsEnabled");
//   	chrome.tabs.query({active: true, lastFocusedWindow: true},
//   		function (tabs) {
//   			var tab = tabs[0];
//   				console.log("\t\trequesting scanner to scan for next and prev links.");
//   				chrome.tabs.sendMessage(tab.id, {greeting: "getScannedNextAndPrev"}, function (response) {});
//   		}
//   	);
//   },


// // Listen for requests from chrome.runtime.sendMessage
// chrome.runtime.onMessage.addListener(
// 	function (request, sender, sendResponse) {
// 		switch (request.greeting) {
		  
// 		// 	// From:      popup
// 		// 	// Request:   User clicks the Accept button on popup's form.
// 		// 	// Action:    Set the form data into urlnp and request content_script to add listeners (if applicable).
// 		// 	// Callback:  None.
// 		// 	case "onPopupFormAccept":
// 		// 		console.log("\t!request:onPopupFormAccept");
// 		// 		U.onPopupFormAccept(request);
// 		// 		sendResponse({});
// 		// 		break;
		
// 		// 	// From:      options
// 		// 	// Request:   User clicks the Save or Reset button on the options form.
// 		// 	// Action:    Remove the listeners and if keys/mouse are enabled, send a request to the content_script to enable them again (update).
// 		// 	// Callback:  None.
// 		// 	case "onOptionsFormSave":
// 		// 		console.log("\t!request:onOptionsFormSave");
// 		// 		U.onOptionsFormSave();
// 		// 		sendResponse({});
// 		// 		break;

// 		// 	// From:      options
// 		// 	// Request:   Reset button was hit on the options.
// 		// 	// Action:    Initialize localStorage fields to default values.
// 		// 	// Callback:  None.
// 		// 	case "onOptionsFormReset":
// 		// 		console.log("\t!request:onOptionsFormReset");
// 		// 		U.onOptionsFormReset();
// 		// 		sendResponse({});
// 		// 		break;

// 		// 	// From:      popup
// 		// 	// Request:   Increment/Decrement/Clear buttons are pressed and we need to know if urlnp is enabled.
// 		// 	// Action:    None (this is only a request to get urlnp).
// 		// 	// Callback:  Respond with all of urlnp's properties.
// 		// 	case "getUrli":
// 		// 		console.log("\t!request:getUrli");
// 		// 		//U.getUrli(sendResponse);
// 		// 		sendResponse({urlnp: U.urlnp});
// 		// 		// sendResponse({});
// 		// 		break;

// 		// 	// From:      popup and user
// 		// 	// Request:   Clear button is pressed or shortcut is activated and we need to clear urlnp's contents.
// 		// 	// Action:    Disable everything by calling clear() on urlnp and removing all listeners.
// 		// 	// Callback:  None.
// 		// 	case "clearUrli":
// 		// 		console.log("\t!request:clearUrli");
// 		// 		U.clearUrli();
// 		// 		sendResponse({});
// 		// 		break;

// 			// From:      popup
// 			// Request:   ?
// 			// Action:    ?
// 			// Callback:  ?
// 		// 	case "findSelection":
// 		// 		console.log("\t!request:findSelection");
// 		// 		// U.processSelection(request, sendResponse);
// 		// 		// sendResponse({});
// 		// 					/*
// 		// 	console.log("\tfunction processSelection");
// 		// var selectionProperties;
// 		// selectionProperties = findSelection(request.url);
// 		// sendResponse({selection: selectionProperties.selection, selectionStart: selectionProperties.selectionStart, defaultInterval: localStorage.defaultInterval});
// 		// */
// 		//     sendResponse(U.findSelection(request.url));
// 		// 		break;

// 			// From:      popup, content_script
// 			// Request:   Increment or decrement request from a button, shortcut key, or shortcut mouse button.
// 			// Action:    Modify the current tab's URL by incrementing it or decrementing it and update the tab with the new URL.
// 			// Callback:  None.
// 			case "updateTab":
// 				console.log("\t!request:modifyUrliAndUpdateTab");
// 				URLNP.Background.modifyUrliAndUpdateTab(request);
// 				sendResponse({});
// 				break;

// 		// 	// From:      content_script
// 		// 	// Request:   When the contet_script loads, it checks to see if fast functionality is enabled.
// 		// 	// Action:    If fast is enabled, request content_script to add listeners (if applicable).
// 		// 	// Callback:  None.
// 		// 	case "checkIfFastIsEnabled":
// 		// 		console.log("\t!request:checkIfFastIsEnabled");
// 		// 		U.checkIfFastIsEnabled();
// 		// 		sendResponse({});
// 		// 		break;
				
// 		// 	// From:      scanner
// 		// 	// Request:   When the contet_script loads, it checks to see if scan functionality is enabled.
// 		// 	// Action:    If scan is enabled, request scanners to scan the page for the next and prev links.
// 		// 	// Callback:  None.
// 		// 	case "checkIfScanIsEnabled":
// 		// 		console.log("\t!request:checkIfScanIsEnabled");
// 		// 		U.checkIfScanIsEnabled();
// 		// 		sendResponse({});
// 		// 		break;
				
// 			// From:      content_script (shortcuts.js)
// 			// Request:   Increment or decrement request from a fast shortcut key or fast shortcut mouse button.
// 			// Action:    Modify the current tab's URL by incrementing it or decrementing it and update the tab with the new URL.
// 			// Callback:  None.
// 			case "quickUpdateTab":
// 				console.log("\t!request:quickUpdateTab");
// 				URLNP.Background.quickUpdateTab(request);
// 				sendResponse({});
// 				break;
				
// 			// Unspecified request -- should not be needed!
// 			default:
// 				console.warn("!request:" + request.greeting +" is unspecified!");
// 				sendResponse({});
// 				break;
// 		}
// 	}
// );