# Firefox Conversion Notes

#### manifest.json
Need to add applications/gecko with an ID due to chrome.storage.sync, remove optional permissions declarativeContent, change options_ui chrome_style to browser_style, etc.

#### permissions.js
must remove second chrome.permissions.request() - this was only added to fix a bug in Chrome that didn't grant a previously enabled origin when a new permission is being requested with that same origin
declarativeContent not supported. must remove all references to declarativeContent
must use something like chrome.tabs.onupdated listener and chrome.tabs.executeScript instead for internal shortcuts or default to using content_script permission
can't request permissions using chrome.runtime.getBackgroundPage()'s permissions.js, must include the permissions.js in options.html instead and use that

#### popup.css, options.css
for textarea css, add overflow-x: hidden; /* FF */
because mozilla adds extra height to textaeras (for scrollbars)
also add font: inherit because Chrome's default option styling has this set by default

#### popup.js
must change selection-input value to not use window.getSelection().toString() because FF does not support it.
must use like this:
    DOM["#selection-input"].value = DOM["#url-textarea"].value.substring(DOM["#url-textarea"].selectionStart, DOM["#url-textarea"].selectionEnd); // winndow.getSelection().toString(); does not work in FF

#### background.js
For content scripts (internal shortcuts), in the messageListener when we get the sender.tab object, note that sender.tab.url is undefined.
This is due to Firefox not granting permissions due to not having tabs permissions (even though we have <all_urls>!)
The two workarounds are to either get tabs permissions or use the sender.url instead of the sender.tab.url
@see https://github.com/facebook/react-devtools/issues/679
@see https://bugzilla.mozilla.org/show_bug.cgi?id=1361765

#### increment-decrement.js
lookbehind regex not supported (yet) in Firefox as of Version 61. Chrome supports it starting in Version 62.

#### cryptography.js
If the text input to hash() is empty in Firefox, it hangs, so need to check and use a default plaintext

#### options.css
add body max-width: 420px since by default it goes really wide.

#### chromium css
must replace all references of -webkit- to no vendor prefix or -moz-

#### generate-alert.css
must add text-align center to ul li as FF doesn't seem to center in the options (but does in the popup) generate alerts
.overlay ul li {
  text-align: center;
}

#### chrome.tabs.executeScript() calls
Must use absolute paths (extension base) not relative paths for the file path to the .js file, e.g. /js/script.js, not js/script.js. Backwards compatible with Chrome

#### Unchecked lastError value: Error: Could not establish connection. Receiving end does not exist.
When using message passing such as chrome.runtime.sendMessage() to a View that may not exist such as the Popup, you must specify the callback function with a response and check if chrome.runtime.lastError exists
    chrome.runtime.sendMessage({greeting: "updatePopupInstance", instance: instance}, function(response) { if (chrome.runtime.lastError) {} });

#### Unchecked lastError value: Error: Missing host permission for the tab
When using chrome.tabs.executeScript for the internal shortcuts, can't execute script on browser restricted pages, so check for lastError.
e.g.
  chrome.tabs.executeScript(tabId, {file: "js/shortcuts.js", runAt: "document_start"}, function(result) {
    if (chrome.runtime.lastError) {
      console.log("URLI.Background.internalShortcutsTabUpdatedListener() - chrome.runtime.lastError=" + chrome.runtime.lastError)
    }
  });

#### Unchecked lastError value: TypeError: can't access dead object
Firefox considers an object dead when the HTML Document that owned that object goes into garbage collection.
There were many of these errors due to Firefox not liking the way we save instances. This is due to when the popup.html sends the
instance to background.html to set it in the instances map. The best way to solve this situation is to create a deep copy
of the object in background.html and save that instead.

We can create a deep copy of the object by serializing and de-serializing using `JSON.parse(JSON.stringify(obj))`. You
could also create a shallow copy of the object by using `Object.assign()` but if the object has "nested" objects (e.g.
arrays) those will still refer to the original dead object's versions, and those nested objects will be considered DeadObjects.
See https://stackoverflow.com/questions/45126458/store-object-from-popup-in-background-page-in-a-webextension

Use-Cases to consider:
1. When saving an object in background memory that is from popup
2. When using sendMessage to send or receive an object

Example:

    instances.set(tabId, JSON.parse(JSON.stringify(instance))); // Don't do instances.set(tabId, instance) or Firefox can't access deadobject (the instance)

#### CSS changes (Firefox Only):
    /* Firefox: Set max-width and margin */
    body {
      min-width: 420px;
      max-width: 420px;
      margin: 20px;
    }

    /* Firefox: Add overflow-x: hidden; because Moz adds extra height to textarea (for scrollbars) */
    textarea {
      overflow-x: hidden;
    }

    /* Firefox: Change input type number to hide spinner up/down arrows unless focused/hovered */
    input[type=number] { -moz-appearance: textfield; } input[type=number]:hover, input[type=number]:focus { -moz-appearance: initial; }

#### Unsafe assignment to innerHTML
Firefox issues a warning when doing unsafe innerHTML assignments using variables like this:

        DOM["#download-preview-table-div"].innerHTML = table;

*Warning: Due to both security and performance concerns, this may not be set using dynamic values which have not been adequately sanitized. This can lead to security issues or fairly serious performance degradation.*

To solve this problem, use DOM manipulation methods (e.g. `document.createElement()` and `document.appendChild()`) and consider using a `DocumentFragment` (if you need to append multiple *adjacent* sibling elements *without a parent*).

Note: You can also use two other "String to DOM" methods: `DOMParser.parseFromString()` and `Range.createContextualFragment`.
Firefox won't display a warning, but they are not as fast as the DOM manipulation methods and still vulnerable to XSS (DOMParser won't execute <script> tags but there are other ways).
Here's one-liner examples on how to use them:

        DOM["#download-preview-table-div"].replaceChild(new DOMParser().parseFromString(table, "text/html").body.firstChild, DOM["#download-preview-table-div"].firstChild);
        DOM["#download-preview-table-div"].replaceChild(document.createRange().createContextualFragment(table), DOM["#download-preview-table-div"].firstChild);

`DOMParser`, in particular, creates a full-blown HTML document (with head and body) and was 30% slower in testing for generating a table.
`Range` creates a `DocumentFragment` and was about 10% slower in speed to `innerHTML`.

In terms of speed and performance, this is how my jsperf testing stacked each approach:
1. DOM Manipulation Methods
2. `innerHTML`
3. `Range.createConextualFragment()`
4. `DOMParser.parseFromString()`

## FIREFOX ANDROID

#### Not Supported (Undefined):
- chrome.commands.*
- chrome.browserAction().setIcon()
- chrome.browserAction().setBadgeText()
- chrome.browserAction.setBadgeBackground()

#### Iffy:
- chrome.storage.sync seems to work, but it is not officially supported
