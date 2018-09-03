/**
 * Web Extensions Commands UI
 * @file web-extensions-commands-ui.js
 * @author Roy Six
 * @license TBD
 */

var WebExtensionsCommandsUI = function () {

  const browser = chrome;

  const DOM_ID = "web-extensions-commands-ui",
    RESET_INPUT_IMG_PATH = "../img/font-awesome/black/times.png",
    I18N = {
      "commandActivate":     "Activate the extension",     // browser.i18n.getMessage("web_extensions_commands_command_activate")
      "typeShortcut": "Type a shortcut", // browser.i18n.getMessage("web_extensions_commands_type_shortcut")
      "errorIncludeCtrlAlt": "Include either Ctrl or Alt", // browser.i18n.getMessage("web_extensions_commands_error_include_ctrl_alt")
      "errorUseCtrlAlt": "" //
    };

  const DOM = {}, // Map to cache DOM elements: key=id, value=element
    KEYBOARDEVENT_CODE_TO_COMMAND_KEYS = new Map(),
    FLAG_KEY_NONE  = 0x0, // 0000
    FLAG_KEY_ALT   = 0x1, // 0001
    FLAG_KEY_CTRL  = 0x2, // 0010
    FLAG_KEY_SHIFT = 0x4, // 0100
    KEY_MODIFIER_CODE_ARRAY = [ // An array of the KeyboardEvent.code modifiers
      "Alt", "AltLeft", "AltRight",
      "Control", "ControlLeft", "ControlRight",
      "Shift", "ShiftLeft", "ShiftRight",
      "Meta", "MetaLeft", "MetaRight"
    ];

  const medias = new Map([
    ["MediaTrackNext", "MediaNextTrack"],
    ["MediaTrackPrevious", "MediaPrevTrack"],
    ["MediaPlayPause", "MediaPlayPause"],
    ["MediaStop", "MediaStop"]
  ]);


  let // commands_, // commands cache
    key = [0,""], // Reusable key to stores the key's event modifiers [0] and code [1]
    timeouts = {}; // Reusable global timeouts for input changes to fire after the user stops typing
  let allowed = false;
  let error = "";

  /*
      <div>
      URLI is currently set to use Firefox Shortcuts. Click on the text boxes and press 1-2 Modifier Keys and 1 normal key. The API requires you to enter at least 1 modifier key.
      Some valid examples are: Ctrl+Up, Ctrl+Alt+Down, and Alt+Shift+PageUp
      <br>
      Modifier Keys: Ctrl, Shift, Alt
      <br>
      Normal Keys: A-Z, 0-9, F1-F12, Comma, Period, Home, End, PageUp, PageDown, Space, Insert, Delete, Up, Down, Left, Right
      <br>
      Examples: Ctrl+Up, Ctrl+Alt+Up, Shift+PageUp
      <a href="https://developer.mozilla.org/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values">More Help</a>
      https://developer.mozilla.org/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values
      https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values
    </div>
   */


  /**
   * Loads the DOM content needed to display the options page.
   *
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   *
   * @public
   */
  function DOMContentLoaded() {
    DOM["#" + DOM_ID] = document.getElementById(DOM_ID);
    buildKeyboardEventCodeToCommandKeysMap();
    browser.commands.getAll(function(commands) {
      console.log(commands);
      // commands_ = commands;
      generateHTML(commands);
      cacheDOM();
      addEventListeners(commands);
    });
  }

  function buildKeyboardEventCodeToCommandKeysMap() {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const sames = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Comma", "Period", "Home", "End", "PageUp", "PageDown", "Space", "Insert", "Delete"];
    // const modifiers = new Map([
    //   ["AltLeft", "Alt"],
    //   ["AltRight", "Alt"],
    //   ["ControlLeft", "Ctrl"],
    //   ["ControlRight", "Ctrl"],
    //   ["ShiftLeft", "Shift"],
    //   ["ShiftRight", "Shift"]
    // ]);
    const arrows = new Map([
      ["ArrowUp", "Up"],
      ["ArrowDown", "Down"],
      ["ArrowLeft", "Left"],
      ["ArrowRight", "Right"]
    ]);
    const medias = new Map([
      ["MediaTrackNext", "MediaNextTrack"],
      ["MediaTrackPrevious", "MediaPrevTrack"],
      ["MediaPlayPause", "MediaPlayPause"],
      ["MediaStop", "MediaStop"]
    ]);
    // Alt: AltLeft, AltRight
    // Ctrl: ControlLeft, ControlRight
    // Shift: ShiftLeft, ShiftRight
    // A-Z: Replace Key with "" e.g. KeyA
    // 0-9: Replace Digit with "" e.g. Digit1
    // Up,Down,Left,Right: Replace Arrow with "" e.g. ArrowUp
    // for (const modifier of modifiers) {
    //   KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set(modifier[0], modifier[1]);
    // }
    for (const arrow of arrows) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set(arrow[0], arrow[1]);
    }
    for (const media of medias) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set(media[0], media[1]);
    }
    for (const same of sames) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set(same, same);
    }
    for (let i = 0; i <= 9; i++) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set("Digit" + i, "" + i);
    }
    for (let i = 0, letter = "A"; i < 26; i++) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set("Key" + letter, letter);
      letter = (parseInt(letter, 36) + 1).toString(36).toUpperCase();
    }
  }

  function generateHTML(commands) {
    const table = document.createElement("div");
    table.className = "table";
    for (const command of commands) {
      const row = document.createElement("div");
      row.className = "row";
      table.appendChild(row);
      const column1 = document.createElement("div");
      column1.className = "column";
      row.appendChild(column1);
      const label = document.createElement("label");
      label.id = DOM_ID + "-label-" + command.name;
      label.className = DOM_ID + "-label";
      label.textContent = (command.name === "_execute_browser_action" || !command.description) ? I18N.commandActivate : command.description;
      column1.appendChild(label);
      const column2 = document.createElement("div");
      column2.className = "column";
      row.appendChild(column2);
      const input = document.createElement("input");
      input.id = DOM_ID + "-input-" + command.name;
      input.className = DOM_ID + "-input";
      input.type = "text";
      input.value = command.shortcut ? command.shortcut : "";
      input.placeholder = "";
      input.dataset.name = command.name;
      input.dataset.shortcut = command.shortcut;
      column2.appendChild(input);
      const underline = document.createElement("div");
      underline.id = DOM_ID + "-underline-" + command.name;
      underline.className = DOM_ID + "-underline";
      column2.appendChild(underline);
      const error = document.createElement("div");
      error.id = DOM_ID + "-error-" + command.name;
      error.className = DOM_ID + "-error";
      column2.appendChild(error);
      const reset = document.createElement("input");
      reset.id = DOM_ID + "-reset-" + command.name;
      reset.className = DOM_ID + "-reset";
      reset.type = "image";
      reset.src = RESET_INPUT_IMG_PATH;
      reset.alt = "reset";
      reset.width = "16";
      reset.height = "16";
      reset.dataset.name = command.name;
      column2.appendChild(reset);
    }
    DOM["#" + DOM_ID].appendChild(table);
  }

  function cacheDOM() {
    const elements = document.querySelectorAll("#" + DOM_ID + " [id]");
    for (let element of elements) {
      DOM["#" + element.id] = element;
    }
  }

  function addEventListeners(commands) {
    for (const command of commands) {
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("focus", focus);
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("blur", blur);
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("keydown", keydown); //function (event) { setKey(event); writeInput(this, key); });
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("keyup", keyup); //function () { chrome.storage.sync.set({"keyIncrement": key}, function() { setKeyEnabled(); }); });
      DOM["#" + DOM_ID + "-reset-" + command.name].addEventListener("click", reset); //function () { chrome.storage.sync.set({"keyIncrement": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-increment-input"], []); });
    }
  }

  function updateError(that) {
    if (error) {
      DOM["#" + DOM_ID + "-underline-" + that.dataset.name].classList.add("error");
      DOM["#" + DOM_ID + "-error-" + that.dataset.name].textContent = error;
    } else {
      DOM["#" + DOM_ID + "-underline-" + that.dataset.name].classList.remove("error");
      DOM["#" + DOM_ID + "-error-" + that.dataset.name].textContent = "";
    }
  }


  function focus() {
    this.value = "";
    this.placeholder = I18N.typeShortcut;
    error = "";
    key = [0, ""];
    updateError(this);
  }

  function blur() {
    this.value = this.dataset.shortcut;
    this.placeholder = "";
    error = "";
    key = [0, ""];
    updateError(this);
  }

  function keydown(event) {
    event.preventDefault();
    setKey(event);
    writeInput(this, key);
    updateError(this);
  }

  function keyup(event) {
    if (!allowed) {
      this.value = "";
      error = "";
      updateError(this);
      return;
    }
    console.log("keyup!" + key + ", " + this.dataset.name + ", " + this.value);
    if (browser.commands.update) {
      browser.commands.update({
        name: this.dataset.name,
        shortcut: this.value
      });
    }
    this.dataset.shortcut = this.value;
    this.blur();
  }

  function reset() {
    console.log("reset clicked! for " + this.dataset.name);
    browser.commands.reset(this.dataset.name);
    DOM["#" + DOM_ID + "-input-" + this.dataset.name].value = "";
  }





  /**
   * Sets the key that was pressed on a keydown event. This is needed afterwards
   * to write the key to the input value and save the key to storage on keyup.
   *
   * @param event the key event fired
   * @private
   */
  function setKey(event) {
     error = "";
     key = [0, ""];
    // Set key [0] as the event modifiers OR'd together and [1] as the event key code
    const modifier =
      (event.altKey   ? FLAG_KEY_ALT   : FLAG_KEY_NONE) | // 0001  1
      (event.ctrlKey  ? FLAG_KEY_CTRL  : FLAG_KEY_NONE) | // 0010  2
      (event.shiftKey ? FLAG_KEY_SHIFT : FLAG_KEY_NONE); // 0100   4

    // 0001
    // 0010
    // 0100


    // 0000, 0111
    // NOT ALLOWED,

    //allowed modifiiers: Alt, Ctrl, Alt+Shift, Ctrl+Shift
    const code = KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.get(event.code);

    // if (modifier === 3) {
    //   error = "Use either Ctrl or Alt";
    // }
    switch (modifier) {
      case 0: case 4: case 7:
        error = "Include either Ctrl or Alt";
        return;
        break;
      case 3:
        error = "Use either Ctrl or Alt";
        return;
        break;
      case 1: case 2: case 5: case 6:
        if (!code) {
          error = "Type a letter";
        }
        break;
    }

    allowed = !error;



    // if (![1,2,5,6].includes(modifier) || !code || KEY_MODIFIER_CODE_ARRAY.includes(event.code)) {
    //   //input.value = "Not allowed";
    //   error = "";
    //   allowed = false;
    //   return;
    // }
    // allowed = true;
    key = [
      // (event.altKey   ? FLAG_KEY_ALT   : FLAG_KEY_NONE) | // 0001
      // (event.ctrlKey  ? FLAG_KEY_CTRL  : FLAG_KEY_NONE) | // 0010
      // (event.shiftKey ? FLAG_KEY_SHIFT : FLAG_KEY_NONE) | // 0100
      //event.code
      modifier,
      code
    ];

    // // remove error
    // DOM["#-input-underline-" + this.dataset.name].classList.remove("error");
    // DOM["#-error-" + this.dataset.name].textContent = "";
  }

  /**
   * Writes the key(s) that were pressed to the text input.
   *
   * @param input the input to write to
   * @param key the key object to write
   * @private
   */
  function writeInput(input, key) {
    // Write the input value based on the key event modifier bits and key code
    // Note1: KeyboardEvent.code will output the text-representation of the key code, e.g.  the key "A" would output "KeyA"
    // Note2: If the key code is in the KEY_MODIFIER_CODE_ARRAY (e.g. Alt, Ctrl), it is not written a second time
    let text = "";
    if (!key || key.length === 0) { text = chrome.i18n.getMessage("key_notset_option"); }
    else {
      if ((key[0] & FLAG_KEY_ALT))        { text += "Alt+";   }
      if ((key[0] & FLAG_KEY_CTRL)  >> 1) { text += "Ctrl+";  }
      if ((key[0] & FLAG_KEY_SHIFT) >> 2) { text += "Shift+"; }
      if (key[1] && !KEY_MODIFIER_CODE_ARRAY.includes(key[1])) { text += key[1]; }
    }
    input.value = text;
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

// Firefox Android: browser.commands not supported
if (typeof chrome !== "undefined" && chrome.commands) {
  document.addEventListener("DOMContentLoaded", WebExtensionsCommandsUI.DOMContentLoaded);
}