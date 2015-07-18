/**
 * URL Plus UI (User Interface)
 * 
 * @author Roy Six
 * @namespace
 */
var URLP = URLP || {};
URLP.UI = URLP.UI || function () {

  /**
   * Generates an alert to display messages.
   * 
   * This function is derived from the sample Google extension, Proxy Settings,
   * by Mike West.
   * 
   * @param messages the messages array to display, line by line
   * @public
   */
  function generateAlert(messages) {
    var div = document.createElement("div"),
        ul = document.createElement("ul"),
        li,
        i;
    div.classList.add("overlay");
    for (i = 0; i < messages.length; i++) {
      li = document.createElement("li");
      li.appendChild(document.createTextNode(messages[i]));
      ul.appendChild(li);
    }
    div.appendChild(ul);
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add("overlay-visible"); }, 10);
    setTimeout(function () { div.classList.remove("overlay-visible"); document.body.removeChild(div); }, 3000);
  }

  /**
   * Applies a Hover.css effect to DOM elements on click events.
   * 
   * Hover.css is created by Ian Lunn.
   * 
   * @param el     the DOM element to apply the effect to
   * @param effect the Hover.css effect (class name) to use
   * @public
   */
  function clickHoverCss(el, effect) {
    // Carefully toggle the Hover.css class using setTimeout() to force a delay
    el.classList.remove(effect);
    setTimeout(function () { el.classList.add(effect); }, 1);
  }

  // Return Public Functions
  return {
    generateAlert: generateAlert,
    clickHoverCss: clickHoverCss
  };
}();