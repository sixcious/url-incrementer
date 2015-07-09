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
   * @param url        the url to find the selection in
   * @param preference the preferred strategy to use to find the selection
   * @return JSON object {selection, selectionStart}
   * @public
   */
  function findSelection(url, preference) {
    // var re1 = /(?:=|\/)(\d+)/, // RegExp to find prefixes = and / with numbers
    //     re2 = /\d+(?!.*\d+)/, // RegExg to find the last number in the url
    //     matches1 = re1.exec(url),
    //     matches2 = re2.exec(url);
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
   * @param selection      the selected part in the URL to modify
   * @param selectionStart the starting index of the selection in the URL
   * @param interval       the amount to increment or decrement
   * @param base           the base to use (the supported base range is 2-36)
   * @param baseCase       the case to use for letters (lowercase or uppercase)
   * @param leadingZeros   if true, pad with leading zeros, false don't pad
   * @param direction      the direction to go: next/plus or prev/minus
   * @return JSON object {urlmod: modified url, selectionmod: modified selection}
   * @public
   */
  function modifyURL(url, selection, selectionStart, interval, base, baseCase, leadingZeros, direction) {
    var urlmod,
        selectionmod,
        selectionint = parseInt(selection, base); // parseInt base range is 2-36
    // Plus or minus the selection -- if minus is negative, set to 0 (low bound)
    selectionmod = direction === "next" ? (selectionint + interval).toString(base) :
                   direction === "prev" ? (selectionint - interval >= 0 ? selectionint - interval : 0).toString(base) :
                                        "";
    if (leadingZeros && selection.length > selectionmod.length) { // If Leading Zeros, pad 0s
      selectionmod = "0".repeat(selection.length - selectionmod.length) + selectionmod;
    }
    if (/[a-z]/i.test(selectionmod)) { // If Alphanumeric, convert case
      selectionmod = baseCase === "upperCase" ? selectionmod.toUpperCase() : baseCase === "lowerCase" ? selectionmod.toLowerCase() : selectionmod;
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