/**
 * URL Incrementer Popup
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Popup = function () {

  var instance = {}, // Tab instance cache
      items_ = {}, // Storage items cache
      DOM = {}, // Map to cache DOM elements: key=id, value=element
      AUTO_ETA_I18NS = { // AUTO ETA messages cache
        "day": chrome.i18n.getMessage("auto_eta_day"),
        "hour": chrome.i18n.getMessage("auto_eta_hour"), "hours": chrome.i18n.getMessage("auto_eta_hours"),
        "minute": chrome.i18n.getMessage("auto_eta_minute"), "minutes": chrome.i18n.getMessage("auto_eta_minutes"),
        "second": chrome.i18n.getMessage("auto_eta_second"), "seconds": chrome.i18n.getMessage("auto_eta_seconds"),
        "tbd": chrome.i18n.getMessage("auto_eta_tbd"), "done": chrome.i18n.getMessage("auto_eta_done")
       };

  /**
   * Loads the DOM content needed to display the popup page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    var ids = document.querySelectorAll("[id]"),
        i18ns = document.querySelectorAll("[data-i18n]"),
        el,
        i;
    // Cache DOM elements
    for (i = 0; i < ids.length; i++) {
      el = ids[i];
      DOM["#" + el.id] = el;
    }
    // Set i18n (internationalization) text from messages.json
    for (i = 0; i < i18ns.length; i++) {
      el = i18ns[i];
      el[el.dataset.i18n] = chrome.i18n.getMessage(el.id.replace(/-/g, '_').replace(/\*.*/, ''));
    }
    // Add Event Listeners to the DOM elements
    DOM["#increment-input"].addEventListener("click", clickActionButton);
    DOM["#decrement-input"].addEventListener("click", clickActionButton);
    DOM["#clear-input"].addEventListener("click", clickActionButton);
    DOM["#next-input"].addEventListener("click", clickActionButton);
    DOM["#prev-input"].addEventListener("click", clickActionButton);
    DOM["#download-input"].addEventListener("click", clickActionButton);
    DOM["#auto-input"].addEventListener("click", clickActionButton);
    DOM["#setup-input"].addEventListener("click", toggleView);
    DOM["#accept-button"].addEventListener("click", setup);
    DOM["#cancel-button"].addEventListener("click", toggleView);
    DOM["#options-button"].addEventListener("click", function() { chrome.runtime.openOptionsPage(); });
    DOM["#url-textarea"].addEventListener("select", selectURL);
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; });
    DOM["#auto-toggle-input"].addEventListener("change", function() { DOM["#auto"].className = this.checked ? "display-block fade-in" : "display-none"; });
    DOM["#auto-times-input"].addEventListener("change", updateAutoETA);
    DOM["#auto-seconds-input"].addEventListener("change", updateAutoETA);
    DOM["#download-toggle-input"].addEventListener("change", function() { DOM["#download"].className = this.checked ? "display-block fade-in" : "display-none"; if (this.checked) { updateDownloadPreview(); } });
    DOM["#download-strategy-select"].addEventListener("change", function() { changeDownloadStrategy.call(this); updateDownloadPreview(); });
    DOM["#download-types"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-types input", "#download-types-generated"); updateDownloadPreview(); });
    DOM["#download-tags"].addEventListener("change", function() { translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated"); updateDownloadPreview(); });
    DOM["#download-selector-input"].addEventListener("focusout", updateDownloadPreview);
    DOM["#download-includes-input"].addEventListener("focusout", updateDownloadPreview);
    DOM["#download-excludes-input"].addEventListener("focusout", updateDownloadPreview);
    DOM["#download-preview-compressed-input"].addEventListener("change", function() { DOM["#download-preview-table-div"].style = this.checked ? "white-space: normal;" : "white-space: nowrap;" }); 
    // Initialize popup content
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      chrome.storage.sync.get(null, function(items) {
        items_ = items;
        chrome.runtime.getBackgroundPage(function(backgroundPage) {
          instance = backgroundPage.URLI.Background.getInstance(tabs[0].id);
          if (!instance) {
            instance = backgroundPage.URLI.Background.buildInstance(tabs[0], items);
          }
          updateControls();
          DOM["#increment-input"].style = DOM["#decrement-input"].style = DOM["#clear-input"].style = DOM["#setup-input"].style = DOM["#next-input"].style = DOM["#prev-input"].style = DOM["#download-input"].style = DOM["#auto-input"].style = "width:" + items_.popupButtonSize + "px; height:" + items_.popupButtonSize + "px;";
          DOM["#setup-input"].className = items_.popupAnimationsEnabled ? "hvr-grow" : "";
          updateSetup();
          // Jump straight to Setup if instance isn't enabled and if the option is set in storage items
          if ((!instance.enabled && !instance.autoEnabled && !instance.downloadEnabled) && items_.popupOpenSetup) {
            toggleView.call(DOM["#setup-input"]);
          }
        });
      });
    });
  }

  /**
   * Listen for requests from chrome.runtime.sendMessage (Background)
   * 
   * @public
   */
  function messageListener(request, sender, sendResponse) {
    switch (request.greeting) {
      case "updatePopupInstance":
        if (request.instance && request.instance.tabId === instance.tabId) {
          instance = request.instance;
          updateControls();
          updateSetup();
        }
        break;
      case "updatePopupDownloadPreview":
        if (request.instance && request.instance.tabId == instance.tabId) {
          console.log("received a message to updateDownloadPreview");
          updateDownloadPreview();
        }
        break;
      default:
        break;
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
    var action = this.dataset.action;
    if (((action === "increment" || action === "decrement") && instance.enabled) ||
        (action === "next" || action === "prev") ||
        (action === "clear" && (instance.enabled || instance.autoEnabled || instance.downloadEnabled)) ||
        (action === "auto" && instance.autoEnabled) ||
        (action === "download" && instance.downloadEnabled)) {
      if (items_.popupAnimationsEnabled) {
        URLI.UI.clickHoverCss(this, "hvr-push-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLI.Background.performAction(instance, action, "popupClickActionButton", function(result) {
          instance = result;
          updateControls();
        });
      });
    }
  }

  /**
   * Updates the control images based on whether the instance is enabled.
   * 
   * @private
   */
  function updateControls() {
    DOM["#increment-input"].className = 
    DOM["#decrement-input"].className = instance.enabled ? items_.popupAnimationsEnabled ? "hvr-grow"  : "" : instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev") ? "display-none" : "disabled";
    DOM["#next-input"].className =
    DOM["#prev-input"].className = (items_.permissionsEnhancedMode && items_.nextPrevPopupButtons) || (instance.autoEnabled && (instance.autoAction === "next" || instance.autoAction === "prev")) ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "display-none";
    DOM["#clear-input"].className = instance.enabled || instance.autoEnabled || instance.downloadEnabled ? items_.popupAnimationsEnabled ? "hvr-grow" : "" : "disabled";
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
    // Auto Setup:
    DOM["#auto-toggle-input"].checked = instance.autoEnabled;
    DOM["#auto"].className = instance.autoEnabled ? "display-block" : "display-none";
    DOM["#auto-action-select"].value = instance.autoAction;
    DOM["#auto-times-input"].value = instance.autoTimes;
    DOM["#auto-seconds-input"].value = instance.autoSeconds;
    DOM["#auto-wait-input"].checked = instance.autoWait;
    DOM["#auto-badge-input"].checked = instance.autoBadge === "times";
    updateAutoETA();
    // Download Setup:
    DOM["#download-toggle"].style = items_.permissionsDownload ? "" : "display: none;";
    DOM["#download-toggle-input"].checked = instance.downloadEnabled;
    DOM["#download"].className = instance.downloadEnabled ? "display-block" : "display-none";
    DOM["#download-strategy-select"].value = instance.downloadStrategy;
    DOM["#download-types-generated"].value = instance.downloadTypes && Array.isArray(instance.downloadTypes) ? instance.downloadTypes.join(",") : "";
    DOM["#download-tags-generated"].value = instance.downloadTags && Array.isArray(instance.downloadTags) ? instance.downloadTags.join(",") : "";
    DOM["#download-selector-input"].value = instance.downloadSelector;
    DOM["#download-includes-input"].value = instance.downloadIncludes && Array.isArray(instance.downloadIncludes) ? instance.downloadIncludes.join(",") : "";
    DOM["#download-excludes-input"].value = instance.downloadExcludes && Array.isArray(instance.downloadExcludes) ? instance.downloadExcludes.join(",") : "";
    DOM["#download-min-mb-input"].value = instance.downloadMinMB && instance.downloadMinMB > 0 ? instance.downloadMinMB : "";
    DOM["#download-max-mb-input"].value = instance.downloadMaxMB && instance.downloadMaxMB > 0 ? instance.downloadMaxMB : "";
    DOM["#download-preview-compressed-input"].checked = items_.downloadPreviewCompressed;
    DOM["#download-preview-table-div"].style = items_.downloadPreviewCompressed ? "white-space: normal;" : "white-space: nowrap;";
    //DOM["#download-same-domain-input"].checked = instance.downloadSameDomain;
    //DOM["#download-enforce-mime-input"].checked = instance.downloadEnforceMime;
    //DOM["#download-preview-all-input"].checked = items_.downloadPreviewAll;
    changeDownloadStrategy.call(DOM["#download-strategy-select"]);
    if (DOM["#download-toggle-input"].checked) {
      updateDownloadPreview();
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
    var itimes = +DOM["#auto-times-input"].value,
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
    DOM["#download-types"].className = this.value === "types" ? "display-block fade-in" : "display-none";
    DOM["#download-tags"].className = this.value === "tags" ? "display-block fade-in" : "display-none";
    DOM["#download-selector"].className = this.value === "selector" ? "display-block fade-in" : "display-none";
    DOM["#download-strategy-help"].title =
      this.value === "types" ? chrome.i18n.getMessage("download_help_types_title") :
      this.value === "tags" ? chrome.i18n.getMessage("download_help_tags_title") :
      this.value === "selector" ? chrome.i18n.getMessage("download_help_selector_title") :
      this.value === "page" ? chrome.i18n.getMessage("download_help_page_title") : "";
    DOM["#download-strategy-help-label"].textContent = 
      this.value === "types" ? chrome.i18n.getMessage("download_help_types_label") :
      this.value === "tags" ? chrome.i18n.getMessage("download_help_tags_label") :
      this.value === "selector" ? chrome.i18n.getMessage("download_help_selector_label") :
      this.value === "page" ? chrome.i18n.getMessage("download_help_page_label") : "";
  }

  /**
   * TODO TODO TODO TODO TODO TODO
   *
   * @private
   */
  function updateDownloadPreview() {
    console.log("updateDownloadPreview()");
//    translateCheckboxValuesToHiddenInput("#download-types input", "#download-types-generated");
//    translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated");
    var downloadStrategy = DOM["#download-strategy-select"].value,
        downloadTypes = DOM["#download-types-generated"].value.split(","),
        downloadTags = DOM["#download-tags-generated"].value.split(","),
        downloadSelector = DOM["#download-selector-input"].value,
        downloadIncludes = DOM["#download-includes-input"].value ? DOM["#download-includes-input"].value.replace(/\s+/g, "").split(",") : [],
        downloadExcludes = DOM["#download-excludes-input"].value ? DOM["#download-excludes-input"].value.replace(/\s+/g, "").split(",") : [];
        //downloadSameDomain = DOM["#download-same-domain-input"].checked,
        //downloadEnforceMime = DOM["#download-enforce-mime-input"].checked,
    chrome.tabs.executeScript(instance.tabId, {file: "js/download.js", runAt: "document_end"}, function() {
      const code = "URLI.Download.previewDownloadURLs(" +
        JSON.stringify(downloadStrategy) + ", " +
        JSON.stringify(downloadTypes) + ", " +
        JSON.stringify(downloadTags) + ", " +
        JSON.stringify(downloadSelector) + ", " +
        JSON.stringify(downloadIncludes) + ", " +
        JSON.stringify(downloadExcludes) + ");";
      chrome.tabs.executeScript(instance.tabId, {code: code, runAt: "document_end"}, function (results) {
        if (results && results[0]) {
          var downloadPreviewHeadingTitle = "",
              checkboxExtensions = "",
              checkboxTags = "",
              table = "",
              i = 1,
              goodLength = results[0].good.length,
              totalLength = results[0].good.length + results[0].bad.length;
          downloadPreviewHeadingTitle = "<span style=\"color: " + (goodLength > 0 ? "#05854D" : "#E6003E") + "\">Set to download " + results[0].good.length + " out of " + (results[0].good.length + results[0].bad.length) + " URLs</span>";
          for (let extension of results[0].allExtensions) {
            checkboxExtensions +=
              "<label>" +
                "<input value=\"" + extension + "\" type=\"checkbox\"" + (downloadTypes && downloadTypes.includes(extension) ? "checked=\"checked\"" : "") +  "\/>" +
                "<span>" + extension + "<\/span>" +
              "<\/label>";
          }
          for (let tag of results[0].allTags) {
            checkboxTags +=
              "<label>" +
                "<input value=\"" + tag + "\" type=\"checkbox\"" + (downloadTags && downloadTags.includes(tag) ? "checked=\"checked\"" : "") +  "\/>" +
                "<span>" + tag + "<\/span>" +
              "<\/label>";
          }
          table = "<table>" + 
                    "<colgroup>" + 
                      "<col style=\"width: 5%;\"><col style=\"width: 7%;\"><col style=\"width: 10%;\"><col style=\"width: 9%;\"><col style=\"width: 9%;\"><col style=\"width: 60%;\"></colgroup>" + 
                    "<thead><tr><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>Ext</th><th>Tag</th><th>URL</th></tr></thead><tbody>";
          for (let download of results[0].good) {
            table += "<tr><td><img src=\"../img/font-awesome/green/check-circle.png\" alt=\"\" width=\"16\" height=\"16\"/></td><td>" + (i++) + "</td><td>" + downloadPreviewThumb(download) + "</td><td>" + download.ext + "</td><td>" + download.tag + "</td><td>" + download.url  + "</td></tr>";
          }
          for (let download of results[0].bad) {
            table += "<tr><td><img src=\"../img/font-awesome/black/check-circle.png\" alt=\"\" width=\"16\" height=\"16\" style=\"opacity: 0.1;\"/></td><td>" + (i++) + "</td><td>" + downloadPreviewThumb(download) + "</td><td>" + download.ext + "</td><td>" + download.tag + "</td><td>" +  download.url  + "</td></tr>";
          }
          table += "</tbody></table>";
          DOM["#download-preview-heading-title"].innerHTML = downloadPreviewHeadingTitle;
          DOM["#download-types"].innerHTML = checkboxExtensions;
          DOM["#download-tags"].innerHTML = checkboxTags;
          DOM["#download-preview-table-div"].innerHTML = table;
          // Need to now update the hidden inputs again in case they contain values NOT in the page's current selections
          // e.g. If the instance/storage had extension "jpg" saved and there is no jpg on this page, this removes it
          //translateHiddenInputToCheckboxValues("#download-types-generated", "#download-types input");
          //translateHiddenInputToCheckboxValues("#download-tags-generated", "#download-tags input");
          //translateCheckboxValuesToHiddenInput("#download-types input", "#download-types-generated");
          //translateCheckboxValuesToHiddenInput("#download-tags input", "#download-tags-generated");
        } else {
          DOM["#download-preview-table-div"].innerHTML = "NO RESULTS, sad panda :(";
        }
      });
    });
  }

  /**
   * TODO
   *
   * @param download
   * @returns {string} html of the thumb
   * @private
   */
  function downloadPreviewThumb(download) {
    var html = "";
    if (download) {
      if (download.tag === "img" || download.ext === "jpg" || download.ext === "jpeg" || download.ext === "png" || download.ext === "gif" || download.ext === "svg") {
        html = "<img src=\"" + download.url + "\" alt=\"\" width=\"32\"/>";
      } else if (download.tag === "video" || download.ext === "webm" || download.ext === "mp4") {
        html = "<video src=\"" + download.url + "\" width=\"32\"/>";
      }
    }
    return html;
  }

  /**
   * TODO
   * "#download-types input" "#download-tags input"
   * "#download-types-generated" "#download-tags-generated"
   * @private
   */
  function translateCheckboxValuesToHiddenInput(selectorInputs, generatedId) {
    var inputs = document.querySelectorAll(selectorInputs),
        generated = "";
    for (let input of inputs) {
      if (input.checked) {
        generated += (generated !== "" ? "," : "") + input.value;
      }
    }
    DOM[generatedId].value = generated;
  }

  // TODO OTher way!
  function translateHiddenInputToCheckboxValues(generatedId, selectorInputs) {
    var inputs = document.querySelectorAll(selectorInputs),
        generated = DOM[generatedId].value.split(",");
    for (let input of inputs) {
      if (generated.includes(input.value) || (instance.downloadEnabled && (selectorInputs.includes("download-types") ? instance.downloadTypes.includes(input.value) : instance.downloadTags.includes(input.value)))) {
        input.checked = true;
      }
    }
  }
  
  /**
   * Sets up the instance in increment decrement mode. First validates user input for any
   * errors, then saves and enables the instance, then toggles the view back to
   * the controls.
   * 
   * @private
   */
  function setup() {
    var url = DOM["#url-textarea"].value,
        selection = DOM["#selection-input"].value,
        selectionStart = +DOM["#selection-start-input"].value,
        interval = +DOM["#interval-input"].value,
        base = +DOM["#base-select"].value,
        baseCase = DOM["#base-case-uppercase-input"].checked ? "uppercase" : DOM["#base-case-lowercase-input"].checked ? "lowercase" : undefined,
        selectionParsed = parseInt(selection, base).toString(base),
        leadingZeros = DOM["#leading-zeros-input"].checked,
        errorSkip = +DOM["#error-skip-input"].value,
        autoEnabled = DOM["#auto-toggle-input"].checked,
        autoAction = DOM["#auto-action-select"].value,
        autoTimes = +DOM["#auto-times-input"].value,
        autoSeconds = +DOM["#auto-seconds-input"].value,
        autoWait = DOM["#auto-wait-input"].checked,
        autoBadge = DOM["#auto-badge-input"].checked ? "times" : "",
        downloadEnabled = DOM["#download-toggle-input"].checked,
        downloadStrategy = DOM["#download-strategy-select"].value,
        downloadSelector = DOM["#download-selector-input"].value,
        //downloadSameDomain = DOM["#download-same-domain-input"].checked,
        //downloadEnforceMime = DOM["#download-enforce-mime-input"].checked,
        downloadIncludes = DOM["#download-includes-input"].value ? DOM["#download-includes-input"].value.replace(/\s+/g, "").split(",") : [],
        downloadExcludes = DOM["#download-excludes-input"].value ? DOM["#download-excludes-input"].value.replace(/\s+/g, "").split(",") : [],
        downloadMinMB = +DOM["#download-min-mb-input"].value,
        downloadMaxMB = +DOM["#download-max-mb-input"].value,
        downloadPreviewCompressed = DOM["#download-preview-compressed-input"].checked,
        //downloadPreviewAll = DOM["#download-preview-all-input"].checked,
        downloadTypes = DOM["#download-types-generated"].value.split(","),
        downloadTags = DOM["#download-tags-generated"].value.split(","),

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
          errorSkip < 0 || errorSkip > 10 ? chrome.i18n.getMessage("error_skip_invalid_error") : ""
        ],
        autoErrors = [ // Auto Errors
          autoEnabled && (autoAction === "next" || autoAction === "prev") && !items_.permissionsEnhancedMode ? chrome.i18n.getMessage("auto_next_prev_error") : "",
          autoEnabled && (autoTimes < 1 || autoTimes > 1000) ? chrome.i18n.getMessage("auto_times_invalid_error") : "",
          autoEnabled && (autoSeconds < 1 || autoSeconds > 3600) ? chrome.i18n.getMessage("auto_seconds_invalid_error") : "",
          autoEnabled && (autoSeconds * autoTimes > 86400) ? chrome.i18n.getMessage("auto_eta_toohigh_error") : ""
        ],
        downloadErrors = [ // Download Errors
          downloadEnabled && !items_.permissionsDownload ? chrome.i18n.getMessage("download_enabled_error") : "",
          // TODO: downloadEnabled && downloadStrategy === "types" &&  downloadTypes.includes(""),
          // TODO: downloadEnabled && downloadStrategy === "selector" && document.querySelectorAll(JSON.stringify(selector)) ? "" : ""
        ],
        errorsExist = errors.some(error => error !== ""),
        autoErrorsExist = autoErrors.some(error => error !== ""),
        downloadErrorsExist = downloadErrors.some(error => error !== ""),
        enabled = !errorsExist && autoEnabled ? (autoAction !== "next" && autoAction !== "prev") : !errorsExist,
        
/*
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
                 //autoAction === "next" || autoAction === "prev"
                   !downloadEnabled ?
                     !autoErrorsExist :
                     !autoErrorsExist && !downloadErrorsExist :
                 downloadEnabled && !autoEnabled && !downloadErrorsExist;
                 
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

    // We can tell there was an error if some of the array slots weren't empty
    else {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLI.Background.performAction(instance, "clear", "popupClearBeforeSet", function() {
        instance.enabled = enabled;
        instance.selection = selection;
        instance.selectionStart = selectionStart;
        instance.interval = interval;
        instance.base = base;
        instance.baseCase = baseCase;
        instance.leadingZeros = leadingZeros;
        instance.errorSkip = errorSkip;
        instance.autoEnabled = autoEnabled;
        instance.autoAction = autoAction;
        instance.autoTimesOriginal = autoTimes;
        instance.autoTimes = autoTimes;
        instance.autoSeconds = autoSeconds;
        instance.autoWait = autoWait;
        instance.autoBadge = autoBadge,
        instance.downloadEnabled = downloadEnabled;
        instance.downloadStrategy = downloadStrategy;
        instance.downloadTypes = downloadTypes;
        instance.downloadTags = downloadTags;
        instance.downloadSelector = downloadSelector;
        //instance.downloadSameDomain = downloadSameDomain;
        //instance.downloadEnforceMime = downloadEnforceMime;
        instance.downloadIncludes = downloadIncludes;
        instance.downloadExcludes = downloadExcludes;
        instance.downloadMinMB = downloadMinMB;
        instance.downloadMaxMB = downloadMaxMB;
        backgroundPage.URLI.Background.setInstance(instance.tabId, instance);
//        console.log("is there an instance in background after the popup clears it?");
//        console.log(backgroundPage.URLI.Background.getInstance(instance.tabId));
        // If popup can overwrite settings, write to storage
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
            "autoBadge": autoBadge
          });
        }
        if (instance.downloadEnabled) {
          chrome.storage.sync.set({
            "downloadStrategy": downloadStrategy,
            "downloadTypes": downloadTypes,
            "downloadTags": downloadTags,
            "downloadSelector": downloadSelector,
            //"downloadSameDomain": downloadSameDomain,
            //"downloadEnforceMime": downloadSameDomain,
            "downloadIncludes": downloadIncludes,
            "downloadExcludes": downloadExcludes,
            "downloadMinMB": downloadMinMB,
            "downloadMaxMB": downloadMaxMB,
            "downloadPreviewCompressed": downloadPreviewCompressed,
//            "downloadPreviewAll": downloadPreviewAll
          });
        }
        // If permissions granted, send message to content script:
        if (items_.permissionsInternalShortcuts && items_.keyEnabled && !items_.keyQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addKeyListener"});
        }
        if (items_.permissionsInternalShortcuts && items_.mouseEnabled && !items_.mouseQuickEnabled) {
          chrome.tabs.sendMessage(instance.tabId, {greeting: "addMouseListener"});
        }
        if (instance.autoEnabled) {
          backgroundPage.URLI.Auto.startAutoTimer(instance, function(result) {
            instance = result;
          });
        }
        toggleView.call(DOM["#accept-button"]);
        });
      });
    }
  }

  /**
   * Handle URL selection on select events. Saves the selectionStart
   * to a hidden input and updates the selection input to the selected text and
   * checks the leading zeros checkbox based on leading zeros present.
   * 
   * @private
   */
  function selectURL() {
    DOM["#selection-input"].value = window.getSelection().toString();
    DOM["#selection-start-input"].value = DOM["#url-textarea"].selectionStart;
    if (items_.leadingZerosPadByDetection) {
      DOM["#leading-zeros-input"].checked = DOM["#selection-input"].value.charAt(0) === '0' && DOM["#selection-input"].value.length > 1;
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