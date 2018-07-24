/**
 * URL Incrementer Scroll
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Scroll = function () {

  /**
   * TODO
   *
   * We use the fetch equivalence of an xhr response document type
   * fetch equivalent code by Paul Irish
   * @see https://stackoverflow.com/questions/45512102/can-fetch-do-responsetype-document
   * @param instance
   */
  function scroll(instance) {
    console.log("URLI.Scroll() - instance.url=" + instance.url + ", i=" + i);
    // const el = document.createElement("div");
    //const shadowRoot = el.attachShadow({ mode: "open"});
    fetch(instance.url, { method: "GET", credentials: "same-origin" })
      /*
      .then(response => response.blob()).then(blob => {
      console.log("got a blob!");
      const objectURL = URL.createObjectURL(blob);
      const img = document.createElement("img");
      img.src = objectURL;


      shadowRoot.appendChild(img);
      document.body.appendChild(shadowRoot);
    });*/

      .then(response => response.text())
      .then(text => new DOMParser().parseFromString(text, "text/html"))
      .then(document2 => {
        const slot = document.createElement("div");
        slot.id = "" + (++i);
        slot.appendChild(document2.head);
        slot.appendChild(document2.body);
        shadowRoot.appendChild(slot);
        document.body.appendChild(shadowRoot);

        // const slot = document.createElement("slot");
        // slot.name = "" + (++i);
        // slot.appendChild(document2.head);
        // //const spacer = document.createElement("div");
        // //spacer.style.marginTop = "2em";
        // //slot.appendChild(spacer);
        // slot.appendChild(document2.body);
        // //shadowRoot.appendChild(slot);
        // //shadowRoot.appendChild(document2.body);
        // const div = document.createElement("div");
        // for (let element of document2.body.children) {
        //   div.appendChild(element);
        // }
        // shadowRoot.appendChild(div);
        // document.body.appendChild(shadowRoot);
      });

  }

  // Return Public Functions
  return {
    // init: init,
    scroll: scroll
  };
}();

// https://stackoverflow.com/questions/23208134/avoid-dynamically-injecting-the-same-script-multiple-times-when-using-chrome-tab?rq=1
if (!window.contentScriptInjected) {
  contentScriptInjected = true;
  init();
}

function init() {
  console.log("" + contentScriptInjected);
  console.log("doing init!");
  i = 0;
  console.log("hello scrolling... i=" + i);
  const el = document.createElement("div");
  shadowRoot = el.attachShadow({ mode: "open"});
  //document.body.appendChild(shadowRoot);
  const slot = document.createElement("div");
  slot.id = "" + (++i);
  slot.appendChild(document.head);
  slot.appendChild(document.body);
  shadowRoot.appendChild(slot);
  document.head = document.createElement("head");
  document.body = document.createElement("body");
  //body.createElement("div");
  document.body.appendChild(shadowRoot);
  //shadowRoot.appendChild(document2.body);
}