/**
 * URL Incrementer Increment Decrement
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.IncrementDecrement = function () {

  /**
   * Finds a selection in the url to increment or decrement depending on the preference.
   *
   * "Prefixes" Preference:
   * Looks for terms and common prefixes that come before numbers, such as
   * page=, pid=, p=, next=, =, and /. Example URLs with prefixes (= and /):
   * http://www.google.com?page=1234
   * http://www.google.com/1234
   *
   * "Last Number" Preference:
   * Uses the last number in the url.
   *
   * "First Number": Preference:
   * Uses the first number in the url.
   *
   * If no numbers exist in the URL, returns an empty selection.
   *
   * @param url        the url to find the selection in
   * @param preference the preferred strategy to use to find the selection
   * @param custom     the JSON object with custom regular expression parameters
   * @return JSON object {selection, selectionStart}
   * @public
   */
  function findSelection(url, preference, custom) {
    // Regular Expressions:
    // Firefox: Lookbehind is not supported yet in FF as of Version 61.1 (Supported in Chrome 62+) so using convoluted alternatives, lookbehinds are enclosed in comments below
    const repag = /page=\d+/, // RegExp to find a number with "page=" TODO: replace with lookbehind regex /(?<=page)=(\d+)/
          reter = /(?:(pid|p|next|id)=\d+)/, // RegExp to find numbers with common terms like "id=" TODO: replace with lookbehind regex /(?<=pid|p|next|id)=(\d+)/
          repre = /(?:[=\/]\d+)(?!.*[=\/]\d+)/, // RegExp to find the last number with a prefix (= or /) TODO: Don't capture the = or / so substring(1) is no longer needed
          relas = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
          refir = /\d+/, // RegExg to find the first number in the url
          recus = preference === "custom" && custom ? new RegExp(custom.pattern, custom.flags) : undefined, // RegExp Custom (if set by user) TODO: Validate custom regex with current url for alphanumeric selection
    // Matches:
          mapag = repag.exec(url),
          mater = reter.exec(url),
          mapre = repre.exec(url),
          malas = relas.exec(url),
          mafir = refir.exec(url),
          macus = recus ? recus.exec(url) : undefined;
    console.log("URLI.IncrementDecrement.findSelection() - matches: pag=" + mapag + ", ter=" + mater + ", pre=" + mapre + ", las=" + malas + ", fir=" + mafir + ", cus=" + macus);
    return preference === "prefixes" ?
              mapag ? {selection: mapag[0].substring(5), selectionStart: mapag.index + 5} :
              mater ? {selection: mater[0].substring(mater[1].length + 1), selectionStart: mater.index + mater[1].length + 1} :
              mapre ? {selection: mapre[0].substring(1), selectionStart: mapre.index + 1} :
              malas ? {selection: malas[0], selectionStart: malas.index} :
              {selection: "", selectionStart: -1} :
           preference === "lastnumber" ?
              malas ? {selection: malas[0], selectionStart: malas.index} :
              {selection: "", selectionStart: -1} :
           preference === "firstnumber" ?
              mafir ? {selection: mafir[0], selectionStart: mafir.index} :
              {selection: "", selectionStart: -1} :
           preference === "custom" ?
              macus && macus[custom.group] ? {selection: macus[custom.group].substring(custom.index), selectionStart: macus.index + custom.index} :
              mapag ? {selection: mapag[0].substring(5), selectionStart: mapag.index + 5} :
              mater ? {selection: mater[0].substring(mater[1].length), selectionStart: mater.index + mater[1].length} :
              mapre ? {selection: mapre[0].substring(1), selectionStart: mapre.index + 1} :
              malas ? {selection: malas[0], selectionStart: malas.index} :
              {selection: "", selectionStart: -1} :
          {selection: "", selectionStart: -1};
  }

  /**
   * Modifies the URL by either incrementing or decrementing the specified
   * selection.
   *
   * @param action         the action to perform (increment or decrement)
   * @param url            the URL that will be modified
   * @param selection      the selected part in the URL to modify
   * @param selectionStart the starting index of the selection in the URL
   * @param interval       the amount to increment or decrement
   * @param base           the base to use (the supported base range is 2-36)
   * @param baseCase       the case to use for letters (lowercase or uppercase)
   * @param leadingZeros   if true, pad with leading zeros, false don't pad
   * @return JSON object {urlmod: modified url, selectionmod: modified selection}
   * @public
   */
  function modifyURL(action, url, selection, selectionStart, interval, base, baseCase, leadingZeros) {
    let urlmod,
        selectionmod,
        selectionint = parseInt(selection, base); // parseInt base range is 2-36
    // Increment or decrement the selection; if increment is above Number.MAX_SAFE_INTEGER or decrement is below 0, set to upper or lower bounds
    selectionmod = action === "increment" ? (selectionint + interval <= Number.MAX_SAFE_INTEGER ? selectionint + interval : Number.MAX_SAFE_INTEGER).toString(base) :
                   action === "decrement" ? (selectionint - interval >= 0 ? selectionint - interval : 0).toString(base) :
                   "";
    if (leadingZeros && selection.length > selectionmod.length) { // Leading 0s
      selectionmod = "0".repeat(selection.length - selectionmod.length) + selectionmod;
    }
    if (/[a-z]/i.test(selectionmod)) { // If Alphanumeric, convert case
      selectionmod = baseCase === "lowercase" ? selectionmod.toLowerCase() : baseCase === "uppercase" ? selectionmod.toUpperCase() : selectionmod;
    }
    // Append: part 1 of the URL + modified selection + part 2 of the URL
    urlmod = url.substring(0, selectionStart) + selectionmod + url.substring(selectionStart + selection.length);
    return {urlmod: urlmod, selectionmod: selectionmod};
  }

  /**
   * Modifies the URL by either incrementing or decrementing the specified
   * selection and performs error skipping.
   *
   * @param action               the action to perform (increment or decrement)
   * @param instance             the instance containing the URL properties
   * @param errorSkipRemaining   the number of times left to skip while performing this action
   * @param errorCodeEncountered whether or not an error code has been encountered yet while performing this action
   * @public
   */
  function modifyURLAndSkipErrors(action, instance, errorSkipRemaining, errorCodeEncountered) {
    console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - instance.errorCodes=" + instance.errorCodes +", instance.errorCodesCustomEnabled=" + instance.errorCodesCustomEnabled + ", instance.errorCodesCustom=" + instance.errorCodesCustom  + ", errorSkipRemaining=" + errorSkipRemaining);
    const origin = document.location.origin,
          urlOrigin = new URL(instance.url).origin;
    let urlProps;
    // TODO:
    // If Custom URLs or Shuffle URLs, use the urls array to increment or decrement, don't call IncrementDecrement.modifyURL
    if ((instance.customURLs || instance.shuffleURLs) && instance.urls && instance.urls.length > 0) {
      const urlsLength = instance.urls.length;
      urlProps =
        (!instance.autoEnabled && action === "increment") || (action === instance.autoAction) ?
          instance.urls[instance.urlsCurrentIndex + 1 < urlsLength ? !instance.autoEnabled ? ++instance.urlsCurrentIndex : instance.urlsCurrentIndex++ : urlsLength - 1] :
          instance.urls[instance.urlsCurrentIndex - 1 >= 0 ? !instance.autoEnabled ? --instance.urlsCurrentIndex : instance.urlsCurrentIndex-- : 0];
    } else {
      urlProps = modifyURL(action, instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros);
    }
    instance.url = urlProps.urlmod;
    instance.selection = urlProps.selectionmod;
    // We check that the current page's origin matches the instance's URL origin as we otherwise cannot use fetch due to CORS
    if (origin === urlOrigin && errorSkipRemaining > 0) {
      fetch(urlProps.urlmod, { method: "HEAD", credentials: "same-origin" }).then(function(response) {
        if (response && response.status &&
            ((instance.errorCodes && (
            (instance.errorCodes.includes("404") && response.status === 404) ||
            (instance.errorCodes.includes("3XX") && ((response.status >= 300 && response.status <= 399) || response.redirected)) || // Note: 301,302,303,307,308 return response.status of 200 and must be checked by response.redirected
            (instance.errorCodes.includes("4XX") && response.status >= 400 && response.status <= 499) ||
            (instance.errorCodes.includes("5XX") && response.status >= 500 && response.status <= 599))) ||
            (instance.errorCodesCustomEnabled && instance.errorCodesCustom &&
            (instance.errorCodesCustom.includes(response.status + "") || (response.redirected && ["301", "302", "303", "307", "308"].some(redcode => instance.errorCodesCustom.includes(redcode))))))) { // response.status + "" because custom array stores string inputs
          console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - request.url= " + urlProps.urlmod);
          console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - response.url=" + response.url);
          console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - skipping this URL because response.status was in errorCodes or response.redirected, response.status=" + response.status);
          // setBadgeSkipErrors, but only need to send message the first time an errorCode is encountered
          if (!errorCodeEncountered) {
            chrome.runtime.sendMessage({greeting: "setBadgeSkipErrors", "errorCode": response.redirected ? "RED" : response.status, "instance": instance});
          }
          // Recursively call this method again to perform the action again and skip this URL, decrementing errorSkipRemaining and setting errorCodeEncountered to true
          modifyURLAndSkipErrors(action, instance, errorSkipRemaining - 1, true);
        } else {
          console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - not attempting to skip this URL because response.status=" + response.status  + " and it was not in errorCodes. aborting and updating tab");
          chrome.runtime.sendMessage({greeting: "incrementDecrementSkipErrors", "instance": instance});
        }
      }).catch(e => {
        console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - a fetch() exception was caught:" + e);
        chrome.runtime.sendMessage({greeting: "setBadgeSkipErrors", "errorCode": "ERR", "instance": instance});
        chrome.runtime.sendMessage({greeting: "incrementDecrementSkipErrors", "instance": instance});
      });
    } else {
      console.log("URLI.IncrementDecrement.modifyURLAndSkipErrors() - " + (origin !== urlOrigin ? "the instance's URL origin does not match this page's URL origin" : "we have exhausted the errorSkip attempts") + ". aborting and updating tab ");
      chrome.runtime.sendMessage({greeting: "incrementDecrementSkipErrors", "instance": instance});
    }
  }

  function precalculateURLs(instance) {
    console.log("URLI.IncrementDecrement.precalculateURLs() - precalculating URLs for an instance that is " + (instance.toolkitEnabled ?  "toolkitEnabled" : instance.autoEnabled ? "autoEnabled" : "normal"));
    let urls = [], currentIndex = 0;
    if (instance.toolkitEnabled || instance.customURLs || instance.shuffleURLs) {
      // Custom URLs are treated the same in all modes
      if (instance.customURLs) {
        urls = buildCustomURLs(instance);
        currentIndex = -1; // Start the index at -1 because 0 will be the first URL in the custom URLs array
      } else if (instance.toolkitEnabled) {
        urls = buildURLs(instance, instance.toolkitAction, instance.toolkitQuantity);
      } else if (instance.autoEnabled) {
        urls = buildURLs(instance, instance.autoAction, instance.autoTimes);
      } else {
        const shuffleLimit = URLI.Background.getItems().shuffleLimit;
        const urlsIncrement = buildURLs(instance, "increment", shuffleLimit / 2);
        const urlsDecrement = buildURLs(instance, "decrement", shuffleLimit / 2);
        const urlOriginal = [{"urlmod": instance.url, "selectionmod": instance.selection}];
        currentIndex = urlsDecrement.length;
        urls = [...urlsDecrement, ...urlOriginal, ...urlsIncrement];
      }
    }
    return {"urls": urls, "currentIndex": currentIndex};
  }

  function buildURLs(instance, action, threshold) {
    console.log("URLI.IncrementDecrement.buildURLs() - instance.url=" + instance.url + ", instance.selection=" + instance.selection + ", action=" + action + ", threshold=" + threshold);
    const urls = [];
    let url = instance.url,
      selection = instance.selection;
    // If Toolkit Generate URLs first include the original URL for completeness and include it in the threshold
    if (instance.toolkitEnabled && instance.toolkitTool === "generate-links") {
      urls.push({"urlmod": url, "selectionmod": selection});
      threshold--;
    }
    for (let i = 0; i < threshold; i++) {
      const urlProps = modifyURL(action, url, selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros);
      url = urlProps.urlmod;
      selection = urlProps.selectionmod;
      urls.push({"urlmod": url, "selectionmod": selection});
      const selectionint = parseInt(selection, instance.base);
      if (selectionint <= 0 || selectionint >= Number.MAX_SAFE_INTEGER) {
        break;
      }
    }
    if (instance.shuffleURLs) {
      shuffle(urls);
    }
    return urls;
  }

  function buildCustomURLs(instance) {
    const urls = [];
    for (let url of instance.urls) {
      // Only need to construct an object the first time TODO: Should we construct the objects this from the get-go in popup's instance.urls array so we don't have to do this?
      if (instance.autoRepeatCount === 0) {
        urls.push({"urlmod": url, "selectionmod": ""});
      } else {
        urls.push(url);
      }
    }
    if (instance.shuffleURLs) {
      shuffle(urls);
    }
    return urls;
  }

  /**
   * Shuffles an array into random indices using the Durstenfeld shuffle, a computer-optimized version of Fisher-Yates.
   * Note: This function is written by Laurens Holst.
   *
   * @param array the array to shuffle
   * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
   * @see https://stackoverflow.com/a/12646864
   * @private
   */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
    }
    return array;
  }

  // Return Public Functions
  return {
    findSelection: findSelection,
    modifyURL: modifyURL,
    modifyURLAndSkipErrors: modifyURLAndSkipErrors,
    precalculateURLs: precalculateURLs
  };
}();