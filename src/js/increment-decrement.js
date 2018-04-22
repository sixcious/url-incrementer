/**
 * URL Incrementer Increment Decrement
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.IncrementDecrement = URLI.IncrementDecrement || function () {

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
    var regexp1 = /(?:=|\/)(\d+)/, // RegExp to find numbers with prefixes (= /)
        regexp2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
        regexp3 = /((\d+)+?)/, // RegExg to find the first number in the url
        regexp4 = preference === "custom" && custom ? new RegExp(custom.pattern, custom.flags) : undefined,
        matches1 = regexp1.exec(url),
        matches2 = regexp2.exec(url),
        matches3 = regexp3.exec(url),
        matches4 = regexp4 ? regexp4.exec(url) : undefined,
        customparsed = matches4 && matches4[custom.group];
    // TODO: Validate custom regex with current url for alphanumeric selection
    return preference === "prefixes" ?
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            matches2 ? {selection: matches2[0], selectionStart: matches2.index} :
                            {selection: "", selectionStart: -1} :
           preference === "lastnumber" ?
                            matches2 ? {selection: matches2[0], selectionStart: matches2.index} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            {selection: "", selectionStart: -1} :
           preference === "firstnumber" ?
                            matches3 ? {selection: matches3[0], selectionStart: matches3.index} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            {selection: "", selectionStart: -1} :
           preference === "custom" && customparsed ? {selection: matches4[custom.group].substring(custom.index), selectionStart: matches4.index + custom.index} :
                            matches1 ? {selection: matches1[1], selectionStart: matches1.index + 1} :
                            matches2 ? {selection: matches2[0], selectionStart: matches2.index} :
                            {selection: "", selectionStart: -1};
  }

  /**
   * Modifies the URL by either incrementing or decrementing the specified
   * selection.
   *
   * @param url            the URL that will be modified
   * @param selection      the selected part in the URL to modify
   * @param selectionStart the starting index of the selection in the URL
   * @param interval       the amount to increment or decrement
   * @param base           the base to use (the supported base range is 2-36)
   * @param baseCase       the case to use for letters (lowercase or uppercase)
   * @param leadingZeros   if true, pad with leading zeros, false don't pad
   * @param operation      the mathematical operation to perform (increment or decrement)
   * @return JSON object {urlmod: modified url, selectionmod: modified selection}
   * @public
   */
  function modifyURL(url, selection, selectionStart, interval, base, baseCase, leadingZeros, operation) {
    var urlmod,
        selectionmod,
        selectionint = parseInt(selection, base); // parseInt base range is 2-36
    // Increment or decrement the selection; if decrement is negative, set to 0 (low bound)
    selectionmod = operation === "increment" ? (selectionint + interval).toString(base) :
                   operation === "decrement" ? (selectionint - interval >= 0 ? selectionint - interval : 0).toString(base) :
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

  // Return Public Functions
  return {
    findSelection: findSelection,
    modifyURL: modifyURL
  };
}();