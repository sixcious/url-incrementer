/**
 * WebExtensions Commands UI
 * @file webextensions-commands-ui.js
 * @author Roy Six
 * @license TBD
 */

(() => {

  const DOM_ID = "wecui",
    DOM = {},
    IS_MAC = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i),
    I18N = {
      "typeShortcut":        "Type a shortcut",
      "errorTypeLetter":     "Type a letter",
      "errorIncludeCtrlAlt": IS_MAC ? "Include Ctrl, Alt, or Command" : "Include either Ctrl or Alt",
      "errorUseCtrlAlt":     IS_MAC ? "Invalid combination" : "Use either Ctrl or Alt"
    },
    MAP = new Map([
      [",","Comma"],[".","Period"],[" ","Space"],
      ["Comma","Comma"],["Period","Period"],["Home","Home"],["End","End"],["PageUp","PageUp"],["PageDown","PageDown"],["Space","Space"],["Insert","Insert"],["Delete","Delete"],
      ["ArrowUp", "Up"],["ArrowDown", "Down"],["ArrowLeft", "Left"],["ArrowRight", "Right"],
      ["MediaTrackNext", "MediaNextTrack"],["MediaTrackPrevious", "MediaPrevTrack"],["MediaPlayPause", "MediaPlayPause"],["MediaStop", "MediaStop"]
    ]);

  let error = "";

  for (let i = 0, l = "a", L = "A"; i < 26; i++, l = (parseInt(l, 36) + 1).toString(36), L = l.toUpperCase()) { MAP.set(l, L); MAP.set(L, L); MAP.set("Key" + L, L); }
  for (let i = 0; i <= 9; i++) { MAP.set(i + "", i + ""); MAP.set("Digit" + i, i + ""); }
  for (let i = 1; i <= 12; i++) { MAP.set("F" + i, "F" + i); }

  function generateHTML(commands) {
    DOM["#" + DOM_ID] = document.getElementById(DOM_ID);
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
      label.textContent = command.description;
      column1.appendChild(label);
      const column2 = document.createElement("div");
      column2.className = "column";
      row.appendChild(column2);
      const input = document.createElement("input");
      input.id = DOM_ID + "-input-" + command.name;
      input.className = DOM_ID + "-input";
      input.type = "text";
      input.spellcheck = false;
      input.value = command.shortcut ? command.shortcut.replace(/\+/g, " + ") : "";
      input.placeholder = "";
      input.dataset.name = command.name;
      input.dataset.shortcut = command.shortcut ? command.shortcut.replace(/\+/g, " + ") : "";
      column2.appendChild(input);
      const underline = document.createElement("div");
      underline.id = DOM_ID + "-underline-" + command.name;
      underline.className = DOM_ID + "-underline";
      column2.appendChild(underline);
      const error = document.createElement("div");
      error.id = DOM_ID + "-error-" + command.name;
      error.className = DOM_ID + "-error";
      column2.appendChild(error);
      const clear = document.createElement("div");
      clear.id = DOM_ID + "-clear-" + command.name;
      clear.className = DOM_ID + "-clear";
      clear.dataset.name = command.name;
      column2.appendChild(clear);
    }
    DOM["#" + DOM_ID].appendChild(table);
  }

  function cacheDOM() {
    const elements = document.querySelectorAll("#" + DOM_ID + " [id]");
    for (const element of elements) {
      DOM["#" + element.id] = element;
    }
  }

  function addEventListeners(commands) {
    for (const command of commands) {
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("focus", focus);
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("blur", blur);
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("keydown", keydown);
      DOM["#" + DOM_ID + "-input-" + command.name].addEventListener("keyup", keyup);
      DOM["#" + DOM_ID + "-clear-" + command.name].addEventListener("click", clear);
    }
  }

  function focus() {
    this.value = "";
    this.placeholder = I18N.typeShortcut;
  }

  function blur() {
    this.value = this.dataset.shortcut;
    this.placeholder = "";
    error = "";
    updateError(this);
  }

  function keydown(event) {
    event.preventDefault();
    // To support multiple keyboard layouts, first check if event.key is in the map, second check event.code
    const keycode = MAP.get(event.key) || MAP.get(event.code);
    let text = "";
    if (event.metaKey && IS_MAC) { text += (text ? " + " : "") + "Command"; }
    if (event.altKey)            { text += (text ? " + " : "") + "Alt"; }
    if (event.ctrlKey)           { text += (text ? " + " : "") + (IS_MAC ? "MacCtrl" : "Ctrl"); }
    if (event.shiftKey)          { text += (text ? " + " : "") + "Shift"; }
    if (keycode)                 { text += (text ? " + " : "") + keycode; }
    // Validate Key - 1) Key must use modifier combinations: Alt, Ctrl, Alt+Shift, Ctrl+Shift or 2) be a Function key or 3) Media key (Note: Firefox 63 will add extra valid combinations, regexs are from Firefox)
    if (text.match(/^s*(Alt|Ctrl|Command|MacCtrl)s*\+s*(Shifts*\+s*)?([A-Z0-9]|Comma|Period|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right)s*$/) ||
        text.match(/^\s*((Alt|Ctrl|Command|MacCtrl)\s*\+\s*)?(Shift\s*\+\s*)?(F[1-9]|F1[0-2])\s*$/) ||
        text.match(/^(MediaNextTrack|MediaPlayPause|MediaPrevTrack|MediaStop)$/)) {
      error = "";
    } else if (IS_MAC ? (!event.metaKey && !event.altKey && !event.ctrlKey) : (!event.altKey && !event.ctrlKey)) {
      error = I18N.errorIncludeCtrlAlt;
    } else if (IS_MAC ? (((event.metaKey && event.altKey) || (event.metaKey && event.ctrlKey) || (event.altKey && event.ctrlKey))) : (event.altKey && event.ctrlKey)) {
      error = I18N.errorUseCtrlAlt;
    } else if (!keycode) {
      error = I18N.errorTypeLetter;
    } else {
      error = "";
    }
    // Write key text to input if no error
    if (error !== I18N.errorIncludeCtrlAlt && error !== I18N.errorUseCtrlAlt) {
      this.value = text;
    }
    updateError(this);
  }

  function keyup(event) {
    if (error || !this.value) {
      this.value = "";
      error = "";
      updateError(this);
      return;
    }
    browser.commands.getAll(commands => {
      // Check for and clear other command collisions and then update this command
      const collisions = commands.filter(command => command.name !== this.dataset.name && command.shortcut === this.value.replace(/\s+\+\s+/g, "+"));
      for (const collision of collisions) {
        clear.call(DOM["#" + DOM_ID + "-clear-" + collision.name]);
      }
      browser.commands.update({
        name: this.dataset.name,
        shortcut: this.value
      });
    });
    this.dataset.shortcut = this.value;
    this.blur();
  }

  function clear() {
    browser.commands.reset(this.dataset.name);
    DOM["#" + DOM_ID + "-input-" + this.dataset.name].value = "";
    DOM["#" + DOM_ID + "-input-" + this.dataset.name].dataset.shortcut = "";
  }

  function updateError(input) {
    if (error) {
      DOM["#" + DOM_ID + "-input-" + input.dataset.name].classList.add("error");
      DOM["#" + DOM_ID + "-underline-" + input.dataset.name].classList.add("error");
      DOM["#" + DOM_ID + "-error-" + input.dataset.name].textContent = error;
    } else {
      DOM["#" + DOM_ID + "-input-" + input.dataset.name].classList.remove("error");
      DOM["#" + DOM_ID + "-underline-" + input.dataset.name].classList.remove("error");
      DOM["#" + DOM_ID + "-error-" + input.dataset.name].textContent = "";
    }
  }

  // Firefox Android: browser.commands is currently unsupported
  if (typeof browser !== "undefined" && browser.commands) {
    browser.commands.getAll(commands => {
      generateHTML(commands);
      cacheDOM();
      addEventListeners(commands);
    });
  }

})();