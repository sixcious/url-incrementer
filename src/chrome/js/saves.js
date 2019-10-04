/**
 * URL Incrementer
 * @file saves.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Saves = (() => {

  /**
   * Adds a saved URL. Note that wildcards and regexps are added in a separate function in Options.
   *
   * @param instance the instance's URL and settings to save
   * @public
   */
  async function addURL(instance) {
    console.log("addURL() - saving a URL to local storage...");
    // Check if this URL has already been saved, if it has delete the existing save, and split it into two parts (separated by the selection)
    const items = await Promisify.getItems(),
          saves = await deleteSave(instance.url, "addURL"),
          url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length),
          encrypt = await Cryptography.encrypt(url1 + url2, items.saveKey);
    // "Unshift" this new save to the START of the array because it's an exact url type (not a wildcard/regexp)
    saves.unshift({
      "type": "url", "ciphertext": encrypt.ciphertext, "iv": encrypt.iv, "date": new Date().toJSON(), "decodeURIEnabled": instance.decodeURIEnabled,
      "selectionEnd": url2.length, "selectionStart": instance.selectionStart, "interval": instance.interval, "leadingZeros": instance.leadingZeros,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "baseRoman": instance.baseRoman, "baseCustom": instance.baseCustom,
      "errorSkip": instance.errorSkip, "errorCodes": instance.errorCodes, "errorCodesCustom": instance.errorCodesCustom
    });
    chrome.storage.local.set({"saves": saves});
  }

  /**
   * Deletes a save by a plaintext URL.
   *
   * @param url    the plaintext URL to lookup this save by
   * @param caller the caller who is calling this function
   * @returns {Promise<{}>} the new saves array after deleting the save
   * @public
   */
  async function deleteSave(url, caller) {
    const items = await Promisify.getItems(),
          saves = items.saves,
          key = items.saveKey;
    for (let i = 0; i < saves.length; i++) {
      const result = await matchesSave(url, saves[i], key);
      // When adding a new URL, do not delete wildcards and regexps here, just the full URL collisions (unless caller was clear)
      if (result.matches && (saves[i].type === "url" || caller === "clear")) {
        console.log("deleteSave() - splicing an entry from the saves array...");
        saves.splice(i, 1);
        break;
      }
    }
    if (caller === "addURL" || caller === "addWildcard") {
      return saves;
    } else {
      chrome.storage.local.set({"saves": saves});
    }
  }

  /**
   * Tests if a plaintext URL matches a save of any type (url, wildcard, regexp).
   *
   * @param url  the plaintext URL to match
   * @param save the saved URL, wildcard, or regexp
   * @param key  the secret key used to decrypt a saved URL
   * @returns {Promise<{matches: boolean}>} the matches
   * @public
   */
  async function matchesSave(url, save, key) {
    let result = { matches: false };
    if (url && save && key) {
      if (save.type === "url") {
        result = await matchesURL(url, save, key);
      } else if (save.type === "wildcard") {
        result = await matchesWildcard(url, save, key);
      } else if (save.type === "regexp") {
        result = await matchesRegExp(url, save, key);
      }
    }
    return result;
  }

  /**
   * Tests if a saved URL matches a plaintext URL.
   *
   * @param url  the plaintext URL to match
   * @param save the saved URL
   * @param key  the secret key used to decrypt a saved URL
   * @returns {Promise<{matches: boolean, selection: {}}>} the matches with selection
   * @private
   */
  async function matchesURL(url, save, key) {
    const url1 = url.substring(0, save.selectionStart),
          url2 = url.substring(url.length - save.selectionEnd),
          surl = await Cryptography.decrypt(save.ciphertext, save.iv, key),
          selection = url.substring(save.selectionStart, url2 ? url.lastIndexOf(url2) : url.length);
    // We check that the saved url (now decrypted into plaintext) matches exactly with the url (url1 + url2) and validate the selection; if true, we found a match
    const matches = surl === (url1 + url2) && IncrementDecrement.validateSelection(selection, save.base, save.baseCase, save.baseDateFormat, save.baseRoman, save.baseCustom, save.leadingZeros) === "";
    return { matches: matches, selection: { selection: selection, selectionStart: save.selectionStart } };
  }

  /**
   * Tests if a saved wildcard matches a plaintext URL.
   *
   * @param url  the plaintext URL to match
   * @param save the saved wildcard
   * @param key  the secret key used to decrypt a saved URL
   * @returns {Promise<{matches: RegExpExecArray}>} the matches
   * @private
   */
  async function matchesWildcard(url, save, key) {
    const wildcard = await Cryptography.decrypt(save.ciphertext, save.iv, key),
          matches = url.includes(wildcard);
    return { matches: matches };
  }

  /**
   * Tests if a saved regexp matches a plaintext URL.
   *
   * @param url  the plaintext URL to match
   * @param save the saved regexp
   * @param key  the secret key used to decrypt a saved URL
   * @returns {Promise<{matches: RegExpExecArray}>} the matches
   * @private
   */
  async function matchesRegExp(url, save, key) {
    const regexp = await Cryptography.decrypt(save.ciphertext, save.iv, key),
          matches = new RegExp(regexp).exec(url);
    return { matches: matches };
  }

  // Return Public Functions
  return {
    addURL: addURL,
    deleteSave: deleteSave,
    matchesSave: matchesSave
  };

})();