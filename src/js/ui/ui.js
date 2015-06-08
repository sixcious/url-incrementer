// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.UI");

/**
 * URL Next Plus UI (User Interface).
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */
var URLNP = URLNP || {};
URLNP.UI = URLNP.UI || function () {

  /**
   * Generates a popup alert.
   * 
   * This function is derived from the sample Google extension, Proxy Settings,
   * by Mike West.
   * 
   * @param msg the messages array to display, line by line
   * @public
   */
  function generateAlert(msg) {
    console.log("generateAlert(msg)");
    var div = document.createElement("div"),
        ul = document.createElement("ul"),
        li,
        i;
    div.classList.add("overlay");
    for (i = 0; i < msg.length; i++) {
      li = document.createElement("li");
      li.appendChild(document.createTextNode(msg[i]));
      ul.appendChild(li);
    }
    div.appendChild(ul);
    document.body.appendChild(div);
    setTimeout(function() { div.classList.add("overlay-visible"); }, 10);
    setTimeout(function() { div.classList.remove("overlay-visible"); document.body.removeChild(div); }, 3000);
  }

  /**
   * Applies a Hover.css effect on click events to DOM elements.
   * 
   * Hover.css is created by Ian Lunn.
   * 
   * @param el     the DOM element to apply the effect to
   * @param effect the Hover.css effect (String name) to use
   * @public
   */
  function clickHoverCss(el, effect) {
    console.log("clickHoverCss(el, effect)");
    // Carefully toggle the Hover.css class using setTimeout() to force a delay
    el.classList.remove(effect);
    setTimeout(function() { el.classList.add(effect); }, 1);
  }

  // Return Public Functions
  return {
    generateAlert: generateAlert,
    clickHoverCss: clickHoverCss
  };
}();