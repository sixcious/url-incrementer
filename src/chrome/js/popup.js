/**
 * URL Incrementer
 * @file popup.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Popup = (() => {

  // The DOM elements cache
  const DOM = {};

  // The _ temporary instance and real instance caches, storage caches, backgroundPage and downloadPreview cache, and timeouts object
  let _ = {},
      instance = {},
      items = {},
      backgroundPage = {},
      downloadPreviewCache = {},
      timeouts = {};

  /**
   * Initializes the Popup window. This script is set to defer so the DOM is guaranteed to be parsed by this point.
   *
   * @private
   */
  async function init() {
    const ids = document.querySelectorAll("[id]"),
          i18ns = document.querySelectorAll("[data-i18n]");
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
    DOM["#list-input"].addEventListener("change", function() {
      DOM["#increment-decrement-heading"].className = this.checked ? "display-none" : "display-block";
      DOM["#list-heading"].className = this.checked ? "display-block" : "display-none";
      DOM["#url-label"].textContent = chrome.i18n.getMessage((this.checked ? "list_" : "url_") + "label");
      DOM["#selection"].className = DOM["#interval"].className = DOM["#base"].className = this.checked ? "display-none" : "column";
      DOM["#list-instructions"].className = this.checked ? "column" : "display-none";
      chrome.storage.local.set({ "listStart": this.checked });
    });
    DOM["#auto-repeat-input"].addEventListener("change", function() { chrome.storage.local.set({ "autoRepeatStart": this.checked }); });
    DOM["#shuffle-urls-input"].addEventListener("change", function() { chrome.storage.local.set({ "shuffleStart": this.checked }); });
    DOM["#save-url-input"].addEventListener("change", function() { DOM["#save-url-img"].src = "../img/" + (this.checked ? "heart.png" : "heart-o.png"); });
    DOM["#toolkit-input"].addEventListener("change", function() { DOM["#toolkit"].className = this.checked ? "display-block fade-in" : "display-none"; chrome.storage.local.set({ "toolkitStart": this.checked }); });
    DOM["#options-button"].addEventListener("click", function() { chrome.runtime.openOptionsPage(); });
    DOM["#url-textarea"].addEventListener("select", selectURL);
    DOM["#base-select"].addEventListener("change", function() {
      DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none";
      DOM["#base-date"].className = this.value === "date" ? "display-block fade-in" : "display-none";
      DOM["#base-decimal"].className = this.value === "decimal" ? "display-block fade-in" : "display-none";
      DOM["#base-roman"].className = this.value === "roman" ? "display-block fade-in" : "display-none";
      DOM["#base-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none";
    });
    DOM["#toolkit-tool"].addEventListener("change", function(event) { changeToolkitTool.call(event.target); });
    DOM["#toolkit-scrape-input"].addEventListener("change", function() { DOM["#scrape"].className = this.checked ? "display-block fade-in" : "display-none"; });
    DOM["#toolkit-tool-tabs-input"].addEventListener("change", changeToolkitTool);
    DOM["#toolkit-tool-links-input"].addEventListener("change", changeToolkitTool);
    DOM["#toolkit-urli-button-img"].addEventListener("click", toolkit);
    DOM["#toolkit-table-download-button"].addEventListener("click", toolkitTableDownload);
    DOM["#crawl-table-download-button"].addEventListener("click", toolkitTableDownload);
    DOM["#crawl-checkboxes"].addEventListener("change", updateCrawlTable);
    DOM["#crawl-urli-img"].addEventListener("click", function() {
      const faces = ["≧☉_☉≦", "(⌐■_■)♪", "(︶︹︺)", "◉_◉", "(+__X)"],
        face = " " + faces[Math.floor(Math.random() * faces.length)],
        value = +this.dataset.value + 1;
      this.dataset.value = value + "";
      UI.clickHoverCss(this, "hvr-buzz-out-click");
      UI.generateAlert([value <= 10 ? value + " ..." : chrome.i18n.getMessage("tickles_click") + face]);
    });
    DOM["#auto-toggle-input"].addEventListener("change", function() { DOM["#auto"].className = this.checked ? "display-block fade-in" : "display-none"; chrome.storage.local.set({ "autoStart": this.checked }); });
    DOM["#auto-times-input"].addEventListener("change", updateAutoETA);
    DOM["#auto-seconds-input"].addEventListener("change", updateAutoETA);
    DOM["#download-toggle-input"].addEventListener("change", function() { DOM["#download"].className = this.checked ? "display-block fade-in" : "display-none"; if (this.checked) { updateDownloadPreviewCompletely(); } chrome.storage.local.set({ "downloadStart": this.checked }); });
    DOM["#download-strategy-select"].addEventListener("change", function() { changeDownloadStrategy.call(this); updateDownloadPreview(); });
    DOM["#download-extensions"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-extensions input", "#download-extensions-generated"); updateDownloadPreview(); });
    DOM["#download-tags"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated"); updateDownloadPreview(); });
    DOM["#download-attributes"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-attributes input", "#download-attributes-generated"); updateDownloadPreview(); });
    DOM["#download-selector-input"].addEventListener("input", function() { inputUpdateDownloadPreview(this, DOM["#download-selector-label"], "font-weight: bold; color: rebeccapurple"); });
    DOM["#download-includes-input"].addEventListener("input", function() { inputUpdateDownloadPreview(this, DOM["#download-includes-label"], "font-weight: bold; color: #05854D"); });
    DOM["#download-excludes-input"].addEventListener("input", function() { inputUpdateDownloadPreview(this, DOM["#download-excludes-label"], "font-weight: bold; color: #E6003E"); });
    DOM["#download-preview-checkboxes"].addEventListener("change", function(event) { updateDownloadPreviewCheckboxes.call(event.target); });
    DOM["#download-preview-table-div"].addEventListener("click", updateDownloadSelectedsUnselecteds);
    // Initialize popup content (1-time only)
    const tabs = await Promisify.getTabs();
    items = await Promisify.getItems();
    backgroundPage = await Promisify.getBackgroundPage();
    // Firefox: Background Page is null in Private Window
    if (!backgroundPage) {
      DOM["#messages"].className = DOM["#private-window-unsupported"].className = "display-block";
      return;
    }
    instance = backgroundPage.Background.getInstance(tabs[0].id) || await backgroundPage.Background.buildInstance(tabs[0], items);
    _ = JSON.parse(JSON.stringify(instance));
    const buttons = document.querySelectorAll("#controls input");
    for (const button of buttons) {
      button.className = items.popupAnimationsEnabled ? "hvr-grow": "";
      button.style.width = button.style.height = items.popupButtonSize + "px";
      button.addEventListener("click", clickActionButton);
    }

    DOM["#crawl-url-input"].checked = items.toolkitCrawlCheckboxes.includes("url");
    DOM["#crawl-response-input"].checked = items.toolkitCrawlCheckboxes.includes("response");
    DOM["#crawl-code-input"].checked = items.toolkitCrawlCheckboxes.includes("code");
    DOM["#crawl-details-input"].checked = items.toolkitCrawlCheckboxes.includes("details");
    DOM["#crawl-scrape-input"].checked = items.toolkitCrawlCheckboxes.includes("scrape");
    DOM["#crawl-full-input"].checked = items.toolkitCrawlCheckboxes.includes("full");
    DOM["#crawl-info-input"].checked = items.toolkitCrawlCheckboxes.includes("info");
    DOM["#crawl-ok-input"].checked = items.toolkitCrawlCheckboxes.includes("ok");
    DOM["#crawl-error-input"].checked = items.toolkitCrawlCheckboxes.includes("error");
    DOM["#crawl-redirected-input"].checked = items.toolkitCrawlCheckboxes.includes("redirected");
    DOM["#crawl-other-input"].checked = items.toolkitCrawlCheckboxes.includes("other");
    DOM["#crawl-exception-input"].checked = items.toolkitCrawlCheckboxes.includes("exception");

    // Download icon (cloud-download.png) is an irregular shape and needs adjustment
    DOM["#download-input"].style.width = DOM["#download-input"].style.height = (items.popupButtonSize + (items.popupButtonSize <= 24 ? 4 : items.popupButtonSize <= 44 ? 6 : 8)) + "px";
    updateSetup();
    // 3 Popup Views: Crawl Window if instance is toolkit crawl, Setup if instance not enabled/saved URL, or Controls if instance enabled/saved URL
    if (instance.toolkitEnabled && instance.toolkitTool === "crawl") {
      crawlWindow();
    } else if ((!instance.enabled && !instance.saveFound)) {
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
      // Hide controls, show setup
      case "setup-input":
        DOM["#controls"].className = "display-none";
        DOM["#setup"].className = "display-block fade-in";
        updateSetup(true);
        break;
      // Hide setup, show controls
      case "accept-button":
      case "cancel-button":
        // Needed to reset hover.css click effect
        updateControls();
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
        ((action === "increment1" || action === "decrement1" || action === "increment2" || action === "decrement2" || action === "increment3" || action === "decrement3") && instance.multiEnabled && !instance.multiRangeEnabled) ||
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
    DOM["#save-url-icon"].title = chrome.i18n.getMessage(instance.saveType === "wildcard" ? "save_wildcard_icon" : instance.saveType === "regexp" ? "save_regexp_icon" : "save_url_icon");
    DOM["#save-url-icon"].style.display = instance.saveFound ? "" : "none";
    DOM["#auto-repeat-icon"].style.display = instance.autoEnabled && instance.autoRepeat ? "" : "none";
    DOM["#shuffle-urls-icon"].style.display = instance.enabled && instance.shuffleURLs ? "" : "none";
    DOM["#list-icon"].style.display = instance.listEnabled ? "" : "none";
    DOM["#increment-input"].style.display =
    DOM["#decrement-input"].style.display = instance.multiEnabled || (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? "none" : "";
    DOM["#increment-input-r"].style.display =
    DOM["#decrement-input-r"].style.display =
    DOM["#increment-span-r"].style.display =
    DOM["#decrement-span-r"].style.display = instance.multiEnabled && instance.multiRangeEnabled && !(instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? "" : "none";
    DOM["#increment-input-s"].style.display =
    DOM["#decrement-input-s"].style.display =
    DOM["#increment-span-s"].style.display =
    DOM["#decrement-span-s"].style.display = instance.multiEnabled && !instance.multiRangeEnabled && !(instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? "" : "none";
    DOM["#increment-input-1"].style.display =
    DOM["#decrement-input-1"].style.display =
    DOM["#increment-span-1"].style.display =
    DOM["#decrement-span-1"].style.display = instance.multiEnabled && !instance.multiRangeEnabled && !instance.autoEnabled && !instance.shuffleURLs && instance.multiCount >= 1 ? "" : "none";
    DOM["#increment-input-2"].style.display =
    DOM["#decrement-input-2"].style.display =
    DOM["#increment-span-2"].style.display =
    DOM["#decrement-span-2"].style.display = instance.multiEnabled && !instance.multiRangeEnabled && !instance.autoEnabled && !instance.shuffleURLs && instance.multiCount >= 2 ? "" : "none";
    DOM["#increment-input-3"].style.display =
    DOM["#decrement-input-3"].style.display =
    DOM["#increment-span-3"].style.display =
    DOM["#decrement-span-3"].style.display = instance.multiEnabled && !instance.multiRangeEnabled && !instance.autoEnabled && !instance.shuffleURLs && instance.multiCount === 3 ? "" : "none";
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
    DOM["#list-input"].checked = instance.listEnabled || (instance.listStart && !instance.enabled);
    DOM["#increment-decrement-heading"].className =  DOM["#list-input"].checked ? "display-none" : "display-block";
    DOM["#list-heading"].className = DOM["#list-input"].checked ? "display-block" : "display-none";
    DOM["#url-label"].textContent = chrome.i18n.getMessage((DOM["#list-input"].checked ? "list_" : "url_") + "label");
    DOM["#selection"].className = DOM["#interval"].className = DOM["#base"].className = DOM["#list-input"].checked ? "display-none" : "column";
    DOM["#list-instructions"].className = DOM["#list-input"].checked ? "column" : "display-none";
    if (instance.saveFound || items.savePreselect) {
      DOM["#save-url-input"].checked = true;
      DOM["#save-url-img"].src = DOM["#save-url-img"].src.replace("-o", "");
    }
    DOM["#url-textarea"].value = instance.listEnabled ? instance.list : instance.url;
    if (!DOM["#list-input"].checked) {
      DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + (instance.selection ? instance.selection.length : 0));
      DOM["#url-textarea"].focus();
    }
    DOM["#selection-input"].value = instance.selection;
    DOM["#selection-start-input"].value = instance.selectionStart;
    // If minimal (e.g. just switching from controls to setup), no need to recalculate the below again, so just return
    if (minimal) {
      return;
    }
    DOM["#shuffle-urls-input"].checked = instance.shuffleURLs || (instance.shuffleStart && !instance.enabled);
    DOM["#auto-repeat-input"].checked = instance.autoRepeat || (instance.autoRepeatStart && !instance.enabled);
    DOM["#interval-input"].value = instance.interval;
    DOM["#error-skip-input"].value = instance.errorSkip;
    DOM["#base-select"].value = instance.base;
    DOM["#base-case"].className = instance.base > 10 ? "display-block" : "display-none";
    DOM["#base-case-lowercase-input"].checked = instance.baseCase === "lowercase";
    DOM["#base-case-uppercase-input"].checked = instance.baseCase === "uppercase";
    DOM["#base-date"].className = instance.base === "date" ? "display-block" : "display-none";
    DOM["#base-date-format-input"].value = instance.baseDateFormat;
    DOM["#base-decimal"].className = instance.base === "decimal" ? "display-block" : "display-none";
    DOM["#base-roman"].className = instance.base === "roman" ? "display-block" : "display-none";
    DOM["#base-roman-latin-input"].checked = instance.baseRoman === "latin";
    DOM["#base-roman-u216x-input"].checked = instance.baseRoman === "u216x";
    DOM["#base-roman-u217x-input"].checked = instance.baseRoman === "u217x";
    DOM["#base-custom"].className = instance.base === "custom" ? "display-block" : "display-none";
    DOM["#base-custom-input"].value = instance.baseCustom;
    DOM["#leading-zeros-input"].checked = instance.leadingZeros;
    DOM["#multi-count"].value = instance.multiEnabled ? instance.multiCount : 0;
    DOM["#multi-img-1"].className = instance.multiEnabled && instance.multiCount >= 1 ? "" : "disabled";
    DOM["#multi-img-2"].className = instance.multiEnabled && instance.multiCount >= 2 ? "" : "disabled";
    DOM["#multi-img-3"].className = instance.multiEnabled && instance.multiCount >= 3 ? "" : "disabled";
    DOM["#list-input"].checked = instance.listEnabled;
    DOM["#url-label"].textContent = chrome.i18n.getMessage((instance.listEnabled ? "list_" : "url_") + "label");
    // Toolkit Setup:
    DOM["#toolkit-input"].checked = instance.toolkitStart && !instance.enabled;
    DOM["#toolkit"].className = instance.toolkitStart && !instance.enabled ? "display-block" : "display-none";
    DOM["#toolkit-tool-crawl-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-crawl-input"].value;
    DOM["#toolkit-tool-tabs-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-tabs-input"].value;
    DOM["#toolkit-tool-links-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-links-input"].value;
    DOM["#toolkit-action-increment-input"].checked = instance.toolkitAction === DOM["#toolkit-action-increment-input"].value;
    DOM["#toolkit-action-decrement-input"].checked = instance.toolkitAction === DOM["#toolkit-action-decrement-input"].value;
    DOM["#toolkit-quantity-input"].value = instance.toolkitQuantity;
    DOM["#toolkit-seconds-input"].value = instance.toolkitSeconds;
    DOM["#toolkit-seconds"].style.visibility = DOM["#toolkit-tool-links-input"].checked ? "hidden" : "";
    DOM["#toolkit-scrape"].style.display = DOM["#toolkit-tool-crawl-input"].checked ? "block" : "none";
    DOM["#toolkit-scrape-input"].checked = instance.toolkitScrape;
    DOM["#scrape"].className = DOM["#toolkit-tool-crawl-input"].checked && DOM["#toolkit-scrape-input"].checked ? "display-block fade-in" : "display-none";
    DOM["#scrape-method-select"].value = instance.scrapeMethod;
    DOM["#scrape-selector-input"].value = instance.scrapeSelector;
    DOM["#scrape-property-input"].value = instance.scrapeProperty ? instance.scrapeProperty.join(".") : "";
    // Auto Setup:
    DOM["#auto-toggle-input"].checked = instance.autoEnabled || (instance.autoStart && !instance.enabled);
    DOM["#auto"].className = instance.autoEnabled || (instance.autoStart && !instance.enabled) ? "display-block" : "display-none";
    DOM["#auto-action-select"].value = instance.autoAction;
    DOM["#auto-times-input"].value = instance.autoTimes;
    DOM["#auto-seconds-input"].value = instance.autoSeconds;
    DOM["#auto-wait-input"].checked = instance.autoWait;
    DOM["#auto-badge-input"].checked = instance.autoBadge === "times";
    updateAutoETA();
    // Download Setup:
    DOM["#download-toggle"].style = items.permissionsDownload ? "" : "display: none;";
    DOM["#download-toggle-input"].checked = instance.downloadEnabled || (instance.downloadStart && !instance.enabled && items.permissionsDownload);
    DOM["#download"].className = instance.downloadEnabled || (instance.downloadStart && !instance.enabled && items.permissionsDownload) ? "display-block" : "display-none";
    DOM["#download-strategy-select"].value = instance.downloadStrategy;
    DOM["#download-extensions-generated"].value = instance.downloadExtensions && Array.isArray(instance.downloadExtensions) ? instance.downloadExtensions.join(",") : "";
    DOM["#download-tags-generated"].value = instance.downloadTags && Array.isArray(instance.downloadTags) ? instance.downloadTags.join(",") : "";
    DOM["#download-attributes-generated"].value = instance.downloadAttributes && Array.isArray(instance.downloadAttributes) ? instance.downloadAttributes.join(",") : "";
    DOM["#download-selector-input"].value = instance.downloadSelector;
    DOM["#download-includes-input"].value = instance.downloadIncludes && Array.isArray(instance.downloadIncludes) ? instance.downloadIncludes.join(",") : "";
    DOM["#download-excludes-input"].value = instance.downloadExcludes && Array.isArray(instance.downloadExcludes) ? instance.downloadExcludes.join(",") : "";
    DOM["#download-subfolder-input"].value = instance.downloadSubfolder && instance.downloadSubfolder.trim() ? instance.downloadSubfolder : "";
    DOM["#download-subfolder-increment-input"].checked = instance.downloadSubfolderIncrement;
    DOM["#download-preview-count-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("count");
    DOM["#download-preview-thumb-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("thumb");
    DOM["#download-preview-filename-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("filename");
    DOM["#download-preview-extension-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("extension");
    DOM["#download-preview-tag-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("tag");
    DOM["#download-preview-attribute-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("attribute");
    DOM["#download-preview-url-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("url");
    DOM["#download-preview-compressed-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("compressed");
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
    // Firefox: window.getSelection().toString(); does not work in FF
    DOM["#selection-input"].value = DOM["#url-textarea"].value.substring(DOM["#url-textarea"].selectionStart, DOM["#url-textarea"].selectionEnd);
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
      // If multiRange, selectionStart is -1 from starting [
      _.multi[multiCountNew].selectionStart = _.multiRange ? _.selectionStart - 1 : _.selectionStart;
      _.multi[multiCountNew].startingSelectionStart = _.multi[multiCountNew].selectionStart;
      _.multi[multiCountNew].interval = _.interval;
      _.multi[multiCountNew].base = _.base;
      _.multi[multiCountNew].baseCase = _.baseCase;
      _.multi[multiCountNew].baseDateFormat = _.baseDateFormat;
      _.multi[multiCountNew].baseRoman = _.baseRoman;
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
      const id = crawl ? "crawl-table" : "toolkit-table";
      // Table must have similar inline styling from popup.css for the download blob's HTML file:
      const table = document.createElement("table");
      table.id = id;
      // max-width: none always set. The full checkbox only sets max-height: none
      table.style = "font-family: \"Segoe UI\", Tahoma, sans-serif; font-size: 12px; border-collapse: collapse; border-radius: 0; max-width: none;" + (crawl && items.toolkitCrawlCheckboxes.includes("full") ? " max-height: none;" : "");
      // thead
      const thead = document.createElement("thead");
      thead.style = "background: #f8f8f8; color: #0a0a0a;";
      table.appendChild(thead);
      const tr = document.createElement("tr");
      tr.style = "background: transparent;";
      thead.appendChild(tr);
      const th = document.createElement("th");
      th.className = "crawl-table-url";
      th.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem;" + (!crawl || items.toolkitCrawlCheckboxes.includes("url") ? "" : " display: none;");
      th.textContent = chrome.i18n.getMessage("url_label");
      tr.appendChild(th);
      if (crawl) {
        const th1 = document.createElement("th");
        th1.className = "crawl-table-response";
        th1.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem; min-width: 64px;" + (items.toolkitCrawlCheckboxes.includes("response") ? "" : " display: none;");
        th1.textContent = chrome.i18n.getMessage("crawl_response_label");
        tr.appendChild(th1);
        const th2 = document.createElement("th");
        th2.className = "crawl-table-code";
        th2.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem; min-width: 64px;" + (items.toolkitCrawlCheckboxes.includes("code") ? "" : " display: none;");
        th2.textContent = chrome.i18n.getMessage("crawl_code_label");
        tr.appendChild(th2);
        const th3 = document.createElement("th");
        th3.className = "crawl-table-details";
        th3.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem; min-width: 64px;" + (items.toolkitCrawlCheckboxes.includes("details") ? "" : " display: none;");
        th3.textContent = chrome.i18n.getMessage("crawl_details_label");
        tr.appendChild(th3);
        const th4 = document.createElement("th");
        th4.className = "crawl-table-scrape";
        th4.style = "font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem; min-width: 64px;" + (items.toolkitCrawlCheckboxes.includes("scrape") ? "" : " display: none;");
        th4.textContent = chrome.i18n.getMessage("crawl_scrape_label") + (instance && instance.toolkitScrape ? (" - " + (instance.scrapeMethod === "selector-all" ? "document.querySelectorAll" : "document.querySelector") + "(\"" + instance.scrapeSelector + "\")." + instance.scrapeProperty) : "");
        tr.appendChild(th4);
      }
      // tbody
      const tbody = document.createElement("tbody");
      tbody.style = "border: 1px solid #f1f1f1; background-color: #fefefe;";
      table.appendChild(tbody);
      let count = 1;
      for (const url of urls) {
        const tr = document.createElement("tr");
        tr.id = id + "-tr-" + (count - 1);
        tr.className = "response-tbd";
        tr.style = (++count % 2) !== 0 ? "border-bottom: 0; background-color: #f1f1f1;" : "";
        tbody.appendChild(tr);
        const td = document.createElement("td");
        td.className = "crawl-table-url";
        td.style = "padding: 0.25rem 0.312rem 0.312rem;" + (!crawl || items.toolkitCrawlCheckboxes.includes("url") ? "" : " display: none;");
        tr.appendChild(td);
        const a = document.createElement("a");
        a.href = url.urlmod;
        a.target = "_blank";
        a.textContent = url.urlmod;
        td.appendChild(a);
        if (crawl) {
          const td1 = document.createElement("td");
          td1.id = id + "-td-response-" + (count - 2);
          td1.className = "crawl-table-response";
          td1.style = "padding: 0.25rem 0.312rem 0.312rem; font-weight: bold;" + (items.toolkitCrawlCheckboxes.includes("response") ? "" : " display: none;");
          tr.appendChild(td1);
          const td2 = document.createElement("td");
          td2.id = id + "-td-code-" + (count - 2);
          td2.className = "crawl-table-code";
          td2.style = "padding: 0.25rem 0.312rem 0.312rem; font-weight: bold;" + (items.toolkitCrawlCheckboxes.includes("code") ? "" : " display: none;");
          tr.appendChild(td2);
          const td3 = document.createElement("td");
          td3.id = id + "-td-details-" + (count - 2);
          td3.className = "crawl-table-details";
          td3.style = "padding: 0.25rem 0.312rem 0.312rem; font-weight: bold;" + (items.toolkitCrawlCheckboxes.includes("details") ? "" : " display: none;");
          tr.appendChild(td3);
          const td4 = document.createElement("td");
          td4.id = id + "-td-scrape-" + (count - 2);
          td4.className = "crawl-table-scrape";
          td4.style = "padding: 0.25rem 0.312rem 0.312rem; font-weight: bold;" + (items.toolkitCrawlCheckboxes.includes("scrape") ? "" : " display: none;");
          tr.appendChild(td4);
        }
      }
      DOM["#" + id] = table;
      DOM["#" + id + "-div"].replaceChild(table, DOM["#" + id + "-div"].firstChild);
      DOM["#" + id + "-outer"].className = "display-block fade-in";
    }
  }

  /**
   * Called when the toolkit input (URLI) is clicked, finalizing the toolkitInstance. This is similar to setup().
   *
   * @private
   */
  async function toolkit() {
    UI.clickHoverCss(this, "hvr-push-click");
    const tabs = await Promisify.getTabs({currentWindow: true});
    setupInputs("toolkit", tabs);
    const e = setupErrors("toolkit");
    if (e.toolkitErrorsExist) {
      UI.generateAlert(e.toolkitErrors);
    } else if (e.incrementDecrementErrorsExist) {
      UI.generateAlert(e.incrementDecrementErrors);
    } else {
      const toolkitInstance = JSON.parse(JSON.stringify(_));
      toolkitInstance.toolkitEnabled = true;
      // Reset the urls array in case instance had previously been enabled while in the Popup
      toolkitInstance.urls = [];
      const precalculateProps = backgroundPage.IncrementDecrementArray.precalculateURLs(toolkitInstance);
      toolkitInstance.urls = precalculateProps.urls;
      toolkitInstance.urlsCurrentIndex = precalculateProps.currentIndex;
      if (toolkitInstance.toolkitTool === "crawl" && toolkitInstance.toolkitScrape) {
        toolkitInstance.fetchMethod = "GET";
      }
      if (toolkitInstance.toolkitTool === "links") {
        buildToolkitURLsTable(toolkitInstance.urls, false);
      }
      backgroundPage.Action.performAction("toolkit", "popup", toolkitInstance, items);
      // Note: After performing the action, the background sends a message back to popup with the results (if necessary)
      chrome.storage.local.set({
        "toolkitTool": _.toolkitTool,
        "toolkitAction": _.toolkitAction,
        "toolkitQuantity": _.toolkitQuantity,
        "toolkitSeconds": _.toolkitSeconds,
        "toolkitScrape": _.toolkitScrape,
        "scrapeMethod": _.scrapeMethod,
        "scrapeSelector": _.scrapeSelector,
        "scrapeProperty": _.scrapeProperty
      });
    }
  }

  /**
   * Called when the toolkit tool radios are changed. Seconds and Scrape inputs are only displayed when the relevant
   * tool is selected.
   *
   * @private
   */
  function changeToolkitTool() {
    DOM["#toolkit-seconds"].style.visibility = DOM["#toolkit-tool-links-input"].checked ? "hidden" : "";
    DOM["#toolkit-scrape"].style.display = DOM["#toolkit-tool-crawl-input"].checked ? "block" : "none";
    DOM["#scrape"].className = DOM["#toolkit-tool-crawl-input"].checked && DOM["#toolkit-scrape-input"].checked ? "display-block" : "display-none";
  }

  /**
   * Called when the toolkit table download button is clicked.
   *
   * Creates a hidden anchor and blob of the table HTML. It then simulates a mouse click event to download the blob,
   * and then revokes it to release it from memory. Note that we need the anchor because the actual element that calls
   * this is a button (anchors are the only elements that can have the download attribute).
   *
   * @private
   */
  function toolkitTableDownload() {
    const a = document.createElement("a"),
          blob = URL.createObjectURL(new Blob([DOM["#" + this.id.replace("-download-button", "")].outerHTML], {"type": "text/html"}));
    a.href = blob;
    a.download = this.title.replace(".html", "");
    a.dispatchEvent(new MouseEvent("click"));
    setTimeout(function() { URL.revokeObjectURL(blob); }, 1000);
  }

  /**
   * Updates the crawl table each time a crawl checkbox is checked or unchecked.
   *
   * @param event the event from which the target element fired from
   * @private
   */
  function updateCrawlTable(event) {
    const checkbox = event.target;
    if (checkbox.id === "crawl-full-input") {
      DOM["#crawl-table"].style.maxHeight = checkbox.checked ? "none" : "";
    } else {
      const style = checkbox.checked ? checkbox.dataset.type : "none";
      document.querySelectorAll("." + checkbox.dataset.selector).forEach(el => el.style.display = style);
    }
    chrome.storage.local.set({"toolkitCrawlCheckboxes":
      [DOM["#crawl-url-input"].checked ? DOM["#crawl-url-input"].value : "",
       DOM["#crawl-response-input"].checked ? DOM["#crawl-response-input"].value : "",
       DOM["#crawl-code-input"].checked ? DOM["#crawl-code-input"].value : "",
       DOM["#crawl-details-input"].checked ? DOM["#crawl-details-input"].value : "",
       DOM["#crawl-scrape-input"].checked ? DOM["#crawl-scrape-input"].value : "",
       DOM["#crawl-full-input"].checked ? DOM["#crawl-full-input"].value : "",
       DOM["#crawl-info-input"].checked ? DOM["#crawl-info-input"].value : "",
       DOM["#crawl-ok-input"].checked ? DOM["#crawl-ok-input"].value : "",
       DOM["#crawl-error-input"].checked ? DOM["#crawl-error-input"].value : "",
       DOM["#crawl-redirected-input"].checked ? DOM["#crawl-redirected-input"].value : "",
       DOM["#crawl-other-input"].checked ? DOM["#crawl-other-input"].value : "",
       DOM["#crawl-exception-input"].checked ? DOM["#crawl-exception-input"].value : ""].filter(Boolean)
    });
  }

  /**
   * Initializes the crawl window in the Popup. This is usually called in a new Popup window, but may be called in the
   * same Popup (in Firefox for Android).
   *
   * @private
   */
  function crawlWindow() {
    console.log("crawlWindow() - starting to crawl " + instance.urls.length + " URLs");
    // In case urls array is shorter than quantity, e.g. decrement reaching 0
    instance.toolkitQuantity = instance.toolkitQuantityRemaining = instance.urls.length;
    DOM["#crawl"].className = "display-block";
    DOM["#crawl-urls-remaining"].textContent = 0;
    DOM["#crawl-urls-total"].textContent = instance.toolkitQuantity;
    updateETA(instance.toolkitQuantity * (instance.toolkitSeconds + 1), DOM["#crawl-eta-value"], true);
    buildToolkitURLsTable(instance.urls, true);
    crawlURLs();
    backgroundPage.Background.deleteInstance(instance.tabId);
  }

  /**
   * Crawls URLs recursively by fetching for response codes.
   *
   * Note: Typically, the maximum number of concurrent (parallel) HTTP 1.1 connections per host in Chrome and Firefox
   * is 6. Crawling asynchronously can be used to take advantage of this, but may be unstable, and more importantly,
   * may also overload the server. This is why this function chooses to run each request one at a time (synchronously),
   * doing the crawlURLs() recursion only after the fetch promise has resolved in the finally block.
   *
   * @private
   */
  function crawlURLs() {
    if (instance.toolkitQuantityRemaining <= 0) {
      console.log("crawlURLs() - exhausted the quantityRemaining");
      return;
    }
    const id = instance.toolkitQuantity - instance.toolkitQuantityRemaining,
          tr = document.getElementById("crawl-table-tr-" + id),
          td1 = document.getElementById("crawl-table-td-response-" + id),
          td2 = document.getElementById("crawl-table-td-code-" + id),
          td3 = document.getElementById("crawl-table-td-details-" + id),
          td4 = document.getElementById("crawl-table-td-scrape-" + id);
    let res,
        status,
        details,
        scrapes = [],
        redirected,
        url;
    td1.textContent = chrome.i18n.getMessage("crawl_fetching_label");
    // fetch using credentials: same-origin to keep session/cookie state alive (to avoid redirect false flags e.g. after a user logs in to a website)
    fetch(instance.urls[id].urlmod, { method: instance.fetchMethod, credentials: "same-origin" }).then(async response => {
      status = response.status;
      redirected = response.redirected;
      res = redirected ? "redirected" : response.ok ? "ok" : status >= 100 && status <= 199 ? "info" : status >= 400 && status <= 599 ? "error" : "other";
      details = response.statusText;
      url = response.url;
      if (instance.toolkitScrape) {
        try {
          const text = await response.text();
          const document_ = new DOMParser().parseFromString(text, "text/html");
          if (instance.scrapeMethod === "selector") {
            const elements = document_.querySelector(instance.scrapeSelector);
            scrapes[0] = elements[instance.scrapeProperty[0]];
            for (let j = 1; j < instance.scrapeProperty.length; j++) {
              scrapes[0] = scrapes[0][instance.scrapeProperty[j]];
            }
          } else if (instance.scrapeMethod === "selector-all") {
            const elements = document_.querySelectorAll(instance.scrapeSelector);
            // Literally use document.querySelectorAll() on the nodeList (not the individual elements)
            if (instance.scrapeProperty[0] === "length") {
              scrapes[0] = elements[instance.scrapeProperty[0]];
            }
            // Iterate thru each element returned from the query and then iterate thru each property to scrape the data
            else {
              for (let i = 0; i < elements.length; i++) {
                scrapes[i] = elements[i][instance.scrapeProperty[0]];
                for (let j = 1; j < instance.scrapeProperty.length; j++) {
                  scrapes[i] = scrapes[i][instance.scrapeProperty[j]];
                }
              }
            }
          }
        } catch(e) {
          scrapes[0] = e;
        }
      }
    }).catch(e => {
      status = e && e.name ? e.name : "";
      res = "exception";
      details = e && e.message ? e.message : e;
    }).finally(() => {
      // If the server disallows HEAD requests, switch to GET and retry this request using the same quantityRemaining
      if (status === 405 && instance.fetchMethod === "HEAD") {
        console.log("crawlURLs() - switching fetch method from HEAD to GET and retrying because server disallows HEAD (status 405)");
        instance.fetchMethod = "GET";
        crawlURLs();
      } else {
        tr.className = "crawl-table-" + res;
        tr.style.display = DOM["#crawl-" + res + "-input"] && !DOM["#crawl-" + res + "-input"].checked ? "none" : "";
        td1.style.color = td2.style.color = td3.style.color = td4.style.color = res === "exception" ? "#FF69B4" : res === "redirected" ? "#663399" : res === "ok" ? "#05854D" : res === "info" ? "#999999" : res === "error" ? "#E6003E" : "#1779BA";
        td1.textContent = chrome.i18n.getMessage("crawl_" + res + "_label");
        td2.textContent = status;
        if (redirected) {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.textContent = url;
          a.title = details;
          td3.appendChild(a);
        } else {
          td3.textContent = details;
        }
        if (instance.toolkitScrape && scrapes && scrapes.length > 0) {
          for (let scrape of scrapes) {
            td4.appendChild(document.createTextNode(scrape));
            td4.appendChild(document.createElement("br"));
          }
        }
        instance.toolkitQuantityRemaining--;
        setTimeout(function() { crawlURLs(); }, instance.toolkitSeconds * 1000);
        DOM["#crawl-urls-remaining"].textContent = instance.toolkitQuantity - instance.toolkitQuantityRemaining;
        DOM["#crawl-progress-percentage"].textContent =
        DOM["#crawl-progress-filled"].style.width = Math.floor(((instance.toolkitQuantity - instance.toolkitQuantityRemaining) / instance.toolkitQuantity) * 100) + "%";
        updateETA((instance.toolkitQuantityRemaining) * (instance.toolkitSeconds + 1), DOM["#crawl-eta-value"], true);
        if (instance.toolkitQuantityRemaining > 0 ) {
          document.getElementById("crawl-table-td-response-" + (id + 1)).textContent = chrome.i18n.getMessage("crawl_waiting_label");
        }
      }
    });
  }

  /**
   * Updates the ETA for Auto based on the times and seconds. This is called multiple times, thus this helper function.
   *
   * @private
   */
  function updateAutoETA() {
    updateETA(+DOM["#auto-times-input"].value * +DOM["#auto-seconds-input"].value, DOM["#auto-eta-value"], instance.autoEnabled);
  }

  /**
   * Updates the Auto or Toolkit ETA times every time the seconds or times is updated by the user or when the instance is updated.
   *
   * Calculating the hours/minutes/seconds is derived from code written by Vishal @ stackoverflow.com
   *
   * @param time the total time (times * seconds, or quantity * seconds)
   * @param eta  the eta element to update the result with
   * @param enabled if true, when time is <= 0 shows done, else shows tbd (e.g. error)
   * @see https://stackoverflow.com/a/11486026/988713
   * @private
   */
  function updateETA(time, eta, enabled) {
    const hours = ~~ (time / 3600),
          minutes = ~~ ((time % 3600) / 60),
          seconds = Math.floor(time % 60),
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
        th = document.createElement("th"); th.className = "count"; th.textContent = chrome.i18n.getMessage("download_preview_count_label"); tr.appendChild(th);
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
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-count-input"]);
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
    // The dataset json attribute used by user's selecteds and unselecteds, must use ' not " to wrap json
    const tr = document.createElement("tr"); tr.className = (isSelected ? "selected" : "unselected"); tr.dataset.json = JSON.stringify(item);
    const check = document.createElement("img"); check.src = "../img/check-circle.png"; check.alt = ""; check.width = check.height = 16; check.className = "check-circle hvr-grow"; check.title = chrome.i18n.getMessage("download_preview_check_" + (isSelected ? "unselect" : "select"));
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
      for (const element of elements) {
        element.style.display = this.checked ? "table-cell" : "none";
      }
    }
  }

  /**
   * Updates the download selecteds and unselecteds arrays each time the check-circle elements are clicked.
   *
   * @param event the click from which the check-circle was clicked
   * @private
   */
  function updateDownloadSelectedsUnselecteds(event) {
    const element = event.target;
    if (element && element.classList.contains("check-circle")) {
      const parent = element.parentNode.parentNode;
      const object = JSON.parse(parent.dataset.json);
      const isBeingAdded = parent.className === "unselected";
      const generatedId = isBeingAdded ? "selecteds" : "unselecteds";
      const otherId = isBeingAdded ? "unselecteds" : "selecteds";
      parent.className = isBeingAdded ? "selected" : "unselected";
      element.title = chrome.i18n.getMessage("download_preview_check_" + (isBeingAdded ? "unselect" : "select"));
      if (!downloadPreviewCache[generatedId].some(download => (download.url === object.url))) {
        console.log("updateDownloadSelectedsUnselecteds() - pushing into download preview cache" + generatedId);
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
   * errors, then saves and enables the instance, then toggles the view back to the controls.
   *
   * @private
   */
  async function setup() {
    setupInputs("accept");
    const e = setupErrors("accept");
    // Validation Rules:
    // 1. Auto is NOT enabled, Download is NOT enabled: Check if increment decrement errors exist, else validated
    // 2. Auto is enabled, Auto is Increment/Decrement, Download is NOT enabled: Check if errors exist and if autoErrors exist, else validated
    // 3. Auto is enabled, Auto is Increment/Decrement, Download is enabled: Check if errors exist, autoErrors exist, and downloadErrors exist, else validated
    // 4. Auto is enabled, Auto is Next/Prev, Download is NOT enabled: Check if autoErrors exist, else validated
    // 5. Auto is enabled, Auto is Next/Prev, Download is enabled: Check if autoErrors exist and if downloadErrors exist, else validated
    // 6. Download is enabled, Auto is NOT enabled: Check if downloadErrors exist, and check if errors exist. If errors exist, validate only download, else validate increment and download
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
    // Else good to go! Finish setting up _ to re-set the new instance
    else {
      _.enabled = true;
      _.saveFound = _.saveURL;
      // Need this to reset the URLs array if changing the selection or adjusting other properties:
      _.urls = [];
      const precalculateProps = backgroundPage.IncrementDecrementArray.precalculateURLs(_);
      _.urls = precalculateProps.urls;
      _.urlsCurrentIndex = _.startingURLsCurrentIndex = precalculateProps.currentIndex;
      // If List enabled, set the url and starting URL to the first URL in the list
      if (_.listEnabled) {
        _.url = _.startingURL = _.listArray[0];
      }
      // If Auto enabled and instance URLs array (e.g. multi range, shuffle on and hit 0 early in decrement, etc.) adjust times to be urls length
      if (_.autoEnabled && _.urls && _.urls.length > 0) {
        _.autoTimes = _.autoTimesOriginal = _.urls.length;
      }
      // Save URL if checked (only if not in list mode)
      if (_.saveURL && !_.listEnabled) {
        backgroundPage.Saves.addURL(_);
        _.saveType = "url";
      }
      // Save Auto and Download settings. Increment Decrement settings aren't saved because they are set in the Options
      if (_.autoEnabled) {
        chrome.storage.local.set({
          "autoAction": _.autoAction,
          "autoSeconds": _.autoSeconds,
          "autoTimes": _.autoTimes,
          "autoWait": _.autoWait,
          "autoBadge": _.autoBadge,
          "autoRepeat": _.autoRepeat
        });
      }
      if (_.downloadEnabled) {
        chrome.storage.local.set({
          "downloadStrategy": _.downloadStrategy,
          "downloadExtensions": _.downloadExtensions,
          "downloadTags": _.downloadTags,
          "downloadAttributes": _.downloadAttributes,
          "downloadSelector": _.downloadSelector,
          "downloadIncludes": _.downloadIncludes,
          "downloadExcludes": _.downloadExcludes,
          "downloadSubfolder": _.downloadSubfolder,
          "downloadSubfolderIncrement": _.downloadSubfolderIncrement,
          "downloadPreview": _.downloadPreview
        });
      }
      // Now clear the old instance make the new instance be _
      await backgroundPage.Action.performAction("clear", "popupClearBeforeSet", instance, items);
      backgroundPage.Background.setInstance(_.tabId, _);
      instance = backgroundPage.Background.getInstance(_.tabId);
      // If internal shortcuts permissions granted, send message to shortcuts content script to add key/mouse listeners:
      if (items.permissionsInternalShortcuts && items.keyEnabled && !items.keyQuickEnabled) {
        chrome.tabs.sendMessage(_.tabId, {greeting: "addKeyListener"});
      }
      if (items.permissionsInternalShortcuts && items.mouseEnabled && !items.mouseQuickEnabled) {
        chrome.tabs.sendMessage(_.tabId, {greeting: "addMouseListener"});
      }
      // If auto is enabled, ask Auto to start auto timer (must do this after setting instance in Background)
      if (_.autoEnabled) {
        backgroundPage.Auto.startAutoTimer(_, "popup");
      }
      toggleView.call(DOM["#accept-button"]);
    }
  }

  /**
   * Sets up the temporary instance _ with all the form inputs in the Popup.
   *
   * @param caller the caller (e.g. accept, multi, toolkit)
   * @param tabs   (optional) the tabs (only used by toolkit later in setupErrors)
   * @private
   */
  function setupInputs(caller, tabs) {
    if (caller === "accept" || caller === "multi" || caller === "toolkit") {
      // Increment Decrement:
      _.saveURL = DOM["#save-url-input"].checked;
      _.url = _.startingURL = DOM["#url-textarea"].value;
      _.selection = _.startingSelection = DOM["#selection-input"].value;
      _.selectionStart = _.startingSelectionStart = +DOM["#selection-start-input"].value;
      _.interval = +DOM["#interval-input"].value;
      _.base = isNaN(DOM["#base-select"].value) ? DOM["#base-select"].value : +DOM["#base-select"].value;
      _.baseCase = DOM["#base-case-uppercase-input"].checked ? DOM["#base-case-uppercase-input"].value : DOM["#base-case-lowercase-input"].value;
      _.baseDateFormat = DOM["#base-date-format-input"].value;
      _.baseRoman = DOM["#base-roman-latin-input"].checked ? DOM["#base-roman-latin-input"].value : DOM["#base-roman-u216x-input"].checked ? DOM["#base-roman-u216x-input"].value : DOM["#base-roman-u217x-input"].value;
      _.baseCustom = DOM["#base-custom-input"].value;
      _.leadingZeros = DOM["#leading-zeros-input"].checked;
      _.errorSkip = +DOM["#error-skip-input"].value;
      // Note: _.multi is set in clickMulti()
      _.multiCount = +DOM["#multi-count"].value;
      _.multiEnabled = _.multiCount >= 2 && _.multiCount <= 3;
      _.shuffleURLs = DOM["#shuffle-urls-input"].checked;
      _.listEnabled = DOM["#list-input"].checked;
      // Make a copy of the url in _.list and prevent saving when in list mode
      if (_.listEnabled) {
        _.list = _.url;
        _.listArray = _.list.match(/[^\r\n]+/g);
        _.saveURL = DOM["#save-url-input"].checked = false;
        DOM["#save-url-img"].src = "../img/heart-o.png";
      }
    }
    if (caller === "multi") {
      const range = /\[(.*)-(\d+)]/.exec(_.selection);
      if (range && range [1] && range[2]) {
        _.selection = range[1];
        _.selectionStart++;
        _.multiTimes = +range[2];
        _.multiRange = range;
        _.multiRangeEnabled = true;
      } else {
        _.multiTimes = _.multiRange = _.multiRangeEnabled = undefined;
      }
    }
    if (caller === "toolkit") {
      // Toolkit:
      // Note: _.toolkitEnabled = true is set in toolkit()
      _.toolkitTabsLength = tabs ? tabs.length : 0;
      _.toolkitTool = DOM["#toolkit-tool-crawl-input"].checked ? DOM["#toolkit-tool-crawl-input"].value : DOM["#toolkit-tool-links-input"].checked ? DOM["#toolkit-tool-links-input"].value :  DOM["#toolkit-tool-links-input"].checked ? DOM["#toolkit-tool-links-input"].value :  DOM["#toolkit-tool-tabs-input"].checked ? DOM["#toolkit-tool-tabs-input"].value : DOM["#toolkit-tool-links-input"].checked ? DOM["#toolkit-tool-links-input"].value : undefined;
      _.toolkitAction = DOM["#toolkit-action-increment-input"].checked ? DOM["#toolkit-action-increment-input"].value : DOM["#toolkit-action-decrement-input"].checked ? DOM["#toolkit-action-decrement-input"].value : undefined;
      _.toolkitQuantity = _.toolkitQuantityRemaining = +DOM["#toolkit-quantity-input"].value;
      _.toolkitSeconds = +DOM["#toolkit-seconds-input"].value;
      _.toolkitScrape = DOM["#toolkit-scrape-input"].checked;
      _.scrapeMethod = DOM["#scrape-method-select"].value;
      _.scrapeSelector = DOM["#scrape-selector-input"].value;
      _.scrapeProperty = DOM["#scrape-property-input"].value ? DOM["#scrape-property-input"].value.split(".").filter(Boolean) : [];
    }
    if (caller === "accept") {
      // Auto:
      _.autoEnabled = DOM["#auto-toggle-input"].checked;
      _.autoAction = DOM["#auto-action-select"].value;
      // Store the original autoTimes for reference later as we are going to decrement autoTimes
      _.autoTimes = _.autoTimesOriginal = +DOM["#auto-times-input"].value;
      _.autoSeconds = +DOM["#auto-seconds-input"].value;
      _.autoWait = DOM["#auto-wait-input"].checked;
      _.autoBadge = DOM["#auto-badge-input"].checked ? "times" : "";
      _.autoRepeat = DOM["#auto-repeat-input"].checked;
      _.autoRepeatCount = 0;
      _.autoPaused = _.autoRepeating = false;
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
      _.downloadSubfolder = DOM["#download-subfolder-input"].value.trim();
      _.downloadSubfolderIncrement = DOM["#download-subfolder-increment-input"].checked;
      _.downloadPreview = DOM["#download-preview-checkboxes-generated"].value.split(",");
      _.downloadMSelecteds = downloadPreviewCache.mselecteds;
      _.downloadMUnselecteds = downloadPreviewCache.munselecteds;
    }
  }

  /**
   * Sets up all the errors found using the temporary instance _.
   *
   * @param caller the caller (e.g. accept, multi, or toolkit)
   * @return {*} all errors found, if any
   * @private
   */
  function setupErrors(caller) {
    const e = {};
    if (caller === "accept" || caller === "multi" || caller === "toolkit") {
      // Increment Decrement Errors
      e.incrementDecrementErrors = [
        // [0] = URL / List Errors
        _.listEnabled && !_.list ? chrome.i18n.getMessage("url_blank_error") :
        _.listEnabled && (!_.listArray || _.listArray.length <= 1) ? chrome.i18n.getMessage("url_list_newline_error") : "",
        // [1] = Selection Errors
        // Don't try to validate selection if listEnabled or in accept/toolkit if multi range enabled due to brackets
        !_.listEnabled && caller === "accept" && _.multiCount === 1 ? chrome.i18n.getMessage("multi_count_error") :
        !_.listEnabled && _.selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
        !_.listEnabled && !_.url.includes(_.selection) ? chrome.i18n.getMessage("selection_notinurl_error") :
        !_.listEnabled && (_.selectionStart < 0 || _.url.substr(_.selectionStart, _.selection.length) !== _.selection) ? chrome.i18n.getMessage("selectionstart_invalid_error") :
        !_.listEnabled || (caller !== "multi" && _.multiRangeEnabled) ? backgroundPage.IncrementDecrement.validateSelection(_.selection, _.base, _.baseCase, _.baseDateFormat, _.baseRoman, _.baseCustom, _.leadingZeros) : "",
        // [2] Interval Errors
        !_.listEnabled && _.interval <= 0 || _.interval >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("interval_invalid_error") : "",
        // [3] Error Skip Errors
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
        instance.autoEnabled ? chrome.i18n.getMessage("toolkit_auto_enabled_error") :
        !_.toolkitTool || !_.toolkitAction || isNaN(_.toolkitQuantity) || isNaN(_.toolkitSeconds) ? chrome.i18n.getMessage("toolkit_invalid_error") :
        _.toolkitTool === "crawl" && !items.permissionsEnhancedMode ? chrome.i18n.getMessage("toolkit_crawl_permissions_error") :
        _.toolkitTool === "crawl" && (_.toolkitQuantity < 1 || _.toolkitQuantity > 10000) ? chrome.i18n.getMessage("toolkit_crawl_quantity_error") :
        _.toolkitTool === "crawl" && (_.toolkitSeconds < 1 || _.toolkitSeconds > 600) ? chrome.i18n.getMessage("toolkit_crawl_seconds_error") :
        _.toolkitTool === "tabs"  && (_.toolkitQuantity < 1 || _.toolkitQuantity > 100) ? chrome.i18n.getMessage("toolkit_tabs_quantity_error") :
        _.toolkitTool === "tabs"  && (_.toolkitSeconds < 0 || _.toolkitSeconds > 5) ? chrome.i18n.getMessage("toolkit_tabs_seconds_error") :
        _.toolkitTool === "tabs"  && (_.toolkitTabsLength + _.toolkitQuantity > 101) ? chrome.i18n.getMessage("toolkit_tabs_too_many_open_error") :
        _.toolkitTool === "links" && (_.toolkitQuantity < 1 || _.toolkitQuantity > 10000) ? chrome.i18n.getMessage("toolkit_links_quantity_error") : ""
      ];
      e.toolkitErrorsExist = e.toolkitErrors.some(error => error !== "");
      if (e.toolkitErrorsExist) {
        e.toolkitErrors.unshift(chrome.i18n.getMessage("oops_error"));
      }
    }
    if (caller === "accept") {
      // Auto Errors
      e.autoErrors = [
        _.autoEnabled && _.listEnabled && _.autoAction !== "increment" ? chrome.i18n.getMessage("auto_list_action_error") : "",
        _.autoEnabled && (_.autoAction === "next" || _.autoAction === "prev") && !items.permissionsEnhancedMode ? chrome.i18n.getMessage("auto_next_prev_error") : "",
        _.autoEnabled && (_.autoAction === "next" || _.autoAction === "prev") && _.shuffleURLs ? chrome.i18n.getMessage("auto_next_prev_shuffle_error") : "",
        _.autoEnabled && (_.autoTimes < 1 || _.autoTimes > 10000) ? chrome.i18n.getMessage("auto_times_invalid_error") : "",
        _.autoEnabled && (_.autoSeconds < 1 || _.autoSeconds > 3600) ? chrome.i18n.getMessage("auto_seconds_invalid_error") : "",
        _.autoEnabled && _.downloadEnabled && _.autoSeconds < 5 ? chrome.i18n.getMessage("auto_download_seconds_error") : "",
        _.autoEnabled && _.downloadEnabled && _.autoRepeat ? chrome.i18n.getMessage("auto_download_repeat_error") : ""
      ];
      e.autoErrorsExist = e.autoErrors.some(error => error !== "");
      if (e.autoErrorsExist) {
        e.autoErrors.unshift(chrome.i18n.getMessage("oops_error"));
      }
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
        DOM["#setup"].style.display = "none";
        DOM["#crawl"].style.width = DOM["#crawl"].style.height = "550px";
        crawlWindow();
      }
    }
  }

  // Popup Listener
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { messageListener(request, sender, sendResponse); if (request.async) { return true; } });

  // Initialize Popup
  init();

})();