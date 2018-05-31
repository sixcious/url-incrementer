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
      AUTO_ETA_I18NS = {
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
    DOM["#url-textarea"].addEventListener("select", selectURL); // TODO: This causes a minor bug with trying to use the leading zeros checkbox unfortunately
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; });
    DOM["#auto-times-input"].addEventListener("change", updateAutoETA);
    DOM["#auto-seconds-input"].addEventListener("change", updateAutoETA);
    DOM["#download-strategy-select"].addEventListener("change", refreshDownloadOptions);
    DOM["#auto-toggle-input"].addEventListener("change", function() { DOM["#auto"].className = this.checked ? "display-block fade-in" : "display-none"; });
    DOM["#download-toggle-input"].addEventListener("change", function() { DOM["#download"].className = this.checked ? "display-block fade-in" : "display-none"; });
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
  
  function updateSetup() {
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
    DOM["#auto-toggle-input"].checked = instance.autoEnabled;
    DOM["#auto"].className = instance.autoEnabled ? "display-block" : "display-none";
    DOM["#auto-action-select"].value = instance.autoAction;
    DOM["#auto-times-input"].value = instance.autoTimes;
    DOM["#auto-seconds-input"].value = instance.autoSeconds;
    DOM["#auto-wait-input"].checked = instance.autoWait;
    DOM["#auto-badge-input"].checked = instance.autoBadge === "times";
    updateAutoETA();
    DOM["#download-toggle"].style = items_.permissionsDownload ? "" : "display: none;";
    DOM["#download-toggle-input"].checked = instance.downloadEnabled;
    DOM["#download"].className = instance.downloadEnabled ? "display-block" : "display-none";
    DOM["#download-strategy-select"].value = instance.downloadStrategy;
    for (let downloadType of instance.downloadTypes) {
      if (downloadType && downloadType !== "" && DOM["#download-types-" + downloadType + "-input"]) {
        DOM["#download-types-" + downloadType + "-input"].checked = true;
      }
    }
    DOM["#download-selector-input"].value = instance.downloadSelector;
    DOM["#download-same-domain-input"].checked = instance.downloadSameDomain;
    DOM["#download-enforce-mime-input"].checked = instance.downloadEnforceMime;
    DOM["#download-includes-input"].value = instance.downloadIncludes;
    DOM["#download-excludes-input"].value = instance.downloadExcludes;
    DOM["#download-min-mb-input"].value = instance.downloadMinMB && instance.downloadMinMB > 0 ? instance.downloadMinMB : "";
    DOM["#download-max-mb-input"].value = instance.downloadMaxMB && instance.downloadMaxMB > 0 ? instance.downloadMaxMB : "";
    refreshDownloadOptions.call(DOM["#download-strategy-select"]);
  }
  
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
    DOM["#auto-eta-value"].textContent = itimes < 0 || iseconds < 0 || (!hours && !minutes && !seconds) ? instance.autoEnabled ? AUTO_ETA_I18NS.done : AUTO_ETA_I18NS.tbd : 
                                         time > 86400 ? AUTO_ETA_I18NS.day : 
                                         fhours + fminutes + fseconds;
  }

  /**
   * TODO
   * @private
   */
  function refreshDownloadOptions() {
    DOM["#download-types"].className =
    DOM["#download-enforce-mime"].className = this.value === "types" ? "display-block fade-in" : "display-none";
    DOM["#download-selector"].className = this.value === "selector" ? "display-block fade-in" : "display-none";
    DOM["#download-same-domain"].className =
    DOM["#download-includes"].className =
    DOM["#download-excludes"].className =
    DOM["#download-min-mb"].className =
    DOM["#download-max-mb"].className = this.value === "page" ? "display-none" : "column fade-in";
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
        downloadTypes = [
          DOM["#download-types-jpeg-input"].checked ? DOM["#download-types-jpeg-input"].value : "",
          DOM["#download-types-png-input"].checked  ? DOM["#download-types-png-input"].value  : "",
          DOM["#download-types-gif-input"].checked  ? DOM["#download-types-gif-input"].value  : "",
          DOM["#download-types-mp3-input"].checked  ? DOM["#download-types-mp3-input"].value  : "",
          DOM["#download-types-mp4-input"].checked  ? DOM["#download-types-mp4-input"].value  : "",
          DOM["#download-types-webm-input"].checked  ? DOM["#download-types-webm-input"].value  : "",
          DOM["#download-types-zip-input"].checked  ? DOM["#download-types-zip-input"].value  : ""
        ],
        downloadSelector = DOM["#download-selector-input"].value,
        downloadSameDomain = DOM["#download-same-domain-input"].checked,
        downloadEnforceMime = DOM["#download-enforce-mime-input"].checked,
        downloadIncludes = DOM["#download-includes-input"].value,
        downloadExcludes = DOM["#download-excludes-input"].value,
        downloadMinMB = +DOM["#download-min-mb-input"].value,
        downloadMaxMB = +DOM["#download-max-mb-input"].value,
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
        validated = false;
        
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
        instance.downloadSelector = downloadSelector;
        instance.downloadSameDomain = downloadSameDomain;
        instance.downloadEnforceMime = downloadEnforceMime;
        instance.downloadIncludes = downloadIncludes;
        instance.downloadExcludes = downloadExcludes;
        instance.downloadMinMB = downloadMinMB;
        instance.downloadMaxMB = downloadMaxMB;
        backgroundPage.URLI.Background.setInstance(instance.tabId, instance);
        console.log("is there an instance in background after the popup clears it?");
        console.log(backgroundPage.URLI.Background.getInstance(instance.tabId));
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
            "downloadSelector": downloadSelector,
            "downloadSameDomain": downloadSameDomain,
            "downloadEnforceMime": downloadSameDomain,
            "downloadIncludes": downloadIncludes,
            "downloadExcludes": downloadExcludes,
            "downloadMinMB": downloadMinMB,
            "downloadMaxMB": downloadMaxMB
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