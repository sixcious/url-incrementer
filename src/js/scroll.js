/**
 * URL Incrementer Scroll
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Scroll = function () {

  const el = document.createElement("div");
  const shadowRoot = el.attachShadow({ mode: "open"});
  //document.body.appendChild(shadowRoot);

  /**
   * TODO
   *
   * We use the fetch equivalence of an xhr response document type
   * fetch equivalent code by Paul Irish
   * @see https://stackoverflow.com/questions/45512102/can-fetch-do-responsetype-document
   * @param instance
   */
  function scroll(instance) {
    console.log("URLI.Scroll() - instance.url=" + instance.url);
    // const el = document.createElement("div");
    // const shadowRoot = el.attachShadow({ mode: "open"});
    fetch(instance.url, { method: "GET", credentials: "same-origin" })
      .then(response => response.blob()).then(blob => {
      console.log("got a blob!");
      const objectURL = URL.createObjectURL(blob);
      const img = document.createElement("img");
      img.src = objectURL;


      shadowRoot.appendChild(img);
      document.body.appendChild(shadowRoot);
    });
      /*
      .then(response => response.text())
      .then(text => new DOMParser().parseFromString(text, "text/html"))
      .then(document2 => {

        //const slot = document.createElement("slot");
        //slot.name = "page2";
        //slot.appendChild(document2.head);
        //const spacer = document.createElement("div");
        //spacer.style.marginTop = "2em";
        //slot.appendChild(spacer);
        //slot.appendChild(document2.body);
        //shadowRoot.appendChild(slot);
        //shadowRoot.appendChild(document2.body);
        const div = document.createElement("div");
        for (let element of document2.body.children) {
          div.appendChild(element);
        }
        shadowRoot.appendChild(div);
        document.body.appendChild(shadowRoot);
             });
             */
  }

  // Return Public Functions
  return {
    scroll: scroll
  };
}();