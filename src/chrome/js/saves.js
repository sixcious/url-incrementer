/**
 * URL Incrementer
 * @file saves.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Saves = (() => {

  /**
   * Adds a saved URL, Wildcard, or Regular Expression.
   *
   * @param type     the type of save (url, wildcard, regexp)
   * @param instance the instance properties (saved urls only)
   * @param url      the url pattern (wildcards and regular expressions only)
   * @public
   */
  async function addSave(type, instance, url) {
    console.log("addSave() - saving a saved " + type + " to local storage...");
    // Check if this URL has already been saved, if it has delete the existing save
    const items = await Promisify.getItems();
    const saves = type === "url" ? await deleteSave(instance.url, "addURL") : await deleteSave(url, "addWildcard");
    const save = type === "url" ? await addURL(instance, items) : await addWildCardRegExp(url, type, items);
    // Unshift adds the save to the beginning of the saves array; then we sort it by order and date and save in storage
    saves.unshift(save);
    saves.sort((a, b) => (a.order > b.order) ? 1 : (a.order === b.order) ? ((a.date < b.date) ? 1 : -1) : -1);
    await Promisify.setItems("local", {"saves": saves});
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
    const items = await Promisify.getItems();
    const saves = items.saves;
    const key = items.saveKey;
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
   * Adds a saved URL. Note that wildcards and regexps are added in a separate function.
   *
   * @param instance the instance's URL and settings to save
   * @param items    the storage items
   * @private
   */
  async function addURL(instance, items) {
    console.log("addURL() - saving a URL to local storage...");
    const url1 = instance.url.substring(0, instance.selectionStart);
    const url2 = instance.url.substring(instance.selectionStart + instance.selection.length);
    const encrypt = await Cryptography.encrypt(url1 + url2, items.saveKey);
    return {
      "order": 1, "type": "url", "ciphertext": encrypt.ciphertext, "iv": encrypt.iv, "date": new Date().toJSON(), "decodeURIEnabled": instance.decodeURIEnabled,
      "selectionStart": instance.selectionStart, "selectionEnd": url2.length, "leadingZeros": instance.leadingZeros, "interval": instance.interval,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "baseRoman": instance.baseRoman, "baseCustom": instance.baseCustom,
      "errorSkip": instance.errorSkip, "errorCodes": instance.errorCodes, "errorCodesCustom": instance.errorCodesCustom
    };
  }

  /**
   * Adds a saved wildcard or regular expression. Note that URLs are added in a separate function.
   *
   * @param url   the URL pattern of the wildcard or regexp
   * @param type  the type of save (wildcard or regexp)
   * @param items the storage items containing the save settings
   * @private
   */
  async function addWildCardRegExp(url, type, items) {
    console.log("addWildcardRegExp() - saving a Wildcard or Regular Expression to local storage...");
    const encrypt = await Cryptography.encrypt(url, items.saveKey);
    // Don't save the selection custom test URL (that gets put into the save object being returned below)
    if (items.selectionCustom && items.selectionCustom.url) {
      items.selectionCustom.url = "";
    }
    return {
      "order": type === "wildcard" ? 2 : 3, "type": type, "ciphertext": encrypt.ciphertext, "iv": encrypt.iv, "date": new Date().toJSON(), "decodeURIEnabled": items.decodeURIEnabled,
      "selectionPriority": items.selectionPriority, "selectionCustom": items.selectionCustom, "leadingZerosPadByDetection": items.leadingZerosPadByDetection, "interval": items.interval,
      "base": items.base, "baseCase": items.baseCase , "baseDateFormat": items.baseDateFormat, "baseRoman": items.baseRoman, "baseCustom": items.baseCustom,
      "errorSkip": items.errorSkip, "errorCodes": items.errorCodes, "errorCodesCustom": items.errorCodesCustom
    };
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
    const url1 = url.substring(0, save.selectionStart);
    const url2 = url.substring(url.length - save.selectionEnd);
    const surl = await Cryptography.decrypt(save.ciphertext, save.iv, key);
    const selection = url.substring(save.selectionStart, url2 ? url.lastIndexOf(url2) : url.length);
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
    const wildcard = await Cryptography.decrypt(save.ciphertext, save.iv, key);
    const matches = url.includes(wildcard);
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
    const regexp = await Cryptography.decrypt(save.ciphertext, save.iv, key);
    const matches = new RegExp(regexp).exec(url);
    return { matches: matches };
  }

  // Return Public Functions
  return {
    addSave: addSave,
    deleteSave: deleteSave,
    matchesSave: matchesSave
  };

})();