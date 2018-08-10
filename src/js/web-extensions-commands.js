/**
 * WebExtensions Commands
 *
 * @author Roy Six
 * @namespace
 */

var WebExtensionsCommands = function () {

  const browser = chrome;

  const DOM = {}, // Map to cache DOM elements: key=id, value=element
    ACTIVATE_EXTENSION_DESCRIPTION = "Activate the extension",
    RESET_INPUT_IMG_PATH = "../img/font-awesome/black/times.png",
    KEYBOARDEVENT_CODE_TO_COMMAND_KEYS = new Map(),
    FLAG_KEY_NONE  = 0x0, // 0000
    FLAG_KEY_ALT   = 0x1, // 0001
    FLAG_KEY_CTRL  = 0x2, // 0010
    FLAG_KEY_SHIFT = 0x4, // 0100
    KEY_MODIFIER_CODE_ARRAY = [ // An array of the KeyboardEvent.code modifiers (used in the case of an assigned shortcut only being a key modifier, e.g. just the Shift key for Increment)
      "Alt", "AltLeft", "AltRight",
      "Control", "ControlLeft", "ControlRight",
      "Shift", "ShiftLeft", "ShiftRight",
      "Meta", "MetaLeft", "MetaRight"
    ];


  let commands_, // commands cache
    key = [0,""], // Reusable key to stores the key's event modifiers [0] and code [1]
    timeouts = {}; // Reusable global timeouts for input changes to fire after the user stops typing
  let keym;
  let allowed = false;

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
      <a href="https://developer.mozilla.org/Add-ons/WebExtensions/manifest.json/commands">More Help("Shortcut Values")</a>
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
    DOM["#web-extensions-commands"] = document.getElementById("web-extensions-commands");
    browser.commands.getAll(function(commands) {
      console.log(commands);
      commands_ = commands;
      buildHTML();
      cacheDOM();
      addEventListeners();
      allowedKeyboardCodes();
    });
  }

  function buildHTML() {
    let html = "<div class=\"table\">";
    for (const command of commands_) {
      html +=
        "<div class=\"row\">" +
        "<div class=\"column\">" +
        "<label id=\"web-extensions-commands-label-" + command.name + "\" for=\"web-extensions-commands-input-" + command.name + "\">" + ((command.name === "_execute_browser_action" || !command.description) ? ACTIVATE_EXTENSION_DESCRIPTION : command.description) + "</label>" +
        "</div>" +
        "<div class=\"column\">" +
        "<input type=\"text\" id=\"web-extensions-commands-input-" + command.name + "\" class=\"web-extensions-commands-input\" value=\"" + command.shortcut + "\" data-command=\"" + command.name + "\" readonly/>" +
        "<input type=\"image\" id=\"web-extensions-commands-reset-input-" + command.name + "\" class=\"web-extensions-commands-reset-input\" src=\"" + RESET_INPUT_IMG_PATH + "\" alt=\"web-extensions-commands-reset-input\" data-command=\"" + command.name + "\" width=\"16\" height=\"16\"/>" +
        "</div>" +
        "</div>";
    }
    html += "</div>";
    DOM["#web-extensions-commands"].innerHTML = html;
  }

  function cacheDOM() {
    const elements = document.querySelectorAll("[class='web-extensions-commands-input'],[class='web-extensions-commands-reset-input']");
    for (let element of elements) {
      DOM["#" + element.id] = element;
    }
  }

  function addEventListeners() {
    for (const command of commands_) {
      DOM["#web-extensions-commands-input-" + command.name].addEventListener("keydown", keydown); //function (event) { setKey(event); writeInput(this, key); });
      DOM["#web-extensions-commands-input-" + command.name].addEventListener("keyup", keyup); //function () { chrome.storage.sync.set({"keyIncrement": key}, function() { setKeyEnabled(); }); });
      DOM["#web-extensions-commands-reset-input-" + command.name].addEventListener("click", click); //function () { chrome.storage.sync.set({"keyIncrement": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-increment-input"], []); });
    }
  }

  function keydown(event) {
    setKey(event);
    writeInput(this, key);
  }

  function keyup(event) {
    if (!allowed) {
      return;
    }
    console.log("keyup!" + key + ", " + this.dataset.command + ", " + this.value);
    browser.commands.update({
      name: this.dataset.command,
      shortcut: this.value
    });
  }

  function click() {
    console.log("clicked!" + this.dataset.command);
    // browser.commands.update({
    //   name: this.dataset.command,
    //   shortcut: null
    // });
    // DOM["#web-extensions-commands-input-" + this.dataset.command].value = "";
    browser.commands.reset(this.dataset.command);
    DOM["#web-extensions-commands-input-" + this.dataset.command].value = "";
  }

  function allowedKeyboardCodes() {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const sames = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Comma", "Period", "Home", "End", "PageUp", "PageDown", "Space", "Insert", "Delete"];
    const modifiers = new Map([
      ["AltLeft", "Alt"],
      ["AltRight", "Alt"],
      ["ControlLeft", "Control"],
      ["ControlRight", "Control"],
      ["ShiftLeft", "Shift"],
      ["ShiftRight", "Shift"]
    ]);
    const arrows = new Map([
      ["ArrowUp", "Up"],
      ["ArrowDown", "Down"],
      ["ArrowLeft", "Left"],
      ["ArrowRight", "Right"]
    ]);
    // Alt: AltLeft, AltRight
    // Ctrl: ControlLeft, ControlRight
    // Shift: ShiftLeft, ShiftRight
    // A-Z: Replace Key with "" e.g. KeyA
    // 0-9: Replace Digit with "" e.g. Digit1
    // Up,Down,Left,Right: Replace Arrow with "" e.g. ArrowUp
    for (const modifier of modifiers) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set(modifier[0], modifier[1]);
    }
    for (const arrow of arrows) {
      KEYBOARDEVENT_CODE_TO_COMMAND_KEYS.set(arrow[0], arrow[1]);
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



  /**
   * Sets the key that was pressed on a keydown event. This is needed afterwards
   * to write the key to the input value and save the key to storage on keyup.
   *
   * @param event the key event fired
   * @private
   */
  function setKey(event) {
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
    if (![1,2,5,6].includes(modifier) || !code || KEY_MODIFIER_CODE_ARRAY.includes(event.code)) {
      //input.value = "Not allowed";
      allowed = false;
      return;
    }
    allowed = true;
    key = [
      // (event.altKey   ? FLAG_KEY_ALT   : FLAG_KEY_NONE) | // 0001
      // (event.ctrlKey  ? FLAG_KEY_CTRL  : FLAG_KEY_NONE) | // 0010
      // (event.shiftKey ? FLAG_KEY_SHIFT : FLAG_KEY_NONE) | // 0100
      //event.code
      modifier,
      code
    ];
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

document.addEventListener("DOMContentLoaded", WebExtensionsCommands.DOMContentLoaded);