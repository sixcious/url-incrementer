// TODO

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
   * This function uses code from the sample Google extension, Proxy Settings,
   * by Mike West.
   * 
   * @param msg the messages array to display, line by line
   * @public
   */ 
  function generateAlert(msg) {
    console.log("generateAlert(msg)");
    var div = document.createElement('div'),
        ul = document.createElement('ul'),
        li,
        i;
    div.classList.add('overlay');
    for (i = 0; i < msg.length; i++) {
      li = document.createElement('li');
      li.appendChild(document.createTextNode(msg[i]));
      ul.appendChild(li);
    }
    div.appendChild(ul);
    document.body.appendChild(div);
    setTimeout(function() { div.classList.add('visible'); }, 10);
    setTimeout(function() { div.classList.remove('visible'); document.body.removeChild(div); }, 3000);
  }

  // Return Public Functions
  return {
    generateAlert: generateAlert
  };
}();