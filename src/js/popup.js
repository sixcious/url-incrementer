/**
 * URL Incrementer Popup
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Popup = function () {

  const DOM = {}, // Map to cache DOM elements: key=id, value=element
        AUTO_ETA_I18NS = { // AUTO ETA messages cache
          "day": chrome.i18n.getMessage("auto_eta_day"),
          "hour": chrome.i18n.getMessage("auto_eta_hour"), "hours": chrome.i18n.getMessage("auto_eta_hours"),
          "minute": chrome.i18n.getMessage("auto_eta_minute"), "minutes": chrome.i18n.getMessage("auto_eta_minutes"),
          "second": chrome.i18n.getMessage("auto_eta_second"), "seconds": chrome.i18n.getMessage("auto_eta_seconds"),
          "tbd": chrome.i18n.getMessage("auto_eta_tbd"), "done": chrome.i18n.getMessage("auto_eta_done")
         },
        DOWNLOAD_PREVIEW_I18NS = { // DOWNLOAD PREVIEW messages cache
          "filename": "Name",
          "noresults": chrome.i18n.getMessage("download_preview_noresults"), "blocked": chrome.i18n.getMessage("download_preview_blocked"),
          "set": chrome.i18n.getMessage("download_preview_set"), "outof": chrome.i18n.getMessage("download_preview_outof"),
          "urls": chrome.i18n.getMessage("download_preview_urls"), "thumb": chrome.i18n.getMessage("download_preview_thumb_label"),
          "extension": chrome.i18n.getMessage("download_preview_extension_label"), "tag": chrome.i18n.getMessage("download_preview_tag_label"),
          "attribute": chrome.i18n.getMessage("download_preview_attribute_label"), "url": chrome.i18n.getMessage("download_preview_url_label")
        };

  let instance = {}, // Tab instance cache
      items_ = {}, // Storage items cache
      localItems_ = {}, // Local Storage items cache
      downloadPreviewAlls = { "pageURL": [], "allURLs": [], "allExtensions": [], "allTags": [] }, // Download Preview All URLs Cache
      timeouts = {}; // Reusable global timeouts for input changes to fire after the user stops typing

  /**
   * Loads the DOM content needed to display the popup page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    const ids = document.querySelectorAll("[id]"),
          i18ns = document.querySelectorAll("[data-i18n]");
    // Cache DOM elements
    for (let element of ids) {
      DOM["#" + element.id] = element;
    }
    // Set i18n (internationalization) text from messages.json
    for (let element of i18ns) {
      element[element.dataset.i18n] = chrome.i18n.getMessage(element.id.replace(/-/g, '_').replace(/\*.*/, ''));
    }
    // Add Event Listeners to the DOM elements
    DOM["#increment-input"].addEventListener("click", clickActionButton);
    DOM["#decrement-input"].addEventListener("click", clickActionButton);
    DOM["#increment-input-2"].addEventListener("click", clickActionButton);
    DOM["#decrement-input-2"].addEventListener("click", clickActionButton);
    DOM["#increment-input-3"].addEventListener("click", clickActionButton);
    DOM["#decrement-input-3"].addEventListener("click", clickActionButton);
    DOM["#clear-input"].addEventListener("click", clickActionButton);
    DOM["#return-input"].addEventListener("click", clickActionButton);
    DOM["#next-input"].addEventListener("click", clickActionButton);
    DOM["#prev-input"].addEventListener("click", clickActionButton);
    DOM["#download-input"].addEventListener("click", clickActionButton);
    DOM["#auto-input"].addEventListener("click", clickActionButton);
    DOM["#setup-input"].addEventListener("click", toggleView);
    DOM["#accept-button"].addEventListener("click", setup);
    DOM["#cancel-button"].addEventListener("click", toggleView);
    DOM["#multi-button"].addEventListener("click", clickMulti);
    DOM["#custom-urls-input"].addEventListener("change", function() { DOM["#increment-decrement"].className = !this.checked ? "display-block fade-in" : "display-none"; DOM["#custom"].className = this.checked ? "display-block fade-in" : "display-none";  });
    DOM["#toolkit-input"].addEventListener("change", function() { DOM["#toolkit"].className = this.checked ? "display-block fade-in" : "display-none"; });
    DOM["#options-button"].addEventListener("click", function() { chrome.runtime.openOptionsPage(); });
    DOM["#url-textarea"].addEventListener("select", selectURL); // "select" event is relatively new and the best event for this
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; });
    DOM["#toolkit-urli-button-img"].addEventListener("click", toolkit);
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
    DOM["#download-preview-extension-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-tag-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-attribute-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    DOM["#download-preview-compressed-input"].addEventListener("change", updateDownloadPreviewCheckboxes);
    // Initialize popup content
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      chrome.runtime.getBackgroundPage(async function(backgroundPage) {
        instance = backgroundPage.URLI.Background.getInstance(tabs[0].id);
        items_ = backgroundPage.URLI.Background.getItems();
        localItems_ = backgroundPage.URLI.Background.getLocalItems();
        if (!instance) {
          instance = await backgroundPage.URLI.Background.buildInstance(tabs[0]);
        }
        updateControls();
        DOM["#increment-input"].style = DOM["#decrement-input"].style = DOM["#increment-input-2"].style = DOM["#decrement-input-2"].style = DOM["#increment-input-3"].style = DOM["#decrement-input-3"].style = DOM["#clear-input"].style = DOM["#return-input"].style = DOM["#setup-input"].style = DOM["#next-input"].style = DOM["#prev-input"].style = DOM["#auto-input"].style = "width:" + items_.popupButtonSize + "px; height:" + items_.popupButtonSize + "px;";
        const downloadPaddingAdjustment = items_.popupButtonSize <= 24 ? 4 : items_.popupButtonSize <= 44 ? 6 : 8; // cloud-download.png is an irregular shape and needs adjustment
        DOM["#download-input"].style = "width:" + (items_.popupButtonSize + downloadPaddingAdjustment) + "px; height:" + (items_.popupButtonSize + downloadPaddingAdjustment) + "px;";// margin-bottom:-" + downloadPaddingAdjustment + "px;";
        DOM["#setup-input"].className = items_.popupAnimationsEnabled ? "hvr-grow" : "";
        DOM["#download-preview-table-div"].innerHTML = DOWNLOAD_PREVIEW_I18NS.blocked;
        updateSetup();
        // Jump straight to Setup if instance isn't enabled and if the option is set in storage items
        if ((!instance.enabled && !instance.autoEnabled && !instance.downloadEnabled && !instance.profileFound) && items_.popupOpenSetup) {
          toggleView.call(DOM["#setup-input"]);
        }
      });
    });
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (Background)
   * 
   * @param request      the request containing properties to parse (e.g. greeting message)
   * @param sender       the sender who sent this message, with an identifying tabId
   * @param sendResponse the optional callback function (e.g. for a reply back to the sender)
   * @public
   */
  function messageListener(request, sender, sendResponse) {
    console.log("URLI.Popup.messageListener() - request.greeting=" + request + " sender=" + sender);
    switch (request.greeting) {
      case "updatePopupInstance":
        if (request.instance && request.instance.tabId === instance.tabId) {
          instance = request.instance;
          updateControls();
          updateSetup();
        }
        break;
      case "updatePopupDownloadPreview":
        if (request.instance && request.instance.tabId === instance.tabId) {
          updateDownloadPreviewCompletely();
        }
        break;
      case "updatePopupToolkitGenerateURLs":
        if (request.instance && request.instance.tabId === instance.tabId) {
          updateToolkitGenerateURLs(request.instance.urls);
        }
        break;
      default:
        break;
    }
    sendResponse({});
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
        DOM["#url-textarea"].value = instance.url;
        DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
        DOM["#url-textarea"].focus();
        DOM["#selection-input"].value = instance.selection;
        DOM["#selection-start-input"].value = instance.selectionStart;
        break;
      case "accept-button": // Hide setup, show controls
      case "cancel-button":
        DOM["#setup"].className = "display-none";
        DOM["#controls"].className = "display-block fade-in";
        updateControls(); // Needed to reset hover.css click effect
        break;
      default:
        break;
    }
  }

  /**
   * Performs the action based on the button if the requirements are met (e.g. instance is enabled).
   * 
   * @private
   */
  function clickActionButton() {
    const action = this.dataset.action;
    if (((action === "increment" || action === "decrement") && (instance.enabled || instance.profileFound)) ||
        ((action === "increment2" || action === "decrement2" || action === "increment3" || action === "decrement3") && (instance.enabled && instance.multi > 1)) ||
         (action === "next" || action === "prev") ||
        ((action === "clear" || action === "return") && (instance.enabled || instance.autoEnabled || instance.downloadEnabled)) ||
         (action === "auto" && instance.autoEnabled) ||
         (action === "download" && instance.downloadEnabled)) {
      if (items_.popupAnimationsEnabled) {
        URLI.UI.clickHoverCss(this, "hvr-push-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLI.Action.performAction(instance, action, "popupClickActionButton");
      });
      // Note: After performing the action, the background sends a message back to popup with the updated instance
    }
  }

  /**
   * Updates the control images based on whether the instance is enabled.
   * 
   * @private
   */
  function updateControls() {
    DOM["#profile-found-img"].className = instance.profileFound ? "display-block" : "display-none";
    DOM["#increment-input"].className = 
    DOM["#decrement-input"].className = instance.enabled || instance.profileFound ? items_.popupAnimationsEnabled ? "hvr-grow"  : "" : instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev") ? "display-none" : "disabled";
    DOM["#increment-input-2"].className =
    DOM["#decrement-input-2"].className = instance.enabled && !instance.autoEnabled && instance.multi >= 2 ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "display-none";
    DOM["#increment-input-3"].className =
    DOM["#decrement-input-3"].className = instance.enabled && !instance.autoEnabled && instance.multi === 3 ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "display-none";
    DOM["#next-input"].className =
    DOM["#prev-input"].className = (items_.permissionsEnhancedMode && items_.nextPrevPopupButtons) || (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "display-none";
    DOM["#clear-input"].className = DOM["#return-input"].className = instance.enabled || instance.autoEnabled || instance.downloadEnabled ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "disabled";
    DOM["#auto-input"].className = instance.autoEnabled ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "display-none";
    DOM["#auto-input"].src = instance.autoPaused ? "../img/font-awesome/orange/play-circle.png" : "../img/font-awesome/orange/pause-circle.png";
    DOM["#download-input"].className = items_.permissionsDownload && instance.downloadEnabled ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "display-none";
  }

  /**
   * Updates the setup input properties. This method is called when the popup loads or when the instance is updated.
   *
   * @private
   */
  function updateSetup() {
    // Increment Decrement Setup:
    DOM["#profile-save-input"].checked = instance.profileFound || localItems_.profilePreselect;
    if (instance.profileFound) {
      DOM["#profile-save-label"].style.color = "#1779BA";
    }
    DOM["#url-textarea"].value = instance.url;
    DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
    DOM["#url-textarea"].focus();
    DOM["#selection-input"].value = instance.selection;
    DOM["#selection-start-input"].value = instance.selectionStart;
    DOM["#interval-input"].value = instance.interval;
    DOM["#error-skip-input"].value = instance.errorSkip;
    DOM["#base-select"].value = instance.base;
    DOM["#base-case"].className = instance.base > 10 ? "display-block" : "display-none";
    DOM["#base-case-lowercase-input"].checked = instance.baseCase === "lowercase";
    DOM["#base-case-uppercase-input"].checked = instance.baseCase === "uppercase";
    DOM["#leading-zeros-input"].checked = instance.leadingZeros;
    DOM["#shuffle-urls-input"].checked = instance.shuffleURLs;
    // Toolkit Setup:
    DOM["#toolkit-tool-open-tabs-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-open-tabs-input"].value;
    DOM["#toolkit-tool-generate-links-input"].checked = instance.toolkitTool === DOM["#toolkit-tool-generate-links-input"].value;
    DOM["#toolkit-action-increment-input"].checked = instance.toolkitAction === DOM["#toolkit-action-increment-input"].value;
    DOM["#toolkit-action-decrement-input"].checked = instance.toolkitAction === DOM["#toolkit-action-decrement-input"].value;
    DOM["#toolkit-quantity-input"].value = instance.toolkitQuantity;
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
    DOM["#download-toggle"].style = items_.permissionsDownload ? "" : "display: none;";
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
    DOM["#download-preview-thumb-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("thumb");
    DOM["#download-preview-extension-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("extension");
    DOM["#download-preview-tag-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("tag");
    DOM["#download-preview-attribute-input"].checked = instance.downloadPreview && instance.downloadPreview.includes("attribute");
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
   * Handle the URL selection on select events. Saves the selectionStart
   * to a hidden input and updates the selection input to the selected text and
   * checks the leading zeros checkbox based on leading zeros present.
   * 
   * @private
   */
  function selectURL() {
    DOM["#selection-input"].value = DOM["#url-textarea"].value.substring(DOM["#url-textarea"].selectionStart, DOM["#url-textarea"].selectionEnd); // Firefox: window.getSelection().toString(); does not work in FF
    DOM["#selection-start-input"].value = DOM["#url-textarea"].selectionStart;
    if (items_.leadingZerosPadByDetection) {
      DOM["#leading-zeros-input"].checked = DOM["#selection-input"].value.charAt(0) === '0' && DOM["#selection-input"].value.length > 1;
    }
  }

  /**
   * Updates the Auto ETA time every time the seconds or times is updated by the user or when the instance is updated.
   *
   * Calculating the hours/minutes/seconds is based on code written by Vishal @ stackoverflow.com
   * @see https://stackoverflow.com/a/11486026/988713
   * @private
   */
  function updateAutoETA() {
    const itimes = +DOM["#auto-times-input"].value,
          iseconds = +DOM["#auto-seconds-input"].value,
          time = itimes * iseconds,
          hours = ~~ (time / 3600),
          minutes = ~~ ((time % 3600) / 60),
          seconds = time % 60,
          fhours = hours ? hours + (hours === 1 ? AUTO_ETA_I18NS.hour : AUTO_ETA_I18NS.hours) : "",
          fminutes = minutes ? minutes + (minutes === 1 ? AUTO_ETA_I18NS.minute : AUTO_ETA_I18NS.minutes) : "",
          fseconds = seconds ? seconds + (seconds === 1 ? AUTO_ETA_I18NS.second : AUTO_ETA_I18NS.seconds) : "";
    DOM["#auto-eta-value"].textContent =
      itimes < 0 || iseconds < 0 || (!hours && !minutes && !seconds) ?
      instance.autoEnabled ? AUTO_ETA_I18NS.done : AUTO_ETA_I18NS.tbd :
      time > 86400 ? AUTO_ETA_I18NS.day : fhours + fminutes + fseconds;
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
        DOM["#download-preview-table-div"].innerHTML = DOWNLOAD_PREVIEW_I18NS.blocked;
      } else {
        const code = "URLI.Download.previewDownloadURLs();";
        chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
          if (results && results[0]) {
            // Cache the results, build the extensions, tags, and attributes checkboxes, and then update the rest of the
            // download preview (e.g. table) in the next method
            downloadPreviewAlls = results[0];
            const downloadExtensions = DOM["#download-extensions-generated"].value.split(","),
                  downloadTags = DOM["#download-tags-generated"].value.split(","),
                  downloadAttributes = DOM["#download-attributes-generated"].value.split(",");
            DOM["#download-extensions"].innerHTML = buildDownloadPreviewCheckboxes(downloadPreviewAlls.allExtensions, downloadExtensions);
            DOM["#download-tags"].innerHTML = buildDownloadPreviewCheckboxes(downloadPreviewAlls.allTags, downloadTags);
            DOM["#download-attributes"].innerHTML = buildDownloadPreviewCheckboxes(downloadPreviewAlls.allAttributes, downloadAttributes);
            updateDownloadPreview();
          }
        });
      }
    });
  }

  /**
   * Builds the Download Preview Checkboxes HTML for the properties (extensions, tags, and attributes). This is only
   * called by downloadPreviewCompletely().
   *
   * @param properties        all the properties (extensions/tags/attributes)
   * @param checkedProperties only the checked properties (e.g. the instance's checked extensions/tags/attributes)
   * @returns {string} HTML of the checkboxes
   * @private
   */
  function buildDownloadPreviewCheckboxes(properties, checkedProperties) {
    let html = "";
    for (let property of properties) {
      html +=
        "<label>" +
          "<input value=\"" + property + "\" type=\"checkbox\"" + (checkedProperties && checkedProperties.includes(property) ? "checked=\"checked\"" : "") +  "/>" +
          "<span>" + property + "</span>" +
        "</label>";
    }
    return html;
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
          code = "URLI.Download.findDownloadURLs(" +
            JSON.stringify(downloadStrategy) + ", " +
            JSON.stringify(downloadExtensions) + ", " +
            JSON.stringify(downloadTags) + ", " +
            JSON.stringify(downloadAttributes) + ", " +
            JSON.stringify(downloadSelector) + ", " +
            JSON.stringify(downloadIncludes) + ", " +
            JSON.stringify(downloadExcludes) + ");";
    chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
      if (chrome.runtime.lastError) {
        DOM["#download-preview-table-div"].innerHTML = DOWNLOAD_PREVIEW_I18NS.blocked;
      } else if (results && results[0]) {
        // We get the selected URLs from the result, and then filter out the unselected ones from all the URLs
        // Note: Finding the difference of two arrays of objects code by kaspermoerch
        // @see https://stackoverflow.com/a/21988249
        const alls = downloadStrategy !== "page" ? downloadPreviewAlls.allURLs : downloadPreviewAlls.pageURL,
              selecteds = results[0],
              unselecteds = alls.filter(function(obj) {
                return !selecteds.some(function(obj2) {
                  return obj.url === obj2.url;
                });
              }),
              selectedsLength = selecteds.length,
              totalLength = selecteds.length + unselecteds.length;
        // Download Preview Heading Title:
        DOM["#download-preview-heading-title"].innerHTML =
          "<div class=\"" + (selectedsLength > 0 ? "success" : "error") + "\">" +
            DOWNLOAD_PREVIEW_I18NS.set + selectedsLength + DOWNLOAD_PREVIEW_I18NS.outof + totalLength + DOWNLOAD_PREVIEW_I18NS.urls +
          "</div>";
        // Download Preview Table and a count index to keep track of current row index:
        let table =
          "<table>" +
            "<thead>" +
              "<tr>" +
                "<th class=\"check\">&nbsp;</th>" +
                "<th class=\"count\">&nbsp;</th>" +
                "<th class=\"thumb\">" + DOWNLOAD_PREVIEW_I18NS.thumb + "</th>" +
                "<th class=\"filename\">" + DOWNLOAD_PREVIEW_I18NS.filename + "</th>" +
                "<th class=\"extension\">" + DOWNLOAD_PREVIEW_I18NS.extension + "</th>" +
                "<th class=\"tag\">" + DOWNLOAD_PREVIEW_I18NS.tag + "</th>" +
                "<th class=\"attribute\">" + DOWNLOAD_PREVIEW_I18NS.attribute + "</th>" +
                "<th class=\"url\">" + DOWNLOAD_PREVIEW_I18NS.url + "</th>" +
              "</tr>" +
            "</thead>" +
            "<tbody>",
            count = 1;
        for (let selected of selecteds) {
          table += buildDownloadPreviewTR(selected, true, count++);
        }
        for (let unselected of unselecteds) {
          table += buildDownloadPreviewTR(unselected, false, count++);
        }
        table += "</tbody>" + "</table>";
        DOM["#download-preview-table-div"].innerHTML = table;
        // After we build the table we need to update the columns again to what the checkboxes were:
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-thumb-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-extension-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-tag-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-attribute-input"]);
        updateDownloadPreviewCheckboxes.call(DOM["#download-preview-compressed-input"]);
      } else {
        DOM["#download-preview-table-div"].innerHTML = DOWNLOAD_PREVIEW_I18NS.noresults;
      }
    });
  }

  /**
   * Builds the TR (table row) HTML for the download preview table.
   *
   * @param item       the download preview item
   * @param isSelected true if this download preview item is selected, false if not
   * @param count      the current row index count
   * @returns {string} HTML of the tr
   * @private
   */
  function buildDownloadPreviewTR(item, isSelected, count) {
    return "" + // need this empty string for return to concatenate nicely down to the next line
      "<tr class=\"" + (isSelected ? "selected" : "unselected") + "\">" +
        "<td class=\"check\"><img src=\"../img/font-awesome/green/check-circle.png\" alt=\"\" width=\"16\" height=\"16\"/></td>" +
        "<td class=\"count\">" + (count) + "</td>" +
        "<td class=\"thumb\">" + buildDownloadPreviewThumb(item) + "</td>" +
        "<td class=\"filename\">" + item.filename + "</td>" +
        "<td class=\"extension\">" + item.extension + "</td>" +
        "<td class=\"tag\">" + item.tag + "</td>" +
        "<td class=\"attribute\">" + item.attribute + "</td>" +
        "<td class=\"url\">" + item.url  + "</td>" +
      "</tr>";
  }

  /**
   * Builds the download preview thumb HTML (e.g. an <img> tag).
   *
   * @param item the download preview item
   * @returns {string} HTML of the thumb (e.g. <img> tag)
   * @private
   */
  function buildDownloadPreviewThumb(item) {
    const IMG_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "svg", "bmp", "ico"],
          VIDEO_EXTENSIONS = ["mp4", "webm"];
    let html = "";
    if (item) {
      if (item.tag === "img" || IMG_EXTENSIONS.includes(item.extension)) {
        html = "<img src=\"" + item.url + "\" alt=\"\"/>";
      } else if (item.tag === "video" || VIDEO_EXTENSIONS.includes(item.extension)) {
        html = "<video src=\"" + item.url + "\"/>";
      }
    }
    return html;
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
    console.log("URLI.Popup.inputUpdateDownloadPreview() - about to clearTimeout and setTimeout");
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
    for (let input of inputs) {
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
      let elements = document.querySelectorAll("#download-preview-table-div table ." + this.value );
      for (let element of elements) {
        element.style.display = this.checked ? "table-cell" : "none";
      }
    }
  }


  function clickMulti() {
    const
      // Increment Decrement Values
      url = DOM["#url-textarea"].value,
      selection = DOM["#selection-input"].value,
      selectionStart = +DOM["#selection-start-input"].value,
      interval = +DOM["#interval-input"].value,
      base = +DOM["#base-select"].value,
      baseCase = DOM["#base-case-uppercase-input"].checked ? "uppercase" : DOM["#base-case-lowercase-input"].checked ? "lowercase" : undefined,
      selectionParsed = parseInt(selection, base).toString(base),
      leadingZeros = DOM["#leading-zeros-input"].checked,
      errorSkip = +DOM["#error-skip-input"].value,
      multi = instance.multi >= 3 ? 0 : instance.multi + 1,
      // Increment Decrement Errors
      errors = [ // [0] = selection errors and [1] = interval errors
        // [0] = Selection Errors
        selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
        url.indexOf(selection) === -1 ? chrome.i18n.getMessage("selection_notinurl_error") :
        !/^[a-z0-9]+$/i.test(selection) ? chrome.i18n.getMessage("selection_notalphanumeric_error") :
        selectionStart < 0 || url.substr(selectionStart, selection.length) !== selection ? chrome.i18n.getMessage("selectionstart_invalid_error") :
        parseInt(selection, base) >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("selection_toolarge_error") :
        isNaN(parseInt(selection, base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionParsed.length) + selectionParsed.toUpperCase()) ? chrome.i18n.getMessage("selection_base_error") : "",
        // [1] Interval Errors
        interval < 1 || interval >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("interval_invalid_error") : "",
        // [2] Error Skip Errors
        errorSkip < 0 || errorSkip > 100 ? chrome.i18n.getMessage("error_skip_invalid_error") : ""
        // [3] Multi Errors ?
      ],
      errorsExist = errors.some(error => error !== "");
    if (multi === 0) {
      instance.multi = 0;
      DOM["#multi-selections"].textContent = "";
    }
    else if (errorsExist) {
      errors.unshift(chrome.i18n.getMessage("oops_error"));
      URLI.UI.generateAlert(errors);
    } else {
      instance.multi = multi;
      instance["selection" + multi] = selection;
      instance["selectionStart" + multi] = selectionStart;
      instance["interval" + multi] = interval;
      instance["base" + multi] = base;
      instance["baseCase" + multi] = baseCase;
      instance["leadingZeros" + multi] = leadingZeros;
      instance["errorSkip" + multi] = errorSkip;
      DOM["#multi-selections"].textContent = multi;
    }
  }

  /**
   * Called each time the Generate URLS tool is called to update the table of links and the download button link.
   *
   * @param urls the incremented or decremented URLs that were generated
   * @private
   */
  function updateToolkitGenerateURLs(urls) {
    if (urls && urls.length > 0) {
      // Table must have similar inline styling from popup.css for the download blob's HTML file:
      let table =
        "<table style='font-family: \"Segoe UI\", Tahoma, sans-serif; font-size: 12px; border-collapse: collapse; border-radius: 0;\n'>" +
        "<thead style='background: #f8f8f8; color: #0a0a0a;'>" +
        "<tr style='background: transparent;'>" +
        "<th style='font-weight: bold; text-align: left; padding: 0.25rem 0.312rem 0.312rem;'>URL</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody style='border: 1px solid #f1f1f1; background-color: #fefefe;'>",
        count = 1;
      for (let url of urls) {
        table += ((count++ % 2) !== 0 ?
          "<tr>" : "<tr style='border-bottom: 0; background-color: #f1f1f1;'>") +
          "<td style='padding: 0.25rem 0.312rem 0.312rem'>" +
          "<a href=\"" + url.urlmod + "\" target=\"_blank\">" + url.urlmod + "</a>" +
          "</td>" +
          "</tr>";
      }
      table += "</tbody>" + "</table>";
      DOM["#toolkit-generate-links-div"].className = "display-block fade-in";
      DOM["#toolkit-generate-links-download"].href = URL.createObjectURL(new Blob([table], {"type": "text/html"}));
      DOM["#toolkit-generate-links-table"].innerHTML = table;
    }
  }

  /**
   * TODO
   */
  function toolkit() {
    URLI.UI.clickHoverCss(this, "hvr-push-click");
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      console.log("tabs.length=" + tabs.length);
      const
            // Increment Decrement Values
            url = DOM["#url-textarea"].value,
            selection = DOM["#selection-input"].value,
            selectionStart = +DOM["#selection-start-input"].value,
            interval = +DOM["#interval-input"].value,
            base = +DOM["#base-select"].value,
            baseCase = DOM["#base-case-uppercase-input"].checked ? "uppercase" : DOM["#base-case-lowercase-input"].checked ? "lowercase" : undefined,
            selectionParsed = parseInt(selection, base).toString(base),
            leadingZeros = DOM["#leading-zeros-input"].checked,
            errorSkip = +DOM["#error-skip-input"].value,
            // URLs Values:
            customURLs = DOM["#custom-urls-input"].checked,
            shuffleURLs = DOM["#shuffle-urls-input"].checked,
            urls = customURLs && DOM["#custom-urls-textarea"].value ? DOM["#custom-urls-textarea"].value.split(/[ ,\n]+/).filter(Boolean) : [],
            // Toolkit
            tabsLength = tabs ? tabs.length : 0,
            toolkitTool = DOM["#toolkit-tool-open-tabs-input"].checked ? DOM["#toolkit-tool-open-tabs-input"].value : DOM["#toolkit-tool-generate-links-input"].checked ? DOM["#toolkit-tool-generate-links-input"].value : undefined,
            toolkitAction = DOM["#toolkit-action-increment-input"].checked ? DOM["#toolkit-action-increment-input"].value : DOM["#toolkit-action-decrement-input"].checked  ? DOM["#toolkit-action-decrement-input"].value : undefined,
            toolkitQuantity = +DOM["#toolkit-quantity-input"].value,
            // Increment Decrement Errors
            errors = [ // [0] = selection errors and [1] = interval errors
              // [0] = Selection Errors
              selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
              url.indexOf(selection) === -1 ? chrome.i18n.getMessage("selection_notinurl_error") :
              !/^[a-z0-9]+$/i.test(selection) ? chrome.i18n.getMessage("selection_notalphanumeric_error") :
              selectionStart < 0 || url.substr(selectionStart, selection.length) !== selection ? chrome.i18n.getMessage("selectionstart_invalid_error") :
              parseInt(selection, base) >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("selection_toolarge_error") :
              isNaN(parseInt(selection, base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionParsed.length) + selectionParsed.toUpperCase()) ? chrome.i18n.getMessage("selection_base_error") : "",
              // [1] Interval Errors
              interval < 1 || interval >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("interval_invalid_error") : "",
              // [2] Error Skip Errors
              errorSkip < 0 || errorSkip > 100 ? chrome.i18n.getMessage("error_skip_invalid_error") : ""
            ],
            // Toolkit Errors
            toolkitErrors = [
              !toolkitTool || !toolkitAction || isNaN(toolkitQuantity) ? chrome.i18n.getMessage("toolkit_invalid_error") :
              toolkitTool === "open-tabs" && (toolkitQuantity < 1 || toolkitQuantity > 100) ? chrome.i18n.getMessage("toolkit_open_tabs_quantity_error") :
              toolkitTool === "open-tabs" && (tabsLength + toolkitQuantity > 101) ? chrome.i18n.getMessage("toolkit_open_tabs_too_many_open_error") :
              toolkitTool === "generate-links" && (toolkitQuantity < 1 || toolkitQuantity > 10000) ? chrome.i18n.getMessage("toolkit_generate_links_quantity_error") : ""
            ],
            errorsExist = errors.some(error => error !== ""),
            toolkitErrorsExist = toolkitErrors.some(toolkitError => toolkitError !== "");
      if (toolkitErrorsExist) {
        errors.unshift(chrome.i18n.getMessage("oops_error"));
        URLI.UI.generateAlert(toolkitErrors);
      } else if (errorsExist) {
        errors.unshift(chrome.i18n.getMessage("oops_error"));
        URLI.UI.generateAlert(errors);
      } else {
        instance.selection = selection;
        instance.selectionStart = selectionStart;
        instance.interval = interval;
        instance.base = base;
        instance.baseCase = baseCase;
        instance.leadingZeros = leadingZeros;
        instance.errorSkip = errorSkip;
        instance.customURLs = customURLs;
        instance.shuffleURLs = shuffleURLs;
        instance.urls = urls;
        instance.toolkitEnabled = true;
        instance.toolkitTool = toolkitTool;
        instance.toolkitAction = toolkitAction;
        instance.toolkitQuantity = toolkitQuantity;
        chrome.runtime.getBackgroundPage(function(backgroundPage) {
          const precalculateProps = backgroundPage.URLI.IncrementDecrement.precalculateURLs(instance);
          instance.urls = precalculateProps.urls;
          instance.urlsCurrentIndex = precalculateProps.currentIndex;
          backgroundPage.URLI.Action.performAction(instance, "toolkit", "popup");
        });
        // Note: After performing the action, the background sends a message back to popup with the results (if necessary)
        chrome.storage.sync.set({
          "toolkitTool": toolkitTool,
          "toolkitAction": toolkitAction,
          "toolkitQuantity": toolkitQuantity
        });
      }
    });
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
    // This if covers a rare case: In case the user tries accepting and the previously selected property is not currently in the checkbox values and they did not make any changes to the checkboxes to update the values, this ensures it updates to exactly what's currently checked in the checkboxes
    if (DOM["#download-toggle-input"].checked) {
      if (DOM["#download-strategy-select"].value === "extensions") { translateCheckboxValuesToHiddenInput("#download-extensions input", "#download-extensions-generated"); }
      if (DOM["#download-strategy-select"].value === "tags") {       translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated"); }
      if (DOM["#download-strategy-select"].value === "attributes") { translateCheckboxValuesToHiddenInput("#download-attributes input", "#download-attributes-generated"); }
    }
    const profileSave = DOM["#profile-save-input"].checked,
          url = DOM["#url-textarea"].value,
          selection = DOM["#selection-input"].value,
          selectionStart = +DOM["#selection-start-input"].value,
          interval = +DOM["#interval-input"].value,
          base = +DOM["#base-select"].value,
          baseCase = DOM["#base-case-uppercase-input"].checked ? "uppercase" : DOM["#base-case-lowercase-input"].checked ? "lowercase" : undefined,
          selectionParsed = parseInt(selection, base).toString(base),
          leadingZeros = DOM["#leading-zeros-input"].checked,
          errorSkip = +DOM["#error-skip-input"].value,
          customURLs = DOM["#custom-urls-input"].checked,
          shuffleURLs = DOM["#shuffle-urls-input"].checked,
          urls = customURLs && DOM["#custom-urls-textarea"].value ? DOM["#custom-urls-textarea"].value.split(/[ ,\n]+/).filter(Boolean) : [],
          autoEnabled = DOM["#auto-toggle-input"].checked,
          autoAction = DOM["#auto-action-select"].value,
          autoTimes = customURLs && urls && urls.length > 0 ? urls.length : +DOM["#auto-times-input"].value,
          autoSeconds = +DOM["#auto-seconds-input"].value,
          autoWait = DOM["#auto-wait-input"].checked,
          autoBadge = DOM["#auto-badge-input"].checked ? "times" : "",
          autoRepeat = DOM["#auto-repeat-input"].checked,
          downloadEnabled = DOM["#download-toggle-input"].checked,
          downloadStrategy = DOM["#download-strategy-select"].value,
          downloadSelector = DOM["#download-selector-input"].value,
          downloadIncludes = DOM["#download-includes-input"].value ? DOM["#download-includes-input"].value.replace(/\s+/g, "").split(",").filter(Boolean) : [],
          downloadExcludes = DOM["#download-excludes-input"].value ? DOM["#download-excludes-input"].value.replace(/\s+/g, "").split(",").filter(Boolean) : [],
          downloadMinMB = +DOM["#download-min-mb-input"].value,
          downloadMaxMB = +DOM["#download-max-mb-input"].value,
          downloadPreview = DOM["#download-preview-checkboxes-generated"].value.split(","),
          downloadExtensions = DOM["#download-extensions-generated"].value.split(","),
          downloadTags = DOM["#download-tags-generated"].value.split(","),
          downloadAttributes = DOM["#download-attributes-generated"].value.split(","),

          // Increment Decrement Errors
          errors = [ // [0] = selection errors and [1] = interval errors
            // [0] = Selection Errors
            selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
            url.indexOf(selection) === -1 ? chrome.i18n.getMessage("selection_notinurl_error") :
            !/^[a-z0-9]+$/i.test(selection) ? chrome.i18n.getMessage("selection_notalphanumeric_error") :
            selectionStart < 0 || url.substr(selectionStart, selection.length) !== selection ? chrome.i18n.getMessage("selectionstart_invalid_error") :
            parseInt(selection, base) >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("selection_toolarge_error") :
            isNaN(parseInt(selection, base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionParsed.length) + selectionParsed.toUpperCase()) ? chrome.i18n.getMessage("selection_base_error") : "",
            // [1] Interval Errors
            interval < 1 || interval >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("interval_invalid_error") : "",
            // [2] Error Skip Errors
            errorSkip < 0 || errorSkip > 100 ? chrome.i18n.getMessage("error_skip_invalid_error") : ""
          ],
          // Auto Errors
          autoErrors = [
            autoEnabled && (autoAction === "next" || autoAction === "prev") && !items_.permissionsEnhancedMode ? chrome.i18n.getMessage("auto_next_prev_error") : "",
            autoEnabled && (autoTimes < 1 || autoTimes > 1000) ? chrome.i18n.getMessage("auto_times_invalid_error") : "",
            autoEnabled && (autoSeconds < 1 || autoSeconds > 3600) ? chrome.i18n.getMessage("auto_seconds_invalid_error") : "",
            autoEnabled && (autoSeconds * autoTimes > 86400) ? chrome.i18n.getMessage("auto_eta_toohigh_error") : "",
            // TODO: Should we give the user the option or should this be enforced? autoEnabled && downloadEnabled && !autoWait ? chrome.i18n.getMessage("auto_download_wait_error") : "",
            autoEnabled && downloadEnabled && autoSeconds < 5 ? chrome.i18n.getMessage("auto_download_seconds_error") : "",
            autoEnabled && downloadEnabled && autoRepeat ? chrome.i18n.getMessage("auto_download_repeat_error") : ""
          ],
          // Download Errors
          downloadErrors = [
            downloadEnabled && !items_.permissionsDownload ? chrome.i18n.getMessage("download_enabled_error") : ""
          ],
          errorsExist = errors.some(error => error !== ""),
          autoErrorsExist = autoErrors.some(autoError => autoError !== ""),
          downloadErrorsExist = downloadErrors.some(downloadError => downloadError !== ""),
          enabled = !errorsExist && autoEnabled ? (autoAction !== "next" && autoAction !== "prev") : !errorsExist,

          /* Validates Rules:
          1. Auto is NOT enabled, Download is NOT enabled: Check if errors exist, else validated
          2. Auto is enabled, Auto is Increment/Decrement, Download is NOT enabled: Check if errors exist and if autoErrors exist, else validated
          3. Auto is enabled, Auto is Increment/Decrement, Download is enabled: Check if errors exist, autoErrors exist, and downloadErrors exist, else validated
          4. Auto is enabled, Auto is Next/Prev, Download is NOT enabled: Check if autoErrors exist, else validated
          5. Auto is enabled, Auto is Next/Prev, Download is enabled: Check if autoErrors exist and if downloadErrors exist, else validated
          6. Download is enabled, Auto is NOT enabled: Check if downloadErrors exist, and check if errors exist. If errors exist, validate only download, else validate increment and download
          */
          validated = !autoEnabled && !downloadEnabled ?
                   !errorsExist :
                 autoEnabled ?
                   autoAction === "increment" || autoAction === "decrement" ?
                     !downloadEnabled ?
                       !errorsExist && !autoErrorsExist :
                       !errorsExist && !autoErrorsExist && !downloadErrorsExist :
                   // e.g. autoAction === "next" || autoAction === "prev"
                     !downloadEnabled ?
                       !autoErrorsExist :
                       !autoErrorsExist && !downloadErrorsExist :
                   downloadEnabled && !autoEnabled && !downloadErrorsExist;

    // Generate alerts if not validated
    if (!validated) {
      if (downloadErrorsExist) {
        downloadErrors.unshift(chrome.i18n.getMessage("oops_error"));
        URLI.UI.generateAlert(downloadErrors);
      } else if (autoErrorsExist) {
        autoErrors.unshift(chrome.i18n.getMessage("oops_error"));
        URLI.UI.generateAlert(autoErrors);
      } else if (errorsExist) {
        errors.unshift(chrome.i18n.getMessage("oops_error"));
        URLI.UI.generateAlert(errors);
      } else {
        URLI.UI.generateAlert([chrome.i18n.getMessage("oops_error")]);
      }
    }

    // Else good to go!
    else {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLI.Action.performAction(instance, "clear", "popupClearBeforeSet", async function() {
        instance.enabled = enabled;
        instance.profileFound = profileSave;
        instance.selection = selection;
        instance.selectionStart = selectionStart;
        instance.interval = interval;
        instance.base = base;
        instance.baseCase = baseCase;
        instance.leadingZeros = leadingZeros;
        instance.errorSkip = errorSkip;
        instance.customURLs = customURLs;
        instance.shuffleURLs = shuffleURLs;
        instance.urls = urls;
        instance.toolkitEnabled = false;
        instance.autoEnabled = autoEnabled;
        instance.autoAction = autoAction;
        instance.autoTimes = autoTimes;
        instance.autoSeconds = autoSeconds;
        instance.autoWait = autoWait;
        instance.autoBadge = autoBadge;
        instance.autoRepeat = autoRepeat;
        instance.autoPaused = false; // always starts auto un-paused
        instance.autoTimesOriginal = autoTimes; // store the original autoTimes for reference as we are going to decrement autoTimes
        instance.downloadEnabled = downloadEnabled;
        instance.downloadStrategy = downloadStrategy;
        instance.downloadExtensions = downloadExtensions;
        instance.downloadTags = downloadTags;
        instance.downloadAttributes = downloadAttributes;
        instance.downloadSelector = downloadSelector;
        instance.downloadIncludes = downloadIncludes;
        instance.downloadExcludes = downloadExcludes;
        instance.downloadMinMB = downloadMinMB;
        instance.downloadMaxMB = downloadMaxMB;
        instance.downloadPreview = downloadPreview;
        const precalculateProps = backgroundPage.URLI.IncrementDecrement.precalculateURLs(instance);
        instance.urls = precalculateProps.urls;
        instance.urlsCurrentIndex = precalculateProps.currentIndex;
        backgroundPage.URLI.Background.setInstance(instance.tabId, instance);
        // Profile Save
        if (profileSave) {
          const profiles = localItems_ && localItems_.profiles && Array.isArray(localItems_.profiles)? localItems_.profiles : [],
                url1 = url.substring(0, selectionStart),
                url2 = url.substring(selectionStart + selection.length),
                urlsalt1 = backgroundPage.URLI.Encryption.generateSalt(),
                urlsalt2 = backgroundPage.URLI.Encryption.generateSalt();
          console.log("URLI.Popup.setup() - saving a URL to local storage...");
          // Check if this URL has already been saved, if it has remove the existing saved profile
          if (profiles && profiles.length > 0) {
            for (let i = 0; i < profiles.length; i++) {
              const result = await backgroundPage.URLI.Background.profileMatchesURL(profiles[i], url);
              if (result.matches) {
                console.log("URLI.Popup.setup() - this URL has already been saved, so removing the old entry");
                profiles.splice(i, 1);
                break;
              }
            }
          }
          const urlhash1 = await backgroundPage.URLI.Encryption.calculateHash(url1, urlsalt1);
          const urlhash2 = await backgroundPage.URLI.Encryption.calculateHash(url2, urlsalt2);
          // Put this new entry at the beginning of the array (unshift) as it's more likely to be used than older ones
          profiles.unshift({
            "urlhash1": urlhash1,
            "urlhash2": urlhash2,
            "urlsalt1": urlsalt1,
            "urlsalt2": urlsalt2,
            "url2length": url.substring(selectionStart + selection.length).length,
            "selectionStart": selectionStart, "interval": interval, "base": base, "baseCase": baseCase, "leadingZeros": leadingZeros,
            "errorSkip": errorSkip, "errorCodes":  instance.errorCodes, "errorCodesCustomEnabled": instance.errorCodesCustomEnabled, "errorCodesCustom": instance.errorCodesCustom
          });
          chrome.storage.local.set({
            "profiles": profiles
          });
        }
        // If popup can overwrite increment/decrement settings, write to storage
        if (instance.enabled && items_.popupSettingsCanOverwrite) {
          chrome.storage.sync.set({
            "interval": interval,
            "base": base,
            "baseCase": baseCase,
            "errorSkip": errorSkip
          });
        }
        if (instance.autoEnabled) {
          chrome.storage.sync.set({
            "autoAction": autoAction,
            "autoSeconds": autoSeconds,
            "autoTimes": autoTimes,
            "autoWait": autoWait,
            "autoBadge": autoBadge,
            "autoRepeat": autoRepeat
          });
        }
        if (instance.downloadEnabled) {
          chrome.storage.sync.set({
            "downloadStrategy": downloadStrategy,
            "downloadExtensions": downloadExtensions,
            "downloadTags": downloadTags,
            "downloadAttributes": downloadAttributes,
            "downloadSelector": downloadSelector,
            "downloadIncludes": downloadIncludes,
            "downloadExcludes": downloadExcludes,
            "downloadMinMB": downloadMinMB,
            "downloadMaxMB": downloadMaxMB,
            "downloadPreview": downloadPreview
          });
        }
        // If internal shortcuts permissions granted, send message to shortcuts content script to add key/mouse listeners:
        if (items_.permissionsInternalShortcuts && items_.keyEnabled && !items_.keyQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addKeyListener"});
        }
        if (items_.permissionsInternalShortcuts && items_.mouseEnabled && !items_.mouseQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addMouseListener"});
        }
        // If auto is enabled, ask Auto to start auto timer
        if (instance.autoEnabled) {
          backgroundPage.URLI.Auto.startAutoTimer(instance);
        }
        toggleView.call(DOM["#accept-button"]);
        });
      });
    }
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded,
    messageListener: messageListener
  };
}();

// Popup Listeners
document.addEventListener("DOMContentLoaded", URLI.Popup.DOMContentLoaded);
chrome.runtime.onMessage.addListener(URLI.Popup.messageListener);