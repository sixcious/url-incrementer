# Firefox Build Instructions

## 1. Replace Files
Replace all files in the extension subfolder, including manifest-json, css, img, and so on.

## 2. Replace options.css
Need to adjust the overlay since the Firefox Options Page doesn't use the Chrome Popup style

    #options .overlay {
      position: absolute;
      top: initial;
      bottom: 8.6em;
      left: 17em;
    }

## 3. Replace options.html
TODO
    <div>
      Firefox's Commands API is currently in infancy and requires you to t-y-p-e out the keys. Click on the text boxes and enter up to 2 Modifier Keys followed by 1 normal key. The API requires you to enter at least 1 modifier key.
      <br>
      Modifier Keys:Ctrl, Shift, Alt
      <br>
      Normal Keys: A-Z, 0-9, F1-F12, Comma, Period, Home, End, PageUp, PageDown, Space, Insert, Delete, Up, Down, Left, Right
      <br>
      Examples: Ctrl+Up, Ctrl+Alt+Up, Shift+PageUp
      <a href="https://developer.mozilla.org/Add-ons/WebExtensions/manifest.json/commands">More Help("Shortcut Values")?</a>
      <label>Keyboard shortcut</label>
      <input type="text" id="shortcut"/>
      <button id="update">Update keyboard shortcut</button>
      <button id="reset">Reset keyboard shortcut</button>
    </div>
    
    
## 4. Add web-extensions-commands.js
Integrate web-extensions-commands.js into the options.html

    <link type="text/css" rel="stylesheet" href="../lib/web-extensions-commands/web-extensions-commands.css"/>
    <div id="web-extensions-commands"></div>
    <script src="../lib/web-extensions-commands/web-extensions-commands.js"></script>

##  TODO
Replace extension ids with firefox ids