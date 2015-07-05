/**
 * URL Next Plus PlusMinus
 * 
 * @author Roy Six
 * @namespace
 */
var URLNP = URLNP || {};
URLNP.PlusMinus = URLNP.PlusMinus || function () {

  /**
   * Finds a selection in the url to modify (increment or decrement).
   * 
   * First looks for common prefixes that come before numbers, such as
   * = (equals) and / (slash). Example URLs with prefixes (= and /):
   * 
   * http://www.google.com?page=1234
   * http://www.google.com/1234
   * 
   * If no prefixes with numbers are found, uses the last number in the url. If
   * no numbers exist in the URL, returns an empty selection.
   * 
   * @param url the url to find the selection in
   * @return JSON object {selection, selectionStart}
   * @public
   */
  function findSelection(url) {
    var re1 = /(?:=|\/)(\d+)/, // RegExp to find prefixes = and / with numbers
        re2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
        matches;
    return (matches = re1.exec(url)) ? {selection: matches[1], selectionStart: matches.index + 1} :
           (matches = re2.exec(url)) ? {selection: matches[0], selectionStart: matches.index} :
                                       {selection: "", selectionStart: -1};
  }

  /**
   * Modifies the URL by either incrementing or decrementing the specified
   * selection.
   * 
   * @param url            the URL that will be modified
   * @param selection      the specific selection in the URL to modify
   * @param selectionStart the starting index of the selection in the URL
   * @param interval       the amount to increment or decrement
   * @param base           the base to use (from base 2- to base 36)
   * @param baseCase       the case to use for letters (lowercase or uppercase)
   * @param leadingZeros   if true, keep leading zeros, false don't keep them
   * @param direction      the direction to go: next/increment or prev/decrement
   * @return JSON object {urlm: modified url, selectionm: modified selection}
   * @public
   */
  function modifyURL(url, selection, selectionStart, interval, base, baseCase, leadingZeros, direction) {
    var urlm,
        selectionm,
        selectionint = parseInt(selection, base);
    // In case of minus producing negative, set selectionm to 0
    selectionm = direction === "next" ? (selectionint + interval).toString(base) :
                 direction === "prev" ? (selectionint - interval >= 0 ? selectionint - interval : 0).toString(base) :
                                        "";
    if ((leadingZeros || selection.charAt(0)) && selection.length > selectionm.length) { // If Leading Zeros, pad 0s
      selectionm = "0".repeat(selection.length - selectionm.length) + selectionm;
    }
    if (base > 10 || /[a-z]/i.test(selection)) { // If Alphanumeric, convert case
      selectionm = baseCase === "upperCase" ? selectionm.toUpperCase() : selectionm.toLowerCase();
    }
    urlm = url.substring(0, selectionStart) + selectionm + url.substring(selectionStart + selection.length);
    return {urlm: urlm, selectionm: selectionm};
  }

  // Return Public Functions
  return {
    findSelection: findSelection,
    modifyURL: modifyURL
  };
}();