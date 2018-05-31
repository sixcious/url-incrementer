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
   * Looks for common prefixes that come before numbers, such as
   * = (equals) and / (slash). Example URLs with prefixes (= and /):
   *
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
    var regexp0 = /(?<=page|pid|p|next)=(\d+)/, // RegExp to find numbers with more common terms and prefixes
        regexp1 = /(?:=|\/)(\d+)/, // RegExp to find numbers with prefixes (= /)
        regexp2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
        regexp3 = /((\d+)+?)/, // RegExg to find the first number in the url
        regexp4 = preference === "custom" && custom ? new RegExp(custom.pattern, custom.flags) : undefined,
        matches0 = regexp0.exec(url),
        matches1 = regexp1.exec(url),
        matches2 = regexp2.exec(url),
        matches3 = regexp3.exec(url),
        matches4 = regexp4 ? regexp4.exec(url) : undefined,
        customparsed = matches4 && matches4[custom.group];
    // TODO: Validate custom regex with current url for alphanumeric selection
    return preference === "prefixes" ?
                            matches0 ? {selection: matches0[1], selectionStart: matches0.index + 1} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            matches2 ? {selection: matches2[0], selectionStart: matches2.index} :
                            {selection: "", selectionStart: -1} :
           preference === "lastnumber" ?
                            matches2 ? {selection: matches2[0], selectionStart: matches2.index} :
                            matches0 ? {selection: matches0[1], selectionStart: matches0.index + 1} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            {selection: "", selectionStart: -1} :
           preference === "firstnumber" ?
                            matches3 ? {selection: matches3[0], selectionStart: matches3.index} :
                            matches0 ? {selection: matches0[1], selectionStart: matches0.index + 1} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            {selection: "", selectionStart: -1} :
           preference === "custom" && customparsed ? {selection: matches4[custom.group].substring(custom.index), selectionStart: matches4.index + custom.index} :
                            matches0 ? {selection: matches0[1], selectionStart: matches0.index + 1} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            matches2 ? {selection: matches2[0], selectionStart: matches2.index} :
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
    var urlmod,
        selectionmod,
        selectionint = parseInt(selection, base); // parseInt base range is 2-36
    // Increment or decrement the selection; if decrement is negative, set to 0 (low bound)
    selectionmod = action === "increment" ? (selectionint + interval).toString(base) :
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
   * TODO
   */
  function modifyURLAndSkipErrors(action, instance, errorSkipRemaining, errorCodeEncountered) {
    var origin = document.location.origin,
        urlOrigin = new URL(instance.url).origin,
        urlProps = modifyURL(action, instance.url, instance.selection, instance.selectionStart, instance.interval, instance.base, instance.baseCase, instance.leadingZeros);
    instance.url = urlProps.urlmod;
    instance.selection = urlProps.selectionmod;
    console.log("instance=");
    console.log(instance);
    console.log("errorSkipReamining=" + errorSkipRemaining);
    if (origin === urlOrigin && errorSkipRemaining > 0 && instance.errorCodes && instance.errorCodes.length > 0) {
      console.log("in the IF!!");
      fetch(urlProps.urlmod, { method: "HEAD" }).then(function(response) {
        console.log("response.status=" + response.status);
        console.log("errorCodes=" + instance.errorCodes);
          if (response && response.status &&
              ((instance.errorCodes.includes("404") && response.status === 404) ||
              (instance.errorCodes.includes("3XX") && response.status >= 300 && response.status < 400) ||
              (instance.errorCodes.includes("4XX") && response.status >= 400 && response.status < 500) ||
              (instance.errorCodes.includes("5XX") && response.status >= 500 && response.status < 600))) {
            //setBadgeSkipErrors, only send message the first time an errorCode is encountered
            if (!errorCodeEncountered) {
              chrome.runtime.sendMessage({greeting: "setBadgeSkipErrors", "errorCode": response.status, "instance": instance});
            }
            console.log("response.status was in errorCodes! attempting to skip this URL");
            modifyURLAndSkipErrors(action, instance, errorSkipRemaining - 1, true);
          } else {
            console.log("response.status was NOT in errorCodes. we are going to send a message to background to updateTab to this URL");
            chrome.runtime.sendMessage({greeting: "incrementDecrementSkipErrors", "instance": instance});
          }
        });
    } else {
      console.log("the if check failed, most likely we have exhausted the errorSkip attempts and are just going to send a message to background to updatetab to this URL");
      chrome.runtime.sendMessage({greeting: "incrementDecrementSkipErrors", "instance": instance});
    }
  }

  // Return Public Functions
  return {
    findSelection: findSelection,
    modifyURL: modifyURL,
    modifyURLAndSkipErrors: modifyURLAndSkipErrors
  };
}();