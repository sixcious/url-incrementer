/**
 * URL Incrementer
 * @file popup.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Popup = (() => {

  const DOM = {}; // Map to cache DOM elements: key=id, value=element

  let _ = {}, // Temporary instance before validation
      instance = {}, // Tab instance cache
      items = {}, // Storage items cache
      localItems = {}, // Local Storage items cache
      backgroundPage = {}, // Background page cache
      downloadPreviewCache = {}, // Download Preview Cache
      timeouts = {}; // Reusable global timeouts for input changes to fire after the user stops typing

  /**
   * Initializes the Popup window.
   * 
   * @private
   */
  async function init() {
    const ids = document.querySelectorAll("[id]"),
          i18ns = document.querySelectorAll("[data-i18n]"),
          buttons = document.querySelectorAll("#controls input");
    // Cache DOM elements
    for (const element of ids) {
      DOM["#" + element.id] = element;
    }
    // Set i18n (internationalization) text from messages.json
    for (const element of i18ns) {
      element[element.dataset.i18n] = chrome.i18n.getMessage(element.id.replace(/-/g, '_').replace(/\*.*/, ''));
    }
    // Add Event Listeners to the DOM elements
    DOM["#setup-input"].addEventListener("click", toggleView);
    DOM["#accept-button"].addEventListener("click", setup);
    DOM["#cancel-button"].addEventListener("click", toggleView);
    DOM["#multi-button"].addEventListener("click", clickMulti);
    DOM["#save-url-input"].addEventListener("change", function() { DOM["#save-url-img"].src = "../img/" + (this.checked ? "heart.png" : "heart-o.png"); });
    //DOM["#custom-urls-input"].addEventListener("change", function() { DOM["#increment-decrement"].className = !this.checked ? "display-block fade-in" : "display-none"; DOM["#custom"].className = this.checked ? "display-block fade-in" : "display-none";  });
    DOM["#toolkit-input"].addEventListener("change", function() { DOM["#toolkit"].className = this.checked ? "display-block fade-in" : "display-none"; });
    DOM["#options-button"].addEventListener("click", function() { chrome.runtime.openOptionsPage(); });
    DOM["#url-textarea"].addEventListener("select", selectURL); // "select" event is relatively new and the best event for this
    DOM["#base-select"].addEventListener("change", function() {
      DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none";
      DOM["#base-date"].className = this.value === "date" ? "display-block fade-in" : "display-none";
      DOM["#base-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none";
    });
    DOM["#toolkit-urli-button-img"].addEventListener("click", toolkit);
    DOM["#toolkit-table-crawl-response-input"].addEventListener("change", function() { const style = this.checked ? "table-cell" : "none"; document.querySelectorAll(".toolkit-table-response").forEach(el => el.style.display = style); });
    DOM["#toolkit-table-crawl-ok-input"].addEventListener("change", function() { const style = this.checked ? "table-row" : "none"; document.querySelectorAll(".toolkit-table-crawl-ok").forEach(el => el.style.display = style); });
    DOM["#toolkit-table-crawl-error-input"].addEventListener("change", function() { const style = this.checked ? "table-row" : "none"; document.querySelectorAll(".toolkit-table-crawl-error").forEach(el => el.style.display = style); });
    DOM["#toolkit-table-crawl-redirected-input"].addEventListener("change", function() { const style = this.checked ? "table-row" : "none"; document.querySelectorAll(".toolkit-table-crawl-redirected").forEach(el => el.style.display = style); });
    DOM["#toolkit-table-download-button"].addEventListener("click", function() { const a = document.createElement("a"), blob = URL.createObjectURL(new Blob([DOM["#toolkit-table"].outerHTML], {"type": "text/html"})); a.href = blob; a.download = "url-incremented-links"; a.dispatchEvent(new MouseEvent("click")); setTimeout(function() { URL.revokeObjectURL(blob); }, 1000); });
    DOM["#auto-toggle-input"].addEventListener("change", function() { DOM["#auto"].className = this.checked ? "display-block fade-in" : "display-none"; });
    DOM["#auto-times-input"].addEventListener("change", updateAutoETA);
    DOM["#auto-seconds-input"].addEventListener("change", updateAutoETA);
    DOM["#download-toggle-input"].addEventListener("change", function() { DOM["#download"].className = this.checked ? "display-block fade-in" : "display-none"; if (this.checked) { updateDownloadPreviewCompletely(); } });
    DOM["#download-strategy-select"].addEventListener("change", function() { changeDownloadStrategy.call(this); updateDownloadPreview(); });
    DOM["#download-extensions"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-extensions input", "#download-extensions-generated"); updateDownloadPreview(); });
    DOM["#download-tags"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated"); updateDownloadPreview(); });
    DOM["#download-attributes"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-attributes input", "#download-attributes-generated"); updateDownloadPreview(); });
    DOM["#download-selector-input"].addEventListener("input", function() { inputUpdateDownloadPreview(this, DOM["#download-selector-label"], "font-weight: bold; color: rebeccapurple"); });
    DOM["#download-includes-input"].addEventListener("input", function() { inputUpdateDownloadPreview(this, DOM["#download-includes-label"], "font-weight: bold; color: #05854D"); });
    DOM["#download-excludes-input"].addEventListener("input", function() { inputUpdateDownloadPreview(this, DOM["#download-excludes-label"], "font-weight: bold; color: #E6003E"); });
    DOM["#download-preview-thumb-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-filename-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-extension-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-tag-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-attribute-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-url-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-compressed-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-table-div"].addEventListener("click", updateDownloadSelectedsUnselecteds);
    // Initialize popup content (1-time only)
    const tabs = await Promisify.getTabs();
    backgroundPage = await Promisify.getBackgroundPage();
    items = await Promisify.getItems();
    localItems = await Promisify.getItems("local");
    instance = backgroundPage.Background.getInstance(tabs[0].id);
    if (instance && instance.toolkitEnabled && instance.toolkitTool === "crawl") {
      crawlWindow();
      return;
    }
    if (!instance || !instance.enabled) {
      instance = await backgroundPage.Background.buildInstance(tabs[0], items, localItems);
    }
    _ = JSON.parse(JSON.stringify(instance));
    for (const button of buttons) {
      button.className = items.popupAnimationsEnabled ? "hvr-grow": "";
      button.style.width = button.style.height = items.popupButtonSize + "px";
      button.addEventListener("click", clickActionButton);
    }
    DOM["#download-input"].style.width = DOM["#download-input"].style.height = (items.popupButtonSize + (items.popupButtonSize <= 24 ? 4 : items.popupButtonSize <= 44 ? 6 : 8)) + "px"; // cloud-download.png is an irregular shape and needs adjustment
    updateSetup();
    // Jump straight to Setup if instance isn't enabled or a saved URL
    if ((!instance.enabled && !instance.saveFound)) {
      toggleView.call(DOM["#setup-input"]);
    } else {
      toggleView.call(DOM["#accept-button"]);
    }
  }

  /**
   * Toggles the popup between the controls and setup views.
   * 
   * @private
   */
  function toggleView() {
    switch (this.id) {
      case "setup-input": // Hide controls, show setup
        DOM["#controls"].className = "display-none";
        DOM["#setup"].className = "display-block fade-in";
        updateSetup(true);
        break;
      case "accept-button": // Hide setup, show controls
      case "cancel-button":
        updateControls(); // Needed to reset hover.css click effect
        DOM["#setup"].className = "display-none";
        DOM["#controls"].className = "display-block fade-in";
        break;
      default:
        break;
    }
  }

  /**
   * Performs the action based on the button if the requirements are met (e.g. the instance is enabled).
   * Note: After performing the action, the background sends a message back to popup with the updated instance, so no
   * callback function is needed in performAction().
   * 
   * @private
   */
  function clickActionButton() {
    const action = this.dataset.action;
    if (((action === "increment" || action === "decrement" || action === "clear") && (instance.enabled || instance.saveFound)) ||
        ((action === "increment1" || action === "decrement1" || action === "increment2" || action === "decrement2" || action === "increment3" || action === "decrement3") && instance.multiEnabled) ||
         (action === "next" || action === "prev") ||
         (action === "return" && instance.enabled) ||
         (action === "auto" && instance.autoEnabled) ||
         (action === "download" && instance.downloadEnabled)) {
      if (items.popupAnimationsEnabled) {
        UI.clickHoverCss(this, "hvr-push-click");
      }
      backgroundPage.Action.performAction(action, "popupClickActionButton", instance, items);
    }
  }

  /**
   * Updates the control images based on whether the instance is enabled.
   * Note: update styles, not classNames, to avoid issues with hvr-push-click being cleared too fast after a click.
   * 
   * @private
   */
  function updateControls() {
    DOM["#controls-icons-save-url"].style.display = instance.saveFound ? "" : "none";
    DOM["#controls-icons-save-url"].title = chrome.i18n.getMessage(instance.saveType === "wildcard" ? "controls_icons_save_wildcard" : "controls_icons_save_url");
    DOM["#controls-icons-auto-repeat"].style.display = instance.autoEnabled && instance.autoRepeat ? "" : "none";
    DOM["#controls-icons-shuffle"].className = instance.enabled && instance.shuffleURLs ? "" : "display-none";
    DOM["#increment-input"].style.display =
    DOM["#decrement-input"].style.display = instance.multiEnabled || (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? "none" : "";
    DOM["#increment-input-m"].style.display =
    DOM["#decrement-input-m"].style.display =
    DOM["#increment-input-1"].style.display =
    DOM["#decrement-input-1"].style.display = instance.enabled && instance.multiEnabled && !instance.autoEnabled && instance.multiCount >= 1 ? "" : "none";
    DOM["#increment-input-2"].style.display =
    DOM["#decrement-input-2"].style.display = instance.enabled && instance.multiEnabled && !instance.autoEnabled && instance.multiCount >= 2 ? "" : "none";
    DOM["#increment-input-3"].style.display =
    DOM["#decrement-input-3"].style.display = instance.enabled && instance.multiEnabled && !instance.autoEnabled && instance.multiCount === 3 ? "" : "none";
    DOM["#next-input"].style.display =
    DOM["#prev-input"].style.display = (items.permissionsEnhancedMode && items.nextPrevPopupButtons) || (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? "" : "none";
    DOM["#clear-input"].style.opacity = DOM["#increment-input"].style.opacity = DOM["#decrement-input"].style.opacity = instance.enabled || instance.saveFound ? 1 : 0.2;
    DOM["#return-input"].style.display = instance.enabled ? "" : "none";
    DOM["#auto-input"].style.display = instance.autoEnabled ? "" : "none";
    DOM["#auto-input"].src = instance.autoPaused ? "../img/play-circle.png" : "../img/pause-circle.png";
    DOM["#auto-input"].title = chrome.i18n.getMessage(instance.autoPaused ? "auto_resume_input" : "auto_pause_input");
    DOM["#download-input"].style.display = items.permissionsDownload && instance.downloadEnabled ? "" : "none";
  }

  /**
   * Updates the setup input properties. This method is called when the popup loads or when the instance is updated.
   *
   * @param minimal if true, only update a minimal part of the setup, if false update everything
   * @private
   */
  function updateSetup(minimal) {
    // Increment Decrement Setup:
    if (instance.saveFound || localItems.savePreselect) {
      DOM["#save-url-input"].checked = true;
      DOM["#save-url-img"].src = DOM["#save-url-img"].src.replace("-o", "");
    }
    DOM["#url-textarea"].value = instance.url;
    DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
    DOM["#url-textarea"].focus();
    DOM["#selection-input"].value = instance.selection;
    DOM["#selection-start-input"].value = instance.selectionStart;
    if (minimal) {
      return; // e.g. just switching from controls to setup, no need to recalculate the below again
    }
    DOM["#interval-input"].value = instance.interval;
    DOM["#error-skip-input"].value = instance.errorSkip;
    DOM["#base-select"].value = instance.base;
    DOM["#base-case"].className = instance.base > 10 ? "display-block" : "display-none";
    DOM["#base-case-lowercase-input"].checked = instance.baseCase === "lowercase";
    DOM["#base-case-uppercase-input"].checked = instance.baseCase === "uppercase";
    DOM["#base-date"].className = instance.base === "date" ? "display-block" : "display-none";
    DOM["#base-date-format-input"].value = instance.baseDateFormat;
    DOM["#base-custom"].className = instance.base === "custom" ? "display-block" : "display-none";
    DOM["#base-custom-input"].value = instance.baseCustom;
    DOM["#leading-zeros-input"].checked = instance.leadingZeros;
    DOM["#shuffle-urls-input"].checked = instance.shuffleURLs;
    DOM["#multi-count"].value = instance.multiEnabled ? instance.multiCount : 0;
    DOM["#multi-img-1"].className = instance.multiEnabled && instance.multiCount >= 1 ? "" : "disabled";
    DOM["#multi-img-2"].className = instance.multiEnabled && instance.multiCount >= 2 ? "" : "disabled";
    DOM["#multi-img-3"].className = instance.multiEnabled && instance.multiCount >= 3 ? "" : "disabled";
    // Toolkit Setup:
    DOM["#toolkit-tool-crawl-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-crawl-input"].value;
    DOM["#toolkit-tool-tabs-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-tabs-input"].value;
    DOM["#toolkit-tool-links-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-links-input"].value;
    DOM["#toolkit-action-increment-input"].checked = instance.toolkitAction === DOM["#toolkit-action-increment-input"].value;
    DOM["#toolkit-action-decrement-input"].checked = instance.toolkitAction === DOM["#toolkit-action-decrement-input"].value;
    DOM["#toolkit-quantity-input"].value = instance.toolkitQuantity;
    DOM["#toolkit-seconds-input"].value = instance.toolkitSeconds;
    // Auto Setup:
    DOM["#auto-toggle-input"].checked = instance.autoEnabled;
    DOM["#auto"].className = instance.autoEnabled ? "display-block" : "display-none";
    DOM["#auto-action-select"].value = instance.autoAction;
    DOM["#auto-times-input"].value = instance.autoTimes;
    DOM["#auto-seconds-input"].value = instance.autoSeconds;
    DOM["#auto-wait-input"].checked = instance.autoWait;
    DOM["#auto-badge-input"].checked = instance.autoBadge === "times";
    DOM["#auto-repeat-input"].checked = instance.autoRepeat;
    updateAutoETA();
    // Download Setup:
    DOM["#download-toggle"].style = items.permissionsDownload ? "" : "display: none;";
    DOM["#download-toggle-input"].checked = instance.downloadEnabled;
    DOM["#download"].className = instance.downloadEnabled ? "display-block" : "display-none";
    DOM["#download-strategy-select"].value = instance.downloadStrategy;
    DOM["#download-extensions-generated"].value = instance.downloadExtensions && Array.isArray(instance.downloadExtensions) ? instance.downloadExtensions.join(",") : "";
    DOM["#download-tags-generated"].value = instance.downloadTags && Array.isArray(instance.downloadTags) ? instance.downloadTags.join(",") : "";
    DOM["#download-attributes-generated"].value = instance.downloadAttributes && Array.isArray(instance.downloadAttributes) ? instance.downloadAttributes.join(",") : "";
    DOM["#download-selector-input"].value = instance.downloadSelector;
    DOM["#download-includes-input"].value = instance.downloadIncludes && Array.isArray(instance.downloadIncludes) ? instance.downloadIncludes.join(",") : "";
    DOM["#download-excludes-input"].value = instance.downloadExcludes && Array.isArray(instance.downloadExcludes) ? instance.downloadExcludes.join(",") : "";
    DOM["#download-min-mb-input"].value = instance.downloadMinMB && instance.downloadMinMB > 0 ? instance.downloadMinMB : "";
    DOM["#download-max-mb-input"].value = instance.downloadMaxMB && instance.downloadMaxMB > 0 ? instance.downloadMaxMB : "";
    DOM["#download-subfolder-input"].value = instance.downloadSubfolder && instance.downloadSubfolder.trim() ? instance.downloadSubfolder : "";
    DOM["#download-preview-thumb-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("thumb");
    DOM["#download-preview-filename-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("filename");
    DOM["#download-preview-extension-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("extension");
    DOM["#download-preview-tag-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("tag");
    DOM["#download-preview-attribute-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("attribute");
    DOM["#download-preview-url-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("url");
    DOM["#download-preview-compressed-input"].checked = instance.downloadPreview  && instance.downloadPreview.includes("compressed");
    translateCheckboxValuesToHiddenInput("#download-preview-checkboxes input", "#download-preview-checkboxes-generated");
    changeDownloadStrategy.call(DOM["#download-strategy-select"]);
    updateInputLabelStyle(DOM["#download-selector-input"], DOM["#download-selector-label"], "font-weight: bold; color: rebeccapurple");
    updateInputLabelStyle(DOM["#download-includes-input"], DOM["#download-includes-label"], "font-weight: bold; color: #05854D");
    updateInputLabelStyle(DOM["#download-excludes-input"], DOM["#download-excludes-label"], "font-weight: bold; color: #E6003E");
    if (DOM["#download-toggle-input"].checked) {
      updateDownloadPreviewCompletely();
    }
  }

  /**
   * Handle the URL selection on select events. Stores the selectionStart
   * in a hidden input and updates the selection input to the selected text and
   * checks the leading zeros checkbox based on leading zeros present.
   * 
   * @private
   */
  function selectURL() {
    DOM["#selection-input"].value = DOM["#url-textarea"].value.substring(DOM["#url-textarea"].selectionStart, DOM["#url-textarea"].selectionEnd); // Firefox: window.getSelection().toString(); does not work in FF
    DOM["#selection-start-input"].value = DOM["#url-textarea"].selectionStart;
    if (items.leadingZerosPadByDetection) {
      DOM["#leading-zeros-input"].checked = DOM["#selection-input"].value.charAt(0) === '0' && DOM["#selection-input"].value.length > 1;
    }
  }

  /**
   * Handles the click multi button event, performing validation on the selection and then saving the multi instance.
   *
   * @private
   */
  function clickMulti() {
    setupInputs("multi");
    const e = setupErrors("multi");
    if (_.multiCount >= 3) {
      DOM["#multi-count"].value = 0;
      DOM["#multi-img-1"].className = DOM["#multi-img-2"].className = DOM["#multi-img-3"].className = "disabled";
    } else if (e.incrementDecrementErrorsExist) {
      UI.generateAlert(e.incrementDecrementErrors);
    } else {
      const multiCountNew = _.multiCount + 1;
      DOM["#multi-count"].value = multiCountNew;
      DOM["#multi-img-" + multiCountNew].className = "";
      _.multi[multiCountNew].selection = _.selection;
      _.multi[multiCountNew].startingSelection = _.selection;
      _.multi[multiCountNew].selectionStart = _.multiRange ? _.selectionStart - 1 : _.selectionStart; // -1 from starting {
      _.multi[multiCountNew].startingSelectionStart = _.multi[multiCountNew].selectionStart;
      _.multi[multiCountNew].interval = _.interval;
      _.multi[multiCountNew].base = _.base;
      _.multi[multiCountNew].baseCase = _.baseCase;
      _.multi[multiCountNew].baseDateFormat = _.baseDateFormat;
      _.multi[multiCountNew].baseCustom = _.baseCustom;
      _.multi[multiCountNew].leadingZeros = _.leadingZeros;
      _.multi[multiCountNew].times = _.multiTimes;
      _.multi[multiCountNew].range = _.multiRange;
    }
  }

  /**
   * Builds the Toolkit's table of URLs and the download button link when the toolkit tool is "links" or "crawl."
   *
   * @param urls  the incremented or decremented URLs that were generated
   * @param crawl true if the tool is crawl (to add additional data), false otherwise
   * @private
   */
  function buildToolkitURLsTable(urls, crawl) {
    if (urls && urls.length > 0) {
      // Table must have similar inline styling from popup.css for the download blob's HTML file:
      const table = document.createElement("table");
      table.id = "toolkit-table";
      table.style = "font-family: \"Segoe UI\", Tahoma, sans-serif; font-size: 12px; border-collapse: collapse; border-radius: 0;'";
      // thead
      const thead = document.createElement("thead");
      thead.style = "background: #f8f8f8; color: #0a0a0a;";
      table.appendChild(thead);
      const tr = document.createElement("tr");
      tr.style = "background: transparent;";
      thead.appendChild(tr);
      const th = document.createElement("th");
      th.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem;";
      th.textContent = chrome.i18n.getMessage("url_label");
      tr.appendChild(th);
      if (crawl) {
        const th = document.createElement("th");
        th.className = "toolkit-table-response";
        th.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem; min-width: 64px;";
        th.textContent = chrome.i18n.getMessage("toolkit_response_label");
        tr.appendChild(th);
      }
      // tbody
      const tbody = document.createElement("tbody");
      tbody.style = "border: 1px solid #f1f1f1; background-color: #fefefe;";
      table.appendChild(tbody);
      let count = 1;
      for (const url of urls) {
        const tr = document.createElement("tr");
        tr.id = "toolkit-table-tr-" + (count - 1);
        tr.className = "response-tbd";
        tr.style = (++count % 2) !== 0 ? "border-bottom: 0; background-color: #f1f1f1;" : "";
        tbody.appendChild(tr);
        const td = document.createElement("td");
        td.style = "padding: 0.25rem 0.312rem 0.312rem";
        tr.appendChild(td);
        const a = document.createElement("a");
        a.href = url.urlmod;
        // a.target = "_blank";
        a.textContent = url.urlmod;
        td.appendChild(a);
        if (crawl) {
          const td = document.createElement("td");
          td.id = "toolkit-table-td-" + (count - 2);
          td.className = "toolkit-table-response";
          td.style = "padding: 0.25rem 0.312rem 0.312rem; font-weight: bold;";
          tr.appendChild(td);
        }
      }
      DOM["#toolkit-table"] = table;
      DOM["#toolkit-table-div"].replaceChild(table, DOM["#toolkit-table-div"].firstChild);
      DOM["#toolkit-table-crawl"].className = crawl ? "display-block" : "display-none";
      DOM["#toolkit-table-outer"].className = "display-block fade-in";
    }
  }

  /**
   * TODO
   *
   * @private
   */
  async function toolkit() {
    UI.clickHoverCss(this, "hvr-push-click");
    const tabs = await Promisify.getTabs({currentWindow: true});
    console.log("toolkit() - tabs.length=" + tabs.length);
    setupInputs("toolkit", tabs);
    const e = setupErrors("toolkit");
    if (e.toolkitErrorsExist) {
      UI.generateAlert(e.toolkitErrors);
    } else if (e.incrementDecrementErrorsExist) {
      UI.generateAlert(e.incrementDecrementErrors);
    } else {
      const toolkitInstance = JSON.parse(JSON.stringify(_));
      toolkitInstance.toolkitEnabled = true;
      const precalculateProps = backgroundPage.IncrementDecrementArray.precalculateURLs(toolkitInstance);
      toolkitInstance.urls = precalculateProps.urls;
      toolkitInstance.urlsCurrentIndex = precalculateProps.currentIndex;
      if (toolkitInstance.toolkitTool === "links") {
        buildToolkitURLsTable(toolkitInstance.urls, false);
      }
      backgroundPage.Action.performAction("toolkit", "popup", toolkitInstance, items);
      // Note: After performing the action, the background sends a message back to popup with the results (if necessary)
      chrome.storage.sync.set({
        "toolkitTool": _.toolkitTool,
        "toolkitAction": _.toolkitAction,
        "toolkitQuantity": _.toolkitQuantity,
        "toolkitSeconds": _.toolkitSeconds
      });
    }
  }

  // public TODO
  function crawlWindow() {
    console.log("crawlWindow() - starting to crawl " + instance.urls.length + " URLs");
    DOM["#toolkit-percentage-value"].textContent = 0 + "%";
    updateETA(instance.toolkitQuantity * (instance.toolkitSeconds + 1), DOM["#toolkit-eta-value"], true);
    buildToolkitURLsTable(instance.urls, true);
    DOM["#setup"].className = "display-block";
    DOM["#toolkit"].className = "display-block";
    DOM["#toolkit-table"].className = "display-block";
    DOM["#increment-decrement"].className = DOM["#auto"].className = DOM["#download"].className = "display-none";
    DOM["#setup-buttons"].className = "display-none";
    crawlURLs(instance.toolkitQuantity);
    backgroundPage.Background.deleteInstance(instance.tabId);
  }

  function crawlURLs(quantityRemaining) {
    const quantity =  instance.toolkitQuantity;
    const id = quantity - quantityRemaining;
    if (quantityRemaining > 0) {
      // fetch using credentials: same-origin to keep session/cookie state alive (to avoid redirect false flags e.g. after a user logs in to a website)
      fetch(instance.urls[id].urlmod, { method: "HEAD", credentials: "same-origin" }).then(function(response) {
        const tr = document.getElementById("toolkit-table-tr-" + id);
        const td = document.getElementById("toolkit-table-td-" + id);
        const status = response.redirected ? "Redirected" : response.status === 200 ? "OK" : response.status;
        tr.className = "toolkit-table-crawl-" + (status === "Redirected" ? "redirected" : status === "OK" ? "ok" : "error");
        td.style.color = status === "Redirected" ? "#663399" : status === "OK" ? "#05854D" : "#E6003E";
        td.textContent = status;
        instance.toolkitQuantityRemaining--;
        DOM["#toolkit-percentage-value"].textContent = Math.floor(((quantity - instance.toolkitQuantityRemaining) / quantity) * 100) + "%";
        updateETA((instance.toolkitQuantityRemaining) * (instance.toolkitSeconds + 1), DOM["#toolkit-eta-value"], true);
      }).catch(e => {
        console.log("crawlURLs() - a fetch() exception was caught:" + e);
      });
      setTimeout(function() { crawlURLs(quantityRemaining - 1); }, instance.toolkitSeconds * 1000);
    } else {
      console.log("crawlURLs() - we have exhausted the quantityRemaining");
    }
  }

  /**
   * TODO...
   */
  function updateAutoETA() {
    updateETA(+DOM["#auto-times-input"].value * +DOM["#auto-seconds-input"].value, DOM["#auto-eta-value"], instance.autoEnabled);
  }

  /**
   * Updates the Auto or Toolkit ETA times every time the seconds or times is updated by the user or when the instance is updated.
   *
   * Calculating the hours/minutes/seconds is based on code written by Vishal @ stackoverflow.com
   * @see https://stackoverflow.com/a/11486026/988713
   * @private
   */
  function updateETA(time, eta, enabled) {
    const hours = ~~ (time / 3600),
          minutes = ~~ ((time % 3600) / 60),
          seconds = time % 60,
          fhours = hours ? hours + (hours === 1 ? chrome.i18n.getMessage("eta_hour") : chrome.i18n.getMessage("eta_hours")) : "",
          fminutes = minutes ? minutes + (minutes === 1 ? chrome.i18n.getMessage("eta_minute") : chrome.i18n.getMessage("eta_minutes")) : "",
          fseconds = seconds ? seconds + (seconds === 1 ? chrome.i18n.getMessage("eta_second") : chrome.i18n.getMessage("eta_seconds")) : "";
    eta.textContent =
      time <= 0 || (!hours && !minutes && !seconds) ?
      enabled ? chrome.i18n.getMessage("eta_done") : chrome.i18n.getMessage("eta_tbd") :
      time > 86400 ? chrome.i18n.getMessage("eta_day") : fhours + fminutes + fseconds;
  }

  /**
   * Changes the affected download options and help text when the download strategy is changed by the user.
   *
   * @private
   */
  function changeDownloadStrategy() {
    DOM["#download-extensions"].className = this.value === "extensions" ? "display-block fade-in" : "display-none";
    DOM["#download-tags"].className = this.value === "tags" ? "display-block fade-in" : "display-none";
    DOM["#download-attributes"].className = this.value === "attributes" ? "display-block fade-in" : "display-none";
    DOM["#download-selector"].className = this.value === "selector" ? "display-block fade-in" : "display-none";
    DOM["#download-strategy-help"].title =
      this.value === "extensions" ? chrome.i18n.getMessage("download_help_extensions_title") :
      this.value === "tags" ? chrome.i18n.getMessage("download_help_tags_title") :
      this.value === "attributes" ? chrome.i18n.getMessage("download_help_attributes_title") :
      this.value === "selector" ? chrome.i18n.getMessage("download_help_selector_title") :
      this.value === "page" ? chrome.i18n.getMessage("download_help_page_title") : "";
    DOM["#download-strategy-help-label"].textContent =
      this.value === "extensions" ? chrome.i18n.getMessage("download_help_extensions_label") :
      this.value === "tags" ? chrome.i18n.getMessage("download_help_tags_label") :
      this.value === "attributes" ? chrome.i18n.getMessage("download_help_attributes_label") :
      this.value === "selector" ? chrome.i18n.getMessage("download_help_selector_label") :
      this.value === "page" ? chrome.i18n.getMessage("download_help_page_label") : "";
  }

  /**
   * Updates the download preview completely, injecting the script again on the page and getting all the download URLs,
   * extensions, tags, and attributes. This is only called when the user manually toggles DL on, or when a message is
   * received from the background to update it (when auto incrementing to update the preview for the new current URL).
   *
   * @private
   */
  function updateDownloadPreviewCompletely() {
    // Execute the download.js script to find all the URLs, extensions, tags, and attributes:
    chrome.tabs.executeScript(instance.tabId, {file: "/js/download.js", runAt: "document_end"}, function() {
      if (chrome.runtime.lastError) {
        const div = document.createElement("div");
        div.textContent = chrome.i18n.getMessage("download_preview_blocked");
        DOM["#download-preview-table-div"].replaceChild(div, DOM["#download-preview-table-div"].firstChild);
      } else {
        const code = "Download.previewDownloadURLs();";
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
          if (results && results[0]) {
            // Cache the results, build the extensions, tags, and attributes checkboxes, and then update the rest of the
            // download preview (e.g. table) in the next method
            downloadPreviewCache = results[0];
            const downloadExtensions = DOM["#download-extensions-generated"].value.split(","),
                  downloadTags = DOM["#download-tags-generated"].value.split(","),
                  downloadAttributes = DOM["#download-attributes-generated"].value.split(",");
            DOM["#download-extensions"].replaceChild(buildDownloadPreviewCheckboxes(downloadPreviewCache.allExtensions, downloadExtensions), DOM["#download-extensions"].firstChild);
            DOM["#download-tags"].replaceChild(buildDownloadPreviewCheckboxes(downloadPreviewCache.allTags, downloadTags), DOM["#download-tags"].firstChild);
            DOM["#download-attributes"].replaceChild(buildDownloadPreviewCheckboxes(downloadPreviewCache.allAttributes, downloadAttributes), DOM["#download-attributes"].firstChild);
            updateDownloadPreview();
          }
        });
      }
    });
  }

  /**
   * Builds the Download Preview Checkboxes HTML for the properties (extensions, tags, and attributes).
   * This is only called by downloadPreviewCompletely().
   *
   * @param properties        all the properties (extensions/tags/attributes)
   * @param checkedProperties only the checked properties (e.g. the instance's checked extensions/tags/attributes)
   * @returns {HTMLElement} the HTML element div containing the checkboxes
   * @private
   */
  function buildDownloadPreviewCheckboxes(properties, checkedProperties) {
    const div = document.createElement("div");
    for (const property of properties) {
      const label = document.createElement("label");
      div.appendChild(label);
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = property;
      input.checked = checkedProperties && checkedProperties.includes(property) ? "checked" : "";
      label.appendChild(input);
      const span = document.createElement("span");
      span.textContent = property;
      label.appendChild(span);
    }
    return div;
  }

  /**
   * Updates the download preview's selected URLs only. This is called each time the user makes a change in the download
   * strategy, when checking the checkboxes, or when entering text in an input (e.g. includes/excludes filters).
   *
   * @private
   */
  function updateDownloadPreview() {
    const downloadStrategy = DOM["#download-strategy-select"].value,
          downloadExtensions = DOM["#download-extensions-generated"].value.split(","),
          downloadTags = DOM["#download-tags-generated"].value.split(","),
          downloadAttributes = DOM["#download-attributes-generated"].value.split(","),
          downloadSelector = DOM["#download-selector-input"].value,
          downloadIncludes = DOM["#download-includes-input"].value ? DOM["#download-includes-input"].value.replace(/\s+/g, "").split(",").filter(Boolean) : [],
          downloadExcludes = DOM["#download-excludes-input"].value ? DOM["#download-excludes-input"].value.replace(/\s+/g, "").split(",").filter(Boolean) : [],
          code = "Download.findDownloadURLs(" +
            JSON.stringify(downloadStrategy) + ", " +
            JSON.stringify(downloadExtensions) + ", " +
            JSON.stringify(downloadTags) + ", " +
            JSON.stringify(downloadAttributes) + ", " +
            JSON.stringify(downloadSelector) + ", " +
            JSON.stringify(downloadIncludes) + ", " +
            JSON.stringify(downloadExcludes) + ");";
    chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
      if (chrome.runtime.lastError) {
        const div = document.createElement("div");
        div.textContent = chrome.i18n.getMessage("download_preview_blocked");
        DOM["#download-preview-table-div"].replaceChild(div, DOM["#download-preview-table-div"].firstChild);
      } else if (results && results[0]) {
        // We get the selected URLs from the result, and then filter out the unselected ones from all the URLs
        // Note: Finding the difference of two arrays of objects code by kaspermoerch
        // @see https://stackoverflow.com/a/21988249
        const alls = downloadStrategy !== "page" ? downloadPreviewCache.allURLs : downloadPreviewCache.pageURL,
          selecteds = results[0],
          unselecteds = alls.filter(function(allObj) {
            return !selecteds.some(function(selectedObj) {
              return allObj.url === selectedObj.url;
            });
          }),
          selectedsLength = selecteds.length,
          totalLength = selecteds.length + unselecteds.length;
        // Download Preview Heading Title:
        const title = document.createElement("div"); title.className = (selectedsLength > 0 ? "success" : "error");
        const titleNode1 = document.createTextNode(chrome.i18n.getMessage("download_preview_set")); title.appendChild(titleNode1);
        const titleNode2 = document.createElement("span"); titleNode2.id = "selecteds-length"; titleNode2.textContent = selectedsLength; title.appendChild(titleNode2);
        const titleNode3 = document.createTextNode(chrome.i18n.getMessage("download_preview_outof") + totalLength + chrome.i18n.getMessage("download_preview_urls")); title.appendChild(titleNode3);
        DOM["#download-preview-heading-title"].replaceChild(title, DOM["#download-preview-heading-title"].firstChild);
        // Download Preview Table and a count index to keep track of current row index:
        const table = document.createElement("table");
        const thead = document.createElement("thead"); table.appendChild(thead);
        const tr = document.createElement("tr"); thead.appendChild(tr);
        let th;
        th = document.createElement("th"); th.className = "check"; th.textContent = " "; tr.appendChild(th);
        th = document.createElement("th"); th.className = "count"; th.textContent = " "; tr.appendChild(th);
        th = document.createElement("th"); th.className = "thumb"; th.textContent = chrome.i18n.getMessage("download_preview_thumb_label"); tr.appendChild(th);
        th = document.createElement("th"); th.className = "filename"; th.textContent = chrome.i18n.getMessage("download_preview_filename_label"); tr.appendChild(th);
        th = document.createElement("th"); th.className = "extension"; th.textContent = chrome.i18n.getMessage("download_preview_extension_label"); tr.appendChild(th);
        th = document.createElement("th"); th.className = "tag"; th.textContent = chrome.i18n.getMessage("download_preview_tag_label"); tr.appendChild(th);
        th = document.createElement("th"); th.className = "attribute"; th.textContent = chrome.i18n.getMessage("download_preview_attribute_label"); tr.appendChild(th);
        th = document.createElement("th"); th.className = "url"; th.textContent = chrome.i18n.getMessage("download_preview_url_label"); tr.appendChild(th);
        const tbody = document.createElement("tbody"); table.appendChild(tbody);
        let count = 1;
        for (const selected of selecteds) {
          tbody.appendChild(buildDownloadPreviewTR(selected, true, count++));
        }
        for (const unselected of unselecteds) {
          tbody.appendChild(buildDownloadPreviewTR(unselected, false, count++));
        }
        DOM["#download-preview-table-div"].replaceChild(table, DOM["#download-preview-table-div"].firstChild);
        // After we build the table we need to update the columns again to what the checkboxes were:
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-thumb-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-filename-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-extension-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-tag-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-attribute-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-url-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-compressed-input"]);
        // Reset the manually selected includes and excludes each time the table is rebuilt:
        downloadPreviewCache.selecteds = selecteds;
        downloadPreviewCache.unselecteds = unselecteds;
        downloadPreviewCache.mselecteds = [];
        downloadPreviewCache.munselecteds = [];
      } else {
        const div = document.createElement("div");
        div.textContent = chrome.i18n.getMessage("download_preview_noresults");
        DOM["#download-preview-table-div"].replaceChild(div, DOM["#download-preview-table-div"].firstChild);
      }
    });
  }

  /**
   * Builds the TR (table row) element for the download preview table.
   *
   * @param item       the download preview item
   * @param isSelected true if this download preview item is selected, false if not
   * @param count      the current row index count
   * @returns {Element} the tr element
   * @private
   */
  function buildDownloadPreviewTR(item, isSelected, count) {
    const tr = document.createElement("tr"); tr.className = (isSelected ? "selected" : "unselected"); tr.dataset.json = JSON.stringify(item); // data-json used by user's selecteds and unselecteds, must use ' not " to wrap json
    const check = document.createElement("img"); check.src = "../img/check-circle.png"; check.alt = ""; check.width = check.height = 16; check.className = "check-circle hvr-grow";
    const thumb = buildDownloadPreviewThumb(item);
    let td;
    td = document.createElement("td"); td.className = "check"; td.appendChild(check); tr.appendChild(td);
    td = document.createElement("td"); td.className = "count"; td.textContent = count; tr.appendChild(td);
    td = document.createElement("td"); td.className = "thumb"; if (thumb) { td.appendChild(thumb); } tr.appendChild(td);
    td = document.createElement("td"); td.className = "filename"; td.textContent = item.filename; tr.appendChild(td);
    td = document.createElement("td"); td.className = "extension"; td.textContent = item.extension; tr.appendChild(td);
    td = document.createElement("td"); td.className = "tag"; td.textContent = item.tag; tr.appendChild(td);
    td = document.createElement("td"); td.className = "attribute"; td.textContent = item.attribute; tr.appendChild(td);
    td = document.createElement("td"); td.className = "url"; td.textContent = item.url; tr.appendChild(td);
    return tr;
  }

  /**
   * Builds the download preview thumb element (e.g. an <img> element).
   *
   * @param item the download preview item
   * @returns {Element} the thumb element (e.g. <img>)
   * @private
   */
  function buildDownloadPreviewThumb(item) {
    const IMG_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "svg", "bmp", "ico"],
          VIDEO_EXTENSIONS = ["mp4", "webm"];
    let el = undefined;
    if (item.tag === "img" || IMG_EXTENSIONS.includes(item.extension)) {
      el = document.createElement("img"); el.src = item.url; el.alt = "";
    } else if (item.tag === "video" || VIDEO_EXTENSIONS.includes(item.extension)) {
      el = document.createElement("video"); el.src = item.url;
    }
    return el;
  }

  /**
   * This function is called as the user is typing in a download preview input (e.g. includes/excludes).
   * We don't want to update the downloadPreview immediately as it's an expensive procedure, so we set a timeout delay.
   *
   * @param input the text input (which will be updated later)
   * @param label the label for the input (which will be updated)
   * @param style the style to set the input and label
   * @private
   */
  function inputUpdateDownloadPreview(input, label, style) {
    console.log("inputUpdateDownloadPreview() - about to clearTimeout and setTimeout");
    clearTimeout(timeouts[input.id]);
    timeouts[input.id] = setTimeout(function() { updateDownloadPreview(); updateInputLabelStyle(input, label, style); }, 1000);
  }

  /**
   * Updates the input and label styling together. It's used for the download preview text inputs to make
   * them more "noticeable" when the user has something typed in.
   *
   * @param input the text input
   * @param label the label for the input
   * @param style the style to set the input and label
   * @private
   */
  function updateInputLabelStyle(input, label, style) {
    input.style = label.style = input.value ? style : "";
  }

  /**
   * Translates checkbox values into a hidden input string which will be used later. This is used by the download
   * property checkboxes that are dynamically built (e.g. downloadExtensions).
   *
   * @param selectorInputs the CSS selector that queries for the checkbox inputs
   * @param generatedId the hidden input's ID, which will store the generated value of the checkboxes
   * @private
   */
  function translateCheckboxValuesToHiddenInput(selectorInputs, generatedId) {
    const inputs = document.querySelectorAll(selectorInputs);
    let generated = "";
    for (const input of inputs) {
      if (input.checked) {
        generated += (generated !== "" ? "," : "") + input.value;
      }
    }
    DOM[generatedId].value = generated;
  }

  /**
   * Called each time the download preview table checkboxes are changed. Translates the checkbox values into a hidden
   * input and then updates the table's styling accordingly.
   *
   * @private
   */
  function updateDownloadPreviewCheckboxes() {
    translateCheckboxValuesToHiddenInput("#download-preview-checkboxes input", "#download-preview-checkboxes-generated");
    if (this.value === "compressed") {
      DOM["#download-preview-table-div"].style = this.checked ? "white-space: normal;" : "white-space: nowrap;"
    } else {
      let elements = document.getElementsByClassName(this.value);
      // let elements = document.querySelectorAll("#download-preview-table-div table ." + this.value );
      for (const element of elements) {
        element.style.display = this.checked ? "table-cell" : "none";
      }
    }
  }

  // TODO:
  function updateDownloadSelectedsUnselecteds(event) {
    const element = event.target;
    if (element && element.classList.contains("check-circle")) {
      const parent = element.parentNode.parentNode;
      const object = JSON.parse(parent.dataset.json);
      const isBeingAdded = parent.className === "unselected";
      const generatedId = isBeingAdded ? "selecteds" : "unselecteds";
      const otherId = isBeingAdded ? "unselecteds" : "selecteds";
      parent.className = isBeingAdded ? "selected" : "unselected";
      if (!downloadPreviewCache[generatedId].some(download => (download.url === object.url))) {
        console.log("pushing into download preview cache" + generatedId);
        downloadPreviewCache["m" + generatedId].push(object);
      }
      downloadPreviewCache["m" + otherId] = downloadPreviewCache["m" + otherId].filter(otherObject => { return otherObject.url !== object.url });
      const selectedsLengthElement = document.getElementById("selecteds-length");
      const selectedsLengthNumber = Number(selectedsLengthElement.textContent);
      const selectedsLengthNumberFinal = isBeingAdded ? selectedsLengthNumber + 1 : selectedsLengthNumber - 1;
      selectedsLengthElement.textContent = "" + (selectedsLengthNumberFinal);
      selectedsLengthElement.parentElement.className = selectedsLengthNumberFinal > 0 ? "success" : "error";
    }
  }

  /**
   * Sets up the instance in increment decrement mode. First validates user input for any
   * errors, then saves and enables the instance, then toggles the view back to
   * the controls.
   *
   * Note: Filtering arrays e.g. .filter(Boolean) filters against empty "" values in case user enters an extra comma, for example: "1,2," by user1106925 @ StackOverflow.com
   * @see https://stackoverflow.com/a/16701357
   * @private
   */
  function setup() {
    setupInputs("accept");
    const e = setupErrors("accept");
    /* Validated Rules:
      1. Auto is NOT enabled, Download is NOT enabled: Check if errors exist, else validated
      2. Auto is enabled, Auto is Increment/Decrement, Download is NOT enabled: Check if errors exist and if autoErrors exist, else validated
      3. Auto is enabled, Auto is Increment/Decrement, Download is enabled: Check if errors exist, autoErrors exist, and downloadErrors exist, else validated
      4. Auto is enabled, Auto is Next/Prev, Download is NOT enabled: Check if autoErrors exist, else validated
      5. Auto is enabled, Auto is Next/Prev, Download is enabled: Check if autoErrors exist and if downloadErrors exist, else validated
      6. Download is enabled, Auto is NOT enabled: Check if downloadErrors exist, and check if errors exist. If errors exist, validate only download, else validate increment and download
    */
    const validated =
      !_.autoEnabled && !_.downloadEnabled ?
        !e.incrementDecrementErrorsExist :
      _.autoEnabled ?
        _.autoAction === "increment" || _.autoAction === "decrement" ?
          !_.downloadEnabled ?
            !e.incrementDecrementErrorsExist && !e.autoErrorsExist :
            !e.incrementDecrementErrorsExist && !e.autoErrorsExist && !e.downloadErrorsExist :
        // e.g. _.autoAction === "next" || _.autoAction === "prev"
        !_.downloadEnabled ?
          !e.autoErrorsExist :
          !e.autoErrorsExist && !e.downloadErrorsExist :
       _.downloadEnabled && !_.autoEnabled && !e.downloadErrorsExist;
    // Generate alerts if not validated
    if (!validated) {
      if (e.downloadErrorsExist) {
        UI.generateAlert(e.downloadErrors);
      } else if (e.autoErrorsExist) {
        UI.generateAlert(e.autoErrors);
      } else if (e.incrementDecrementErrorsExist) {
        UI.generateAlert(e.incrementDecrementErrors);
      } else {
        UI.generateAlert([chrome.i18n.getMessage("oops_error")]);
      }
    }
    // Else good to go!
    else {
      backgroundPage.Action.performAction("clear", "popupClearBeforeSet", instance, items, async function() {
        instance = JSON.parse(JSON.stringify(_));
        instance.incrementDecrementEnabled = !e.incrementDecrementErrorsExist && instance.autoEnabled ? (instance.autoAction !== "next" && instance.autoAction !== "prev") : !e.incrementDecrementErrorsExist;
        instance.enabled = true;
        instance.saveFound = instance.saveURL;
        const precalculateProps = backgroundPage.IncrementDecrementArray.precalculateURLs(instance);
        instance.urls = precalculateProps.urls;
        instance.urlsCurrentIndex = instance.startingURLsCurrentIndex = precalculateProps.currentIndex;
        backgroundPage.Background.setInstance(instance.tabId, instance);
        // Save URL
        if (instance.saveURL) {
          backgroundPage.Saves.addURL(instance); // TODO
          instance.saveType = "url";
        }
        // If popup can overwrite increment/decrement settings, write to storage
        if (instance.enabled && items.popupSettingsCanOverwrite) {
          chrome.storage.sync.set({
            "interval": _.interval,
            "base": !isNaN(_.base) ? _.base : items.base, // Don't ever save non Number bases (e.g. Date Time) as the default
            "baseCase": _.baseCase,
            "baseDateFormat": _.baseDateFormat,
            "baseCustom": _.baseCustom,
            "errorSkip": _.errorSkip
          });
        }
        if (_.autoEnabled) {
          chrome.storage.sync.set({
            "autoAction": _.autoAction,
            "autoSeconds": _.autoSeconds,
            "autoTimes": _.autoTimes,
            "autoWait": _.autoWait,
            "autoBadge": _.autoBadge,
            "autoRepeat": _.autoRepeat
          });
        }
        if (_.downloadEnabled) {
          chrome.storage.sync.set({
            "downloadStrategy": _.downloadStrategy,
            "downloadExtensions": _.downloadExtensions,
            "downloadTags": _.downloadTags,
            "downloadAttributes": _.downloadAttributes,
            "downloadSelector": _.downloadSelector,
            "downloadIncludes": _.downloadIncludes,
            "downloadExcludes": _.downloadExcludes,
            "downloadMinMB": _.downloadMinMB,
            "downloadMaxMB": _.downloadMaxMB,
            "downloadPreview": _.downloadPreview
          });
        }
        // If internal shortcuts permissions granted, send message to shortcuts content script to add key/mouse listeners:
        if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addKeyListener"});
        }
        if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addMouseListener"});
        }
        // If auto is enabled, ask Auto to start auto timer
        if (instance.autoEnabled) {
          backgroundPage.Auto.startAutoTimer(instance, "popup");
        }
        toggleView.call(DOM["#accept-button"]);
      });
    }
  }

  function setupInputs(caller, tabs) {
    if (caller === "accept" || caller === "multi" || caller === "toolkit") {
      // Increment Decrement:
      _.saveURL = DOM["#save-url-input"].checked;
      _.url = DOM["#url-textarea"].value;
      _.startingURL = DOM["#url-textarea"].value;
      _.selection = DOM["#selection-input"].value;
      _.startingSelection = DOM["#selection-input"].value;
      _.selectionStart = +DOM["#selection-start-input"].value;
      _.startingSelectionStart = +DOM["#selection-start-input"].value;
      _.interval = +DOM["#interval-input"].value;
      _.base = isNaN(DOM["#base-select"].value) ? DOM["#base-select"].value : +DOM["#base-select"].value;
      _.baseCase = DOM["#base-case-uppercase-input"].checked ? DOM["#base-case-uppercase-input"].value : DOM["#base-case-lowercase-input"].checked;
      _.baseDateFormat = DOM["#base-date-format-input"].value;
      _.baseCustom = DOM["#base-custom-input"].value;
      //_.selectionParsed = isNaN(DOM["#base-select"].value) ? undefined : parseInt(_.selection, _.base).toString(_.base); // Not in instance? TODO check background buildInstance for this?
      _.leadingZeros = DOM["#leading-zeros-input"].checked;
      _.errorSkip = +DOM["#error-skip-input"].value;
      // Note: _.multi is set in clickMulti()
      _.multiCount = +DOM["#multi-count"].value;
      _.multiEnabled = _.multiCount >= 2 && _.multiCount <= 3;
      _.customURLs = DOM["#custom-urls-input"].checked;
      _.shuffleURLs = DOM["#shuffle-urls-input"].checked;
      _.urls = _.customURLs && DOM["#custom-urls-textarea"].value ? DOM["#custom-urls-textarea"].value.split(/[ ,\n]+/).filter(Boolean) : [];
    }
    if (caller === "accept" || "toolkit" && _.multiEnabled) {

    }
    if (caller === "multi") {
      const range = /{(.*)-(\d+)}/.exec(_.selection);
      if (range && range [1] && range[2]) {
        _.selection = range[1];
        _.selectionStart++;
        _.multiTimes = +range[2];
        _.multiRange = range;
      } else {
        _.multiTimes = _.multiRange = undefined;
      }
    }
    if (caller === "toolkit") {
      // Toolkit:
      // Note: _.toolkitEnabled = true is set in toolkit()
      _.tabsLength = tabs ? tabs.length : 0;
      _.toolkitTool = DOM["#toolkit-tool-crawl-input"].checked ? DOM["#toolkit-tool-crawl-input"].value : DOM["#toolkit-tool-links-input"].checked ? DOM["#toolkit-tool-links-input"].value :  DOM["#toolkit-tool-links-input"].checked ? DOM["#toolkit-tool-links-input"].value :  DOM["#toolkit-tool-tabs-input"].checked ? DOM["#toolkit-tool-tabs-input"].value : DOM["#toolkit-tool-links-input"].checked ? DOM["#toolkit-tool-links-input"].value : undefined;
      _.toolkitAction = DOM["#toolkit-action-increment-input"].checked ? DOM["#toolkit-action-increment-input"].value : DOM["#toolkit-action-decrement-input"].checked ? DOM["#toolkit-action-decrement-input"].value : undefined;
      _.toolkitQuantity = _.toolkitQuantityRemaining = +DOM["#toolkit-quantity-input"].value;
      _.toolkitSeconds = +DOM["#toolkit-seconds-input"].value
    }
    if (caller === "accept") {
      // Auto:
      _.autoEnabled = DOM["#auto-toggle-input"].checked;
      _.autoAction = DOM["#auto-action-select"].value;
      _.autoTimes = _.autoTimesOriginal = _.customURLs && _.urls && _.urls.length > 0 ? _.urls.length : +DOM["#auto-times-input"].value; // store the original autoTimes for reference as we are going to decrement autoTimes
      _.autoSeconds = +DOM["#auto-seconds-input"].value;
      _.autoWait = DOM["#auto-wait-input"].checked;
      _.autoBadge = DOM["#auto-badge-input"].checked ? "times" : "";
      _.autoRepeat = DOM["#auto-repeat-input"].checked;
      _.autoPaused = false;
    }
    if (caller === "accept") {
      // Download:
      // This if covers a rare case: In case the user tries accepting and the previously selected property is not currently in the checkbox values and they did not make any changes to the checkboxes to update the values, this ensures it updates to exactly what's currently checked in the checkboxes
      if (DOM["#download-toggle-input"].checked) {
        if (DOM["#download-strategy-select"].value === "extensions") { translateCheckboxValuesToHiddenInput("#download-extensions input", "#download-extensions-generated"); }
        if (DOM["#download-strategy-select"].value === "tags") {       translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated"); }
        if (DOM["#download-strategy-select"].value === "attributes") { translateCheckboxValuesToHiddenInput("#download-attributes input", "#download-attributes-generated"); }
      }
      _.downloadEnabled = DOM["#download-toggle-input"].checked;
      _.downloadStrategy = DOM["#download-strategy-select"].value;
      _.downloadExtensions = DOM["#download-extensions-generated"].value.split(",");
      _.downloadTags = DOM["#download-tags-generated"].value.split(",");
      _.downloadAttributes = DOM["#download-attributes-generated"].value.split(",");
      _.downloadSelector = DOM["#download-selector-input"].value;
      _.downloadIncludes = DOM["#download-includes-input"].value ? DOM["#download-includes-input"].value.replace(/\s+/g, "").split(",").filter(Boolean) : [];
      _.downloadExcludes = DOM["#download-excludes-input"].value ? DOM["#download-excludes-input"].value.replace(/\s+/g, "").split(",").filter(Boolean) : [];
      _.downloadMinMB = +DOM["#download-min-mb-input"].value;
      _.downloadMaxMB = +DOM["#download-max-mb-input"].value;
      _.downloadSubfolder = DOM["#download-subfolder-input"].value.trim();
      _.downloadPreview = DOM["#download-preview-checkboxes-generated"].value.split(",");
      _.downloadMSelecteds = downloadPreviewCache.mselecteds;
      _.downloadMUnselecteds = downloadPreviewCache.munselecteds;
    }
  }

  function setupErrors(caller) {
    const e = {};
    if (caller === "accept" || caller === "multi" || caller === "toolkit") {
      // Increment Decrement Errors
      e.incrementDecrementErrors = [
        // [0] = Selection Errors
        _.selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
        !_.url.includes(_.selection) ? chrome.i18n.getMessage("selection_notinurl_error") :
        _.selectionStart < 0 || _.url.substr(_.selectionStart, _.selection.length) !== _.selection ? chrome.i18n.getMessage("selectionstart_invalid_error") :
        backgroundPage.IncrementDecrement.validateSelection(_.selection, _.base, _.baseCase, _.baseDateFormat, _.baseCustom, _.leadingZeros),
        // [1] Interval Errors
        _.interval < 1 || _.interval >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("interval_invalid_error") : "",
        // [2] Error Skip Errors
        _.errorSkip > 0 && !items.permissionsEnhancedMode && caller !== "toolkit" ? chrome.i18n.getMessage("error_skip_permissions_error") :
        _.errorSkip < 0 || _.errorSkip > 100 ? chrome.i18n.getMessage("error_skip_invalid_error") : ""
      ];
      e.incrementDecrementErrorsExist = e.incrementDecrementErrors.some(error => error !== "");
      if (e.incrementDecrementErrorsExist) {
        e.incrementDecrementErrors.unshift(chrome.i18n.getMessage("oops_error"));
      }
    }
    if (caller === "toolkit") {
      // Toolkit Errors
      e.toolkitErrors = [
        !_.toolkitTool || !_.toolkitAction || isNaN(_.toolkitQuantity) || isNaN(_.toolkitSeconds) ? chrome.i18n.getMessage("toolkit_invalid_error") :
        _.toolkitTool === "tabs" && (_.toolkitQuantity < 1 || _.toolkitQuantity > 100) ? chrome.i18n.getMessage("toolkit_tabs_quantity_error") :
        _.toolkitTool === "tabs" && (_.tabsLength + _.toolkitQuantity > 101) ? chrome.i18n.getMessage("toolkit_tabs_too_many_open_error") :
        _.toolkitTool === "crawl" && !items.permissionsEnhancedMode ? chrome.i18n.getMessage("toolkit_crawl_permissions_error") :
        (_.toolkitTool === "crawl" || _.toolkitTool === "links") && (_.toolkitQuantity < 1 || _.toolkitQuantity > 10000) ? chrome.i18n.getMessage("toolkit_links_quantity_error") :
        _.toolkitTool === "crawl" && (_.toolkitSeconds < 1 || _.toolkitSeconds > 600) ? chrome.i18n.getMessage("toolkit_seconds_error") : ""
      ];
      e.toolkitErrorsExist = e.toolkitErrors.some(error => error !== "");
      if (e.toolkitErrorsExist) {
        e.toolkitErrors.unshift(chrome.i18n.getMessage("oops_error"));
      }
    }
    if (caller === "accept") {
      // Auto Errors
      e.autoErrors = [
        _.autoEnabled && (_.autoAction === "next" || _.autoAction === "prev") && !items.permissionsEnhancedMode ? chrome.i18n.getMessage("auto_next_prev_error") : "",
        _.autoEnabled && (_.autoTimes < 1 || _.autoTimes > 100000) ? chrome.i18n.getMessage("auto_times_invalid_error") : "",
        _.autoEnabled && (_.autoSeconds < 1 || _.autoSeconds > 3600) ? chrome.i18n.getMessage("auto_seconds_invalid_error") : "",
        _.autoEnabled && _.shuffleURLs && _.autoTimes > 10000 ? chrome.i18n.getMessage("auto_shuffle_times_error") : "",
        _.autoEnabled && _.downloadEnabled && _.autoSeconds < 5 ? chrome.i18n.getMessage("auto_download_seconds_error") : "",
        _.autoEnabled && _.downloadEnabled && _.autoRepeat ? chrome.i18n.getMessage("auto_download_repeat_error") : ""
      ];
      e.autoErrorsExist = e.autoErrors.some(error => error !== "");
      if (e.autoErrorsExist) {
        e.autoErrors.unshift(chrome.i18n.getMessage("oops_error"));
      }
    }
    if (caller === "accept") {
      // Download Errors
      e.downloadErrors = [
        _.downloadEnabled && !items.permissionsDownload ? chrome.i18n.getMessage("download_permissions_error") : "",
        _.downloadSubfolder && !/^[a-z0-9_\- \\.]+$/i.test(_.downloadSubfolder) ? chrome.i18n.getMessage("download_subfolder_error") : ""
      ];
      e.downloadErrorsExist = e.downloadErrors.some(error => error !== "");
      if (e.downloadErrorsExist) {
        e.downloadErrors.unshift(chrome.i18n.getMessage("oops_error"));
      }
    }
    return e;
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (Background)
   *
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tabId
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @private
   */
  function messageListener(request, sender, sendResponse) {
    console.log("messageListener() - request.greeting=" + request.greeting);
    if (request.instance && request.instance.tabId === instance.tabId) {
      if (request.greeting === "updatePopupInstance") {
        instance = request.instance;
        updateControls();
        updateSetup();
      } else if (request.greeting === "updatePopupDownloadPreview") {
        updateDownloadPreviewCompletely();
      } else if (request.greeting === "crawlPopupNoWindow") {
        instance = request.instance;
        crawlWindow();
      }
    }
  }

  chrome.runtime.onMessage.addListener(messageListener); // Popup Listener
  init(); // This script is set to defer so the DOM is guaranteed to be parsed by this point
})();