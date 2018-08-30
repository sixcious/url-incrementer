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
   * https://www.google.com?page=1234
   * https://www.google.com/1234
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
   * @returns JSON object {selection, selectionStart}
   * @public
   */
  function findSelection(url, preference, custom) {
    let selectionProps;
    try {
      // Regular Expressions:
      // Firefox: Lookbehind is not supported yet in FF as of Version 61 (Supported in Chrome 62+) so using convoluted alternatives, lookbehinds are in comments below
      const repag = /page=\d+/i, // RegExp to find a number with "page=" TODO: replace with lookbehind regex /(?<=page)=(\d+)/i
            reter = /(?:(p|id|next)=\d+)/i, // RegExp to find numbers with common terms like "id=" TODO: replace with lookbehind regex /(?<=p|id|next)=(\d+)/i
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
      selectionProps =
        preference === "prefixes" ?
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
    } catch(e) {
      console.log("URLI.IncrementDecrement.findSelection() - exception encountered:" + e);
      selectionProps = {selection: "", selectionStart: -1};
    }
    return selectionProps;
  }

  // Called by Popup and SaveURLs TODO
  function validateSelection(selection, base, baseCase, dateFormat, custom) {
    let error = "";
    switch (base) {
      case "date":
        const selectionDate = URLI.IncrementDecrementDate.incrementDecrementDate("increment", selection, 0, dateFormat);
        console.log("selectionDat=" + selectionDate);
        if (selectionDate !== selection) {
          error = chrome.i18n.getMessage("date_invalid_error");
        }
        break;
      case "custom":
        break;
      default: // Base 2-36
        if (base < 2 || base > 36) {
          error = chrome.i18n.getMessage("base_invalid_error");
        } else if (!/^[a-z0-9]+$/i.test(selection)) {
          error = chrome.i18n.getMessage("selection_notalphanumeric_error");
        } else {
          const selectionInt = parseInt(selection, base);
          const selectionStr = selectionInt.toString(base);
          if (selectionInt >= Number.MAX_SAFE_INTEGER) {
            error = chrome.i18n.getMessage("selection_toolarge_error");
          } else if ((isNaN(selectionInt)) || (selection.toUpperCase() !== ("0".repeat(selection.length - selectionStr.length) + selectionStr.toUpperCase()))) {
            error = chrome.i18n.getMessage("selection_base_error");
          }
        }
        break;
    }
    return error;

    //POPUP:
    //         // [0] = Selection Errors
    //     _.base === "date" ?
    //       backgroundPage.URLI.IncrementDecrementDate.incrementDecrementDate("increment", _.selection, 0, _.baseDateFormat) !== _.selection ? chrome.i18n.getMessage("date_invalid_error") : ""
    //     :
    //       _.selection === "" ? chrome.i18n.getMessage("selection_blank_error") :
    //       !_.url.includes(_.selection) ? chrome.i18n.getMessage("selection_notinurl_error") :
    //       _.selectionStart < 0 || _.url.substr(_.selectionStart, _.selection.length) !== _.selection ? chrome.i18n.getMessage("selectionstart_invalid_error") :
    //       !/^[a-z0-9]+$/i.test(_.selection) ? chrome.i18n.getMessage("selection_notalphanumeric_error") :
    //       parseInt(_.selection, _.base) >= Number.MAX_SAFE_INTEGER ? chrome.i18n.getMessage("selection_toolarge_error") :
    //       isNaN(parseInt(_.selection, _.base)) || _.selection.toUpperCase() !== ("0".repeat(_.selection.length - _.selectionParsed.length) + _.selectionParsed.toUpperCase()) ? chrome.i18n.getMessage("selection_base_error") : "",




    // SAVE URLS:
    // const selection = url.substring(save.selectionStart, save.url2length > 0 ? url.lastIndexOf(url2) : url.length);
    // const selectionParsed = isNaN(save.base) ? undefined : parseInt(selection, save.base).toString(save.base);
    // Test for alphanumeric in the case where url2length is 0 but current url has a part 2
    // Test base matches selection for same reason
    // console.log("save.urlhash1=" + save.urlhash1);
    // console.log("urlhash1=" + urlhash1);
    // const matches = (urlhash1 === save.urlhash1) &&
    //   ((urlhash2 === save.urlhash2) ||
    // ((save.url2length === 0) &&
    //   /^[a-z0-9]+$/i.test(selection) &&
    //   selectionParsed ? !(isNaN(parseInt(selection, save.base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionParsed.length) + selectionParsed.toUpperCase())) :
    //   save.base === "date" && false)); // TODO date base
  }

  /**
   * TODO...
   * Handles an increment or decrement operation, acting as a controller.
   * The exact operation is dependant on the instance and can be a step thru URLs array or
   * incrementing / decrementing a URL depending on the the state of multi.
   *
   * @param action
   * @param instance
   * @public
   */
  function incrementDecrement(action, instance) {
    // If Custom URLs or Shuffle URLs, use the urls array to increment or decrement, don't increment the URL
    if ((instance.customURLs || instance.shuffleURLs) && instance.urls && instance.urls.length > 0) {
      URLI.IncrementDecrementArray.stepThruURLs(action, instance);
    }
    // If multi is enabled and doing a main action (no number), simultaneously increment multiple parts of the URL:
    else if (instance.multiEnabled && !/\d/.test(action)) {
      console.log("instance.multiEnabled=" + instance.multiEnabled + ", instance.mutliCount=" + instance.multiCount);
      for (let i = 1; i <= instance.multiCount; i++) {
        incrementDecrementURL(action + i, instance);
      }
    }
    // All Other Cases: Increment Decrement URL
    else {
      incrementDecrementURL(action, instance);
    }
  }

    /**
   * Increments or decrements a URL using an instance object that contains the URL
   * while performing error skipping.
   *
   * @param action               the action to perform (increment or decrement)
   * @param instance             the instance containing the URL and parameters used to increment or decrement
   * @param context              the context this method is running in ("background" or "content-script")
   * @param errorSkipRemaining   the number of times left to skip while performing this action
   * @param errorCodeEncountered whether or not an error code has been encountered yet while performing this action
   * @public
   */
  function incrementDecrementAndSkipErrors(action, instance, context, errorSkipRemaining, errorCodeEncountered) {
    console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - instance.errorCodes=" + instance.errorCodes +", instance.errorCodesCustomEnabled=" + instance.errorCodesCustomEnabled + ", instance.errorCodesCustom=" + instance.errorCodesCustom  + ", errorSkipRemaining=" + errorSkipRemaining);
    const origin = document.location.origin,
          urlOrigin = new URL(instance.url).origin;
    incrementDecrement(action, instance);
    // Unless the context is background (e.g. Enhanced Mode <all_urls> permissions), we check that the current page's origin matches the instance's URL origin as we otherwise cannot use fetch due to CORS
    if ((context === "background" || (origin === urlOrigin)) && errorSkipRemaining > 0) {
      // fetch using credentials: same-origin to keep session/cookie state alive (to avoid redirect false flags e.g. after a user logs in to a website)
      fetch(instance.url, { method: "HEAD", credentials: "same-origin" }).then(function(response) {
        if (response && response.status &&
            ((instance.errorCodes && (
            (instance.errorCodes.includes("404") && response.status === 404) ||
            (instance.errorCodes.includes("3XX") && ((response.status >= 300 && response.status <= 399) || response.redirected)) || // Note: 301,302,303,307,308 return response.status of 200 and must be checked by response.redirected
            (instance.errorCodes.includes("4XX") && response.status >= 400 && response.status <= 499) ||
            (instance.errorCodes.includes("5XX") && response.status >= 500 && response.status <= 599))) ||
            (instance.errorCodesCustomEnabled && instance.errorCodesCustom &&
            (instance.errorCodesCustom.includes(response.status + "") || (response.redirected && ["301", "302", "303", "307", "308"].some(redcode => instance.errorCodesCustom.includes(redcode))))))) { // response.status + "" because custom array stores string inputs
          console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - request.url= " + instance.url);
          console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - response.url=" + response.url);
          console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - skipping this URL because response.status was in errorCodes or response.redirected, response.status=" + response.status);
          const request = { "greeting": "setBadge", "badge": "skip", "temporary": true, "text": response.redirected ? "RED" : response.status + "", "instance": instance};
          if (context === "background") { URLI.Background.messageListener(request, { "tab": { "id": instance.tabId } }, function() {}); }
          else { chrome.runtime.sendMessage(request); }
          // Recursively call this method again to perform the action again and skip this URL, decrementing errorSkipRemaining and setting errorCodeEncountered to true
          incrementDecrementAndSkipErrors(action, instance, context, errorSkipRemaining - 1, true);
        } else {
          console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - not attempting to skip this URL because response.status=" + response.status  + " and it was not in errorCodes. aborting and updating tab");
          const request = {greeting: "incrementDecrementSkipErrors", "instance": instance};
          if (context === "background") { URLI.Background.messageListener(request, { "tab": { "id": instance.tabId } }, function() {}); }
          else { chrome.runtime.sendMessage(request);}
        }
      }).catch(e => {
        console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - a fetch() exception was caught:" + e);
        // const request1 = {greeting: "setBadgeSkipErrors", "errorCode": "ERR", "instance": instance};
        // const request2 = {greeting: "incrementDecrementSkipErrors", "instance": instance};
        // if (context === "background") { URLI.Background.messageListener(request1, { "tab": { "id": instance.tabId } }, function() {}); URLI.Background.messageListener(request2, { "tab": { "id": instance.tabId } }, function() {}); }
        // else { chrome.runtime.sendMessage(request1); chrome.runtime.sendMessage(request2); }
        const request = { "greeting": "setBadge", "badge": "skip", "temporary": true, "text": "ERR", "instance": instance};
        if (context === "background") { URLI.Background.messageListener(request, { "tab": { "id": instance.tabId } }, function() {}); }
        else { chrome.runtime.sendMessage(request); }
        // Recursively call this method again to perform the action again and skip this URL, decrementing errorSkipRemaining and setting errorCodeEncountered to true
        incrementDecrementAndSkipErrors(action, instance, context, errorSkipRemaining - 1, true);
      });
    } else {
      console.log("URLI.IncrementDecrement.incrementDecrementAndSkipErrors() - " + (context === "context-script" && origin !== urlOrigin ? "the instance's URL origin does not match this page's URL origin" : "we have exhausted the errorSkip attempts") + ". aborting and updating tab ");
      const request = {greeting: "incrementDecrementSkipErrors", "instance": instance};
      if (context === "background") { URLI.Background.messageListener(request, { "tab": { "id": instance.tabId } }, function() {}); }
      else { chrome.runtime.sendMessage(request); }
    }
  }

  /**
   * Increments or decrements a URL using an instance object that contains the URL.
   *
   * @param action   the action to perform (increment or decrement)
   * @param instance the instance containing the URL and parameters used to increment or decrement
   * @private
   */
  function incrementDecrementURL(action, instance) {
    URLI.IncrementDecrementMulti.multiPre(action, instance);
    const url = instance.url, selection = instance.selection, selectionStart = instance.selectionStart,
          interval = instance.interval, leadingZeros = instance.leadingZeros,
          base = instance.base, baseCase = instance.baseCase, dateFormat = instance.baseDateFormat, baseCustom = instance.baseCustom;
    let selectionmod;
    // Perform the increment or decrement operation depending on the base type
    switch(base) {
      case "date":
        selectionmod = URLI.IncrementDecrementDate.incrementDecrementDate(action, selection, interval, dateFormat);
        break;
      case "custom":
        selectionmod = incrementDecrementBaseCustom(action, selection, interval, base, baseCustom, leadingZeros);
        break;
      // case "alphanumeric":
      default:
        selectionmod = incrementDecrementAlphanumeric(action, selection, interval, base, baseCase, leadingZeros);
        break;
    }
    // Append: part 1 of the URL + modified selection + part 2 of the URL. (Note: We can't cache part1 and part2 at the beginning due to multi)
    const urlmod = url.substring(0, selectionStart) + selectionmod + url.substring(selectionStart + selection.length);
    URLI.IncrementDecrementMulti.multiPost(selectionmod, urlmod, instance);
    instance.url = urlmod;
    instance.selection = selectionmod;
  }

  /**
   * Performs a regular (alphanumeric) increment or decrement operation on the selection.
   *
   * @param action       the action (increment or decrement)
   * @param selection    the selected part to increment or decrement
   * @param interval     the amount to increment or decrement by
   * @param base         the base to use (the supported base range is 2-36, 10 is default/decimal)
   * @param baseCase     the base case to use for letters (lowercase or uppercase)
   * @param leadingZeros if true, pad with leading zeros, false don't pad
   * @returns {string} the modified selection after incrementing or decrementing it
   * @private
   */
  function incrementDecrementAlphanumeric(action, selection, interval, base, baseCase, leadingZeros) {
    let selectionmod;
    const selectionint = parseInt(selection, base); // parseInt base range is 2-36
    // Increment or decrement the selection; if increment is above Number.MAX_SAFE_INTEGER or decrement is below 0, set to upper or lower bounds
    selectionmod = action.startsWith("increment") ? (selectionint + interval <= Number.MAX_SAFE_INTEGER ? selectionint + interval : Number.MAX_SAFE_INTEGER).toString(base) :
                   action.startsWith("decrement") ? (selectionint - interval >= 0 ? selectionint - interval : 0).toString(base) :
                   "";
    // If Leading 0s, pad with 0s
    if (leadingZeros && selection.length > selectionmod.length) {
      selectionmod = "0".repeat(selection.length - selectionmod.length) + selectionmod;
    }
    // If Alphanumeric, convert case
    if (/[a-z]/i.test(selectionmod)) {
      selectionmod = baseCase === "lowercase" ? selectionmod.toLowerCase() : baseCase === "uppercase" ? selectionmod.toUpperCase() : selectionmod;
    }
    return selectionmod;
  }

  function incrementDecrementBaseCustom(action, selection, interval, base, baseCase, leadingZeros) {
    const set = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let selectionmod = "";
    let base10num = 0;
    // Part 1 Decode Base to Decimal
    for (let i = selection.length - 1, digit = 0; i >= 0; i--, digit++) {
      const num = set.indexOf(selection[i]);
      base10num += num * (base ** digit);
      console.log("num=" + num);
      console.log("base10num=" + num);
    }
    console.log("base10num done decode=" + base10num);

    // Increment
    base10num += action.startsWith("increment") ? interval : -interval;

    // Part 2 Encode Decimal to Base
    // TODO handle 0 (return set[0])
    while (base10num > 0) {
      const remainder = base10num % base;
      selectionmod = `${set[remainder]}${selectionmod}`;
      base10num = Math.floor(base10num / base);
    }
    console.log("base10num done encode=" + base10num);
    console.log("selectionmod=" + selectionmod);
    return selectionmod;
  }

  // Return Public Functions
  return {
    findSelection: findSelection,
    validateSelection: validateSelection,
    incrementDecrement: incrementDecrement,
    incrementDecrementAndSkipErrors: incrementDecrementAndSkipErrors
  };
}();

URLI.IncrementDecrementMulti = function () {

  /**
   * Pre-handles a multi-incrementing instance before incrementDecrementURL().
   *
   * @param action   the action (increment or decrement, for multi, this may have a 2 or 3 at the end e.g. increment3)
   * @param instance the instance to handle
   * @private
   */
  function multiPre(action, instance) {
    if (instance && instance.multiEnabled) {
      // Set the current instance properties with the multi part's properties for incrementDecrementURL()
      const match = /\d+/.exec(action),
            part = match ? match[0] : "";
      // multiPart is stored later for multiPost() so we don't have to execute the above regex again
      instance.multiPart = part;
      instance.selection = instance.multi[part].selection;
      instance.selectionStart = instance.multi[part].selectionStart;
      instance.interval = instance.multi[part].interval;
      instance.base = instance.multi[part].base;
      instance.baseCase = instance.multi[part].baseCase;
      instance.baseDateFormat = instance.multi[part].baseDateFormat;
      instance.leadingZeros = instance.multi[part].leadingZeros;
    }
  }

  /**
   * Post-handles a multi-incrementing instance after incrementDecrementURL().
   *
   * @param selectionmod the modified selection
   * @param urlmod       the modified URL
   * @param instance     the instance to handle
   * @private
   */
  function multiPost(selectionmod, urlmod, instance) {
    if (instance && instance.multiEnabled) {
      // Update the multi selection part's to the new selection
      instance.multi[instance.multiPart].selection = selectionmod;
      // If after incrementing/decrementing, the url length changed update the other parts' selectionStart
      if (instance.url && instance.url.length !== urlmod.length) {
        const urlLengthDiff = instance.url.length - urlmod.length; // Handles both positive and negative changes (e.g. URL became shorter or longer)
        const thisPartSelectionStart = instance.multi[instance.multiPart].selectionStart;
        console.log("URLI.IncrementDecrement.multiPost() - part=" + instance.multiPart + ", urlLengthDiff=" + urlLengthDiff + "thisPartSelectionStart=" + thisPartSelectionStart);
        // If this part isn't the last part, adjust the selectionStarts of the other parts that come later in the URL
        for (let i = 1; i <= instance.multiCount; i++) {
          if (i !== instance.multiPart && instance.multi[i].selectionStart > thisPartSelectionStart) {
            console.log("URLI.IncrementDecrement.multiPost() - adjusted part" + i + "'s selectionStart from: " + instance.multi[i].selectionStart + " to:" + (instance.multi[i].selectionStart - urlLengthDiff));
            instance.multi[i].selectionStart = instance.multi[i].selectionStart - urlLengthDiff;
          }
        }
      }
    }
  }
  // Return Public Functions
  return {
    multiPre: multiPre,
    multiPost: multiPost
  };
}();

URLI.IncrementDecrementDate = function () {

  const mmm = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const mmmm = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

  /**
   * Performs an increment decrement operation on the date selection string.
   *
   * Legend -   y: year, m: month, d: day, h: hour, i: minute, s: second, l: millisecond
   * Patterns - yyyy | yy, mmmm | mmm | mm | m, dd | d, hh | h, ii | i, ss | s, ll | l
   * Examples - mm/dd/yyyy, dd-m-yyyy, mm/yy, hh/mm/ss
   *
   * @param action
   * @param selection
   * @param interval
   * @param dateFormat
   * @returns {string | *}
   * @public
   */
  function incrementDecrementDate(action, selection, interval, dateFormat) {
    console.log("URLI.IncrementDecrement.incrementDecrementDate() - action=" + action + ", selection=" + selection + ", interval=" + interval + ", dateFormat=" + dateFormat);
    let selection2 = "";
    try {
      const parts = URLI.IncrementDecrementDate.splitParts(selection, dateFormat);
      const date = URLI.IncrementDecrementDate.str2date(parts.strParts, parts.dateFormatParts);
      const date2 = URLI.IncrementDecrementDate.incdecdate(action, date, dateFormat, interval);
      selection2 = URLI.IncrementDecrementDate.date2str(date2, dateFormat, parts.dateFormatParts);
    } catch(e) {
      console.log("URLI.Background.IncrementDecrement.incrementDecrementDate() - exception encountered=" + e);
      selection2 = "DateError";
    }
    return selection2;
  }

  function splitParts(str, dateFormat) {
    const regexp = /(y+)|(m+)|(Mm+)|(M+)|(d+)|(h+)|(i+)|(l+)|([^ymMdhisl]+)/g;
    const matches = dateFormat.match(regexp);
    let delimiters = "";
    for (let match of matches) {
      if (/^(?![ymMdhisl])/.exec(match)) {
        delimiters += (delimiters ? "|" : "") + match;
      }
    }

    let dateFormatParts = [], strParts = [];
    if (delimiters !== "") {
      const delimitersregexp = new RegExp(delimiters, "g");
      dateFormatParts = dateFormat.split(delimitersregexp).filter(Boolean);
      strParts = str.split(delimitersregexp).filter(Boolean);
    } else {
      // variable widths:
      // mmmm, Mmmm, MMMM, m, d, h, i, s, l
      dateFormatParts = matches;
      for (let i = 0; i < dateFormatParts.length; i++) {
        strParts[i] = str.substr(i > 0 ? dateFormatParts[i - 1].length  : 0, dateFormatParts[i].length); // use substr over substring here
      }
    }
    return { "dateFormatParts": dateFormatParts, "strParts": strParts };
  }

  function str2date(strParts, dateFormatParts) {
    const mapparts = new Map([["y", 2000], ["m", 1], ["d", 15], ["h", 12], ["i", 0], ["s", 0], ["l", 0]]);
    for (let i = 0; i < dateFormatParts.length; i++) {
      switch(dateFormatParts[i]) {
        case "yyyy": mapparts.set("y", strParts[i]); break;
        case "yy":   mapparts.set("y", parseInt(strParts[i]) > 70 ? "19" + strParts[i] : "20" + strParts[i]); break;
        case "mmmm": case "Mmmm": case"MMMM": mapparts.set("m", mmmm.findIndex(m => m === strParts[i].toLowerCase()) + 1); break;
        case "mmm": case"Mmm": case"MMM": mapparts.set("m", mmm.findIndex(m => m === strParts[i].toLowerCase()) + 1); break;
        case "mm":   mapparts.set("m", strParts[i]); break;
        case "m":    mapparts.set("m", strParts[i]); break;
        case "dd":   mapparts.set("d", strParts[i]); break;
        case "d":    mapparts.set("d", strParts[i]); break;
        case "hh":   mapparts.set("h", strParts[i]); break;
        case "h":    mapparts.set("h", strParts[i]); break;
        case "ii":   mapparts.set("i", strParts[i]); break;
        case "i":    mapparts.set("i", strParts[i]); break;
        case "ss":   mapparts.set("s", strParts[i]); break;
        case "s":    mapparts.set("s", strParts[i]); break;
        case "ll":   mapparts.set("l", strParts[i]); break;
        case "l":    mapparts.set("l", strParts[i]); break;
        default: break;
      }
    }
    return new Date(mapparts.get("y"), mapparts.get("m") - 1, mapparts.get("d"), mapparts.get("h"), mapparts.get("i"), mapparts.get("s"), mapparts.get("l"));
  }

  // @see https://stackoverflow.com/a/39196460
  function incdecdate(action, date, dateFormat, interval) {
    interval = action.startsWith("increment") ? interval : -interval;
    const lowestregexp = /(l|(s|i|h|d|M|m|y(?!.*m))(?!.*M)(?!.*d)(?!.*h)(?!.*i)(?!.*s)(?!.*l))/;
    const lowestmatch = lowestregexp.exec(dateFormat)[0];
    switch(lowestmatch) {
      case "l": date.setMilliseconds(date.getMilliseconds() + interval); break;
      case "s": date.setSeconds(date.getSeconds() + interval); break;
      case "i": date.setMinutes(date.getMinutes() + interval); break;
      case "h": date.setHours(date.getHours() + interval); break;
      case "d": date.setDate(date.getDate() + interval); break;
      case "m": case "M": date = new Date(date.getFullYear(), date.getMonth() + interval); break;
      case "y": date.setFullYear(date.getFullYear() + interval); break;
      default: break;
    }
    return date;
  }

  function date2str(date, dateFormat, dateFormatParts) {
    let str = dateFormat;
    for (let i = 0; i < dateFormatParts.length; i++) {
      switch (dateFormatParts[i]) {
        case "yyyy": str = str.replace(dateFormatParts[i], date.getFullYear()); break;
        case "yy":   str = str.replace(dateFormatParts[i], (date.getFullYear() + "").substring(2)); break;
        case "mmmm": str = str.replace(dateFormatParts[i], mmmm[date.getMonth()]); break;
        case "Mmmm": str = str.replace(dateFormatParts[i], mmmm[date.getMonth()][0].toUpperCase() + mmmm[date.getMonth()].substring(1)); break;
        case "MMMM": str = str.replace(dateFormatParts[i], mmmm[date.getMonth()].toUpperCase()); break;
        case "mmm":  str = str.replace(dateFormatParts[i], mmm[date.getMonth()]); break;
        case "Mmm":  str = str.replace(dateFormatParts[i], mmm[date.getMonth()][0].toUpperCase() + mmm[date.getMonth()].substring(1)); break;
        case "MMM":  str = str.replace(dateFormatParts[i], mmm[date.getMonth()].toUpperCase()); break;
        case "mm":   str = str.replace(dateFormatParts[i], (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)); break;
        case "m":    str = str.replace(dateFormatParts[i], date.getMonth() + 1); break;
        case "dd":   str = str.replace(dateFormatParts[i], date.getDate() < 10 ? "0" + date.getDate() : date.getDate()); break;
        case "d":    str = str.replace(dateFormatParts[i], date.getDate()); break;
        case "hh":   str = str.replace(dateFormatParts[i], date.getHours() < 10 ? "0" + date.getHours() : date.getHours()); break;
        case "h":    str = str.replace(dateFormatParts[i], date.getHours()); break;
        case "ii":   str = str.replace(dateFormatParts[i], date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()); break;
        case "i":    str = str.replace(dateFormatParts[i], date.getMinutes()); break;
        case "ss":   str = str.replace(dateFormatParts[i], date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()); break;
        case "s":    str = str.replace(dateFormatParts[i], date.getSeconds()); break;
        case "ll":   str = str.replace(dateFormatParts[i], "0".repeat(3 - (date.getMilliseconds() + "").length) + date.getMilliseconds()); break;
        case "l":    str = str.replace(dateFormatParts[i], date.getMilliseconds()); break;
        default: break;
      }
    }
    return str;
  }

  // Return Public Functions
  return {
    incrementDecrementDate: incrementDecrementDate,
    splitParts: splitParts,
    str2date: str2date,
    incdecdate: incdecdate,
    date2str: date2str
  };
}();

URLI.IncrementDecrementArray = function () {

    /**
   * Steps to the next or previous position in the URLs array.
   * This is used instead of incrementDecrementURL, for example when there is a URLs array (e.g. when Shuffle Mode is enabled).
   *
   * @param action   the action (increment moves forward, decrement moves backward in the array)
   * @param instance the instance containing the URLs array
   * @public
   */
  function stepThruURLs(action, instance) {
    console.log("URLI.IncrementDecrement.stepThruURLs() - performing increment/decrement on the urls array...");
    const urlsLength = instance.urls.length;
    console.log("URLI.IncrementDecrement.stepThruURLs() - action === instance.autoAction=" + (action === instance.autoAction) + ", action=" + action);
    console.log("URLI.IncrementDecrement.stepThruURLs() - instance.urlsCurrentIndex + 1 < urlsLength=" + (instance.urlsCurrentIndex + 1 < urlsLength) +", instance.urlsCurrentIndex=" + instance.urlsCurrentIndex + ", urlsLength=" + urlsLength);
    // Get the urlProps object from the next or previous position in the urls array and update the instance
    const urlProps =
      (!instance.autoEnabled && action === "increment") || (action === instance.autoAction) ?
        instance.urls[instance.urlsCurrentIndex + 1 < urlsLength ? !instance.autoEnabled || instance.customURLs ? ++instance.urlsCurrentIndex : instance.urlsCurrentIndex++ : urlsLength - 1] :
        instance.urls[instance.urlsCurrentIndex - 1 >= 0 ? !instance.autoEnabled ? --instance.urlsCurrentIndex : instance.urlsCurrentIndex-- : 0];
    instance.url = urlProps.urlmod;
    instance.selection = urlProps.selectionmod;
  }

  /**
   * Pre-calculates an array of URLs.
   *
   * @param instance
   * @returns {{urls: Array, currentIndex: number}}
   * @public
   */
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
        const shuffleLimit = instance.shuffleLimit; // EXT.Promisify.getItems().shuffleLimit;
        const urlsIncrement = buildURLs(instance, "increment", shuffleLimit / 2);
        const urlsDecrement = buildURLs(instance, "decrement", shuffleLimit / 2);
        const urlOriginal = [{"urlmod": instance.url, "selectionmod": instance.selection}];
        currentIndex = urlsDecrement.length;
        urls = [...urlsDecrement, ...urlOriginal, ...urlsIncrement];
      }
    }
    return {"urls": urls, "currentIndex": currentIndex};
  }

  function buildURLs(instance, action, limit) {
    console.log("URLI.IncrementDecrement.buildURLs() - instance.url=" + instance.url + ", instance.selection=" + instance.selection + ", action=" + action + ", limit=" + limit);
    const urls = [],
          url = instance.url,
          selection = instance.selection;
    // If Toolkit Generate URLs first include the original URL for completeness and include it in the limit
    if (instance.toolkitEnabled && instance.toolkitTool === "generate-links") {
      urls.push({"urlmod": url, "selectionmod": selection});
      limit--;
    }
    if (instance.multiEnabled && ((instance.multi[1] && instance.multi[1].range) || (instance.multi[2] && instance.multi[2].range)  || (instance.multi[3] && instance.multi[3].range))) { // TODO.. multi range incrementing
      buildMultiRangeURLs(instance, action, urls);
    } else {
      for (let i = 0; i < limit; i++) {
        URLI.IncrementDecrement.incrementDecrement(action, instance);
        urls.push({"urlmod": instance.url, "selectionmod": instance.selection});
        // Only exit if base is numeric and beyond bounds
        if (!isNaN(instance.base)) {
          const selectionint = parseInt(instance.selection, instance.base);
          if (selectionint <= 0 || selectionint >= Number.MAX_SAFE_INTEGER) {
            break;
          }
        }
      }
    }
    // Reset instance url and selection after calling incrementDecrementURL():
    instance.url = url;
    instance.selection = selection;
    if (instance.shuffleURLs) {
      shuffle(urls);
    }
    return urls;
  }

  function buildMultiRangeURLs(instance, action, urls) {
    // for (let i = 1; i <= instance.multiCount; i++) {
    //   for (let j = 2; j <= instance.multiCount; j++) {
    //     for (let k = 3; k <= instance.multiCount; k++) {
    //       multiSub(instance, action, urls, "3");
    //       instance.multi[3].selection = instance.multi[3].startingSelection;
    //     }
    //     multiSub(instance, action, urls, "2");
    //     instance.multi[2].selection = instance.multi[2].startingSelection;
    //   }
    //   multiSub(instance, action, urls, "1");
    //   instance.multi[1].selection = instance.multi[3].startingSelection;
    // }
    for (let i = 1; i <= instance.multiCount; i++) {
      instance.url = instance.url.replace(instance.multi[i].range[0], instance.multi[i].range[1]);
    }
    urls[0] = instance.url;
    for (let i = 0; i <= instance.multi[1].times; i++) {
      const preurl2 = instance.url;
      const press2 = instance.multi[2].selectionStart;
      const press3 = instance.multi[3].selectionStart;
      for (let j = 0; j <= instance.multi[2].times; j++) {
        const preurl3 = instance.url;
        // const press3 = instance.multi[3].selectionStart;
        for (let k = 0; k < instance.multi[3].times; k++) {
          URLI.IncrementDecrement.incrementDecrement(action + "3", instance);
          urls.push({"urlmod": instance.url, "selectionmod": instance.selection});
        }
        instance.url = preurl3;
        if (j !== instance.multi[2].times) {
          URLI.IncrementDecrement.incrementDecrement(action + "2", instance);
          urls.push({"urlmod": instance.url, "selectionmod": instance.selection});
        }
        instance.multi[3].selection = instance.multi[3].startingSelection;
        // instance.multi[3].selectionStart = press3;
      }
      instance.url = preurl2;
      instance.multi[2].selection = instance.multi[2].startingSelection;
      instance.multi[2].selectionStart = press2;
      instance.multi[3].selectionStart = press3;
      if (i !== instance.multi[1].times) {
        URLI.IncrementDecrement.incrementDecrement(action + "1", instance);
        urls.push({"urlmod": instance.url, "selectionmod": instance.selection});
      }
      // instance.multi[2].selection = instance.multi[2].startingSelection;
      //  instance.multi[2].selectionStart = press2;
      // instance.multi[3].selectionStart = press3;
    }
  }

  function multiSub(instance, action, urls, part) {
    for (let i = 0; i < instance.multi[part].times; i++) {
      URLI.IncrementDecrement.incrementDecrement(action + part, instance);
      urls.push({"urlmod": instance.url, "selectionmod": instance.selection});
    }
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
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Return Public Functions
  return {
    stepThruURLs: stepThruURLs,
    precalculateURLs: precalculateURLs
  };
}();