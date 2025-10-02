/**
 * URL Incrementer
 * @copyright © 2020 Six
 * @license https://github.com/sixcious/url-incrementer/blob/main/LICENSE
 */

var URLI = URLI || {};

URLI.UI = function () {

  /**
   * Generates an alert to display messages.
   * 
   * This function is derived from the sample Google extension, Proxy Settings,
   * by Mike West.
   * 
   * @param messages the messages array to display, line by line
   * @param callback (optional) the callback function to return execution to
   * @public
   */
  function generateAlert(messages, callback) {
    let div = document.createElement("div"),
        ul = document.createElement("ul"),
        li;
    div.classList.add("overlay");
    for (let message of messages) {
      li = document.createElement("li");
      li.appendChild(document.createTextNode(message));
      ul.appendChild(li);
    }
    div.appendChild(ul);
    document.body.appendChild(div);
    setTimeout(function () { div.classList.add("overlay-visible"); }, 10);
    setTimeout(function () { div.classList.remove("overlay-visible"); document.body.removeChild(div); if (callback) { callback(); } }, 4000);
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
}();