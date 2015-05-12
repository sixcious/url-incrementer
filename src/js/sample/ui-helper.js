// TODO

console.log("ui-helper.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * TODO
 */ 
URLNP.UIHelper = URLNP.UIHelper || function () {
  
  var fieldsetGroups = document.querySelectorAll('form > fieldset'); // Nodelist containing cached reference to the fieldset groups.

	// Generate alert overlay (popup message).
	// From the sample Google extension, Proxy Settings by Mike West.
	function generateAlert_(msg, close) {
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
	}
	
	// Click event handler on the form.
	// From the sample Google extension, Proxy Settings by Mike West.
	function dispatchFormClick_(e) {
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
	}
	
	// Sets the form's active config group.
	// From the sample Google extension, Proxy Settings by Mike West.
	function changeActive_(fieldset) {
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
	}

	// Recalculates the disabled state of the form's input elements, based
	// on the currently active group.
	// From the sample Google extension, Proxy Settings by Mike West.
	function recalcDisabledInputs_() {
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
	}

	// Public methods list.
	return {
		generateAlert_: generateAlert_,
		dispatchFormClick_: dispatchFormClick_
	};
		
}();