// TODO

console.log("URLNP.Links");

/**
 * URL Next Plus Links.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */ 
var URLNP = URLNP || {};
URLNP.Links = URLNP.Links || function () {

  var next,
      prev;

  /**
   * TODO
   */ 
  function hmm() {
    console.log("hmm()");
    var links = document.getElementsByTagName("link"),
        anchors = document.links;
  }

/*

// Next:  next, forward
// Prev:  prev, back (previous taken care of by prev?)

Priorities:
1. Links
	attribute="next" (rel attribute)
	InnerHTML

2. Anchors
	attribute="next" (? attribute)
	InnerHTML

Not Working Sites:
google
Google.com Source Example Differences....
view-source:https://www.google.com/webhp?hl=en&tab=ww#q=loli&hl=en&safe=off&prmd=imvnsl&ei=PnSUT8q6HKia6QG7p9iCBA&start=50&sa=N&bav=on.2,or.r_gc.r_pw.r_qf.,cf.osb&fp=f418c571f2743227
view-source:https://www.google.com/search?q=hello&hl=en&safe=off&prmd=imvnsa&ei=33KUT82tI4yM6QGCmpCzBA&start=40&sa=N

https://www.google.com/search?ix=sea&sourceid=chrome&ie=UTF-8&q=jobs+economy#hl=en&gs_nf=1&tok=2Trt-TV3ndzosGle2vLN2w&ds=n&pq=jobs%20economy&cp=25&gs_id=1g&xhr=t&q=jobs+economy+college&pf=p&safe=off&tbm=nws&sclient=psy-ab&oq=jobs+economy+college+grad&aq=f&aqi=&aql=&gs_l=&pbx=1&fp=1&ix=sea&biw=1024&bih=435&bav=on.2,or.r_gc.r_pw.r_qf.,cf.osb&cad=b
https://www.google.com/search?q=jobs+economy+college&hl=en&safe=off&biw=1024&bih=435&tbm=nws&ei=gI2bT8GcDue26QGohvWMDw&sqi=2&start=10&sa=N

Working Sites:
youtube
stackoverflow


*/
//next, // next, forward
//	    prev, // prev, back, previous
var	    foundNextPriority = 10,
	    foundPrevPriority = 10,

  		getScannedNextAndPrev = function () {
  			console.log("\tgetScannedNextAndPrev()");
  			var	links = document.getElementsByTagName("link"),
  			    linksLength = links.length,
  			    anchors = document.links, // all anchor and AREA elements, e.g. documents.getElementsByTagName("a"),
  			    anchorsLength = anchors.length;
  			console.log("\t\ttotal scanned links:" + linksLength);
  			console.log("\t\ttotal scanned anchors:" + anchorsLength);
  			for (i = 0; i < anchorsLength; i++) {
  			  console.log(anchors[i].href);
  			}
  			console.time("scan");
  			scan(links, linksLength);
  			scan(anchors, anchorsLength);
  			console.timeEnd("scan");
  			console.log("\t\tscanned next link:" + next);
  			console.log("\t\tscanned prev link:" + prev);
  			return {next: next, prev: prev};
  		},

		scan = function(elements, elementsLength) {
			console.log("\t\tfunction scan");
			var	i, j, attributes, attributesLength;

			for (i = 0; i < elementsLength; i++) {
				// 1. Check Attributes.
				attributes = elements[i].attributes;
				attributesLength = attributes.length;
				for (j = 0; j < attributesLength; j++) {
					// Attributes Next.
					if (foundNextPriority > 2 && attributes[j].nodeValue.toLowerCase() === "next") {
						// Priority Level 1 rel=next.
						if (attributes[j].nodeName === "rel") {
							console.log("\t\t\tfound next in attribute:" + attributes[j].nodeName);
							next = elements[i].href;
							foundNextPriority = 1;
						}
						// Priority Level 2 any other attribute=next.
						else if (foundNextPriority > 1) {
							console.log("\t\t\tfound next in attribute:" + attributes[j].nodeName);
							next = elements[i].href;
							foundNextPriority = 2;
						}
					}
					// Attributes Forward.
					else if (foundNextPriority > 2 && attributes[j].nodeValue.toLowerCase() === "forward") {
						// Priority Level 1 rel=next.
						if (attributes[j].nodeName === "rel") {
							console.log("\t\t\tfound next in attribute:" + attributes[j].nodeName);
							next = elements[i].href;
							foundNextPriority = 1;
						}
						// Priority Level 2 any other attribute=next.
						else if (foundNextPriority > 1) {
							console.log("\t\t\tfound next in attribute:" + attributes[j].nodeName);
							next = elements[i].href;
							foundNextPriority = 2;
						}
					}
					// Attributes Prev.
					if (foundPrevPriority > 2 && attributes[j].nodeValue.toLowerCase() === "prev") {
						// Priority Level 1 rel=prev.
						if (attributes[j].nodeName === "rel") {
							console.log("\t\t\tfound prev in attribute:" + attributes[j].nodeName);
							prev = elements[i].href;
							foundPrevPriority = 1;
						}
						// Priority Level 2 any other attribute=prev.
						else if (foundPrevPriority > 1) {
							console.log("\t\t\tfound prev in attribute:" + attributes[j].nodeName);
							prev = elements[i].href;
							foundPrevPriority = 2;
						}
					}
					// Attributes Back.
					else if (foundPrevPriority > 2 && attributes[j].nodeValue.toLowerCase() === "back") {
						// Priority Level 1 rel=back.
						if (attributes[j].nodeName === "rel") {
							console.log("\t\t\tfound prev in attribute:" + attributes[j].nodeName);
							prev = elements[i].href;
							foundPrevPriority = 1;
						}
						// Priority Level 2 any other attribute=back.
						else if (foundPrevPriority > 1) {
							console.log("\t\t\tfound prev in attribute:" + attributes[j].nodeName);
							prev = elements[i].href;
							foundPrevPriority = 2;
						}
					}

				}
				// 2. Check InnerHTML (only necessary for anchors?).
				if (foundNextPriority > 2 && elements[i].innerHTML.toLowerCase().indexOf("next") !== -1) {
					console.log("\t\t\tfound next in innerHTML:" + elements[i].innerHTML);
					next = elements[i];
					foundNextPriority = 3;
				} else if (foundNextPriority > 2 && elements[i].innerHTML.toLowerCase().indexOf("forward") !== -1) {
					console.log("\t\t\tfound next in innerHTML:" + elements[i].innerHTML);
					next = elements[i];
					foundNextPriority = 3;
				}
				if (foundPrevPriority > 2 && elements[i].innerHTML.toLowerCase().indexOf("prev") !== -1) {
					console.log("\t\t\tfound prev in innerHTML:" + elements[i].innerHTML);
					prev = elements[i];
					foundPrevPriority = 3;
				} else if (foundPrevPriority > 2 && elements[i].innerHTML.toLowerCase().indexOf("back") !== -1) {
					console.log("\t\t\tfound prev in innerHTML:" + elements[i].innerHTML);
					prev = elements[i];
					foundPrevPriority = 3;
				}
			}
		},
		
		filterResultInserts = function(event) {
      console.log(event.relatedNode);
    };

	return {
		getScannedNextAndPrev: getScannedNextAndPrev,
		filterResultInserts: filterResultInserts
	};
}();

// TODO Uncomment this line :
// document.addEventListener('DOMNodeInserted', URLNP.Links.filterResultInserts);

// chrome.runtime.sendMessage({greeting: "checkIfScanIsEnabled"}, function () {});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		switch (request.greeting) {
			// From:      background
			// Request:   Keys are enabled in options and user clicked accept button in popup form or enabled keys in options.
			// Action:    Add a keyListener.
			// Callback:  None.
			case "getScannedNextAndPrev":
				console.log("\t!request:getScannedNextAndPrev");
				var links = URLNP.Links.getScannedNextAndPrev();
				console.log("\t\tlinks.next:" + links.next + " links.prev:" + links.prev);
				sendResponse({});
				break;
			default:
				sendResponse({});
				break;
		}
	}
);