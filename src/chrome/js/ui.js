/**
 * URL Incrementer
 * @file ui.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var UI = (() => {

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
    const div = document.createElement("div");
    const ul = document.createElement("ul");
    div.classList.add("overlay");
    for (const message of messages) {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(message));
      ul.appendChild(li);
    }
    div.appendChild(ul);
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add("overlay-visible"); }, 10);
    setTimeout(function () { div.classList.remove("overlay-visible"); document.body.removeChild(div); }, 4000);
  }

  /**
   * Applies a Hover.css effect to DOM elements on click events.
   *
   * @param el     the DOM element to apply the effect to
   * @param effect the Hover.css effect (class name) to use
   * @public
   */
  function clickHoverCss(el, effect) {
    // Carefully toggle the Hover.css class using setTimeout() to force a delay
    el.classList.remove(effect);
    setTimeout(function () { el.classList.add(effect); }, 50);
  }

  // Return Public Functions
  return {
    generateAlert: generateAlert,
    clickHoverCss: clickHoverCss
  };

})();