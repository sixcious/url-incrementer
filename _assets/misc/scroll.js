// An unfinished idea to increment as the window scrolls
var doc = document,
  page = 1,
  WINDOW_OFFSET = 300;

/**
 * Does initial prep-work needed on DOMContentLoaded.
 *
 * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
 * "load", it does not wait for images and media.
 *
 * @public
 */
function DOMContentLoaded() {
  console.log("DOMContentLoaded");
        //window.onscroll = scroll;
  window.addEventListener("scroll", scroll);
}

/**
 * TODO
 *
 * @private
 */
function scroll() {
  console.log("scroll");
  if ((window.innerHeight + window.scrollY + WINDOW_OFFSET) >= document.body.scrollHeight) {
    console.log("Hit bottom of page");
    request(function() {
      work();
      append();
    });
  }
}

/**
 * TODO
 *
 * @private
 */
function request(callback) {
  console.log("request");
  try {
//      if (!nextLink || !nextLink.href) {
//        throw("Next link is undefined");
//      }
    //if (page )
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "url+1", true);
    xhr.responseType = "document";
    xhr.onload = function() { // Equivalent to onreadystate and checking 4
      if (this.status !== 200) {
        throw("Error Status " + this.status);
      }
      doc = this.response;
      if (callback) {
        callback();
      }
    };
    xhr.send();
  } catch (e) {
    console.log(e);
    //window.onscroll = undefined;
    window.removeEventListener("scroll", scroll);
    return;
  }
}

/**
 * TODO
 *
 * @private
 */
function work() {
  console.log("work");
  // Remove any JavaScript files:
  Array.prototype.slice.call(doc.getElementsByTagName("script")).forEach(
    function(script) { script.parentNode.removeChild(script);
    });
  //nextPageElement = evaluateXpath(data.pageElement);
  //nextLink = evaluateXpath(data.nextLink);
  //console.log("nextPageelement" + nextPageElement);
  //console.log("nexTLink" + nextLink);
}

/**
 * TODO
 *
 * @private
 */
function append() {
  console.log("append");

  var fragment = document.createDocumentFragment();
  Array.prototype.slice.call(doc.children).forEach(
    function(child) { fragment.appendChild(child);
    });
  //document.body.appendChild(fragment); // TODO: Slowly slideDown the appendment e.g. jquery.slideDown("slow");
  // $(fragment).appendTo($(pageElement)).fadeIn('slow');

  var iframe = document.createElement("iframe");
  iframe.src = "url+1";
}