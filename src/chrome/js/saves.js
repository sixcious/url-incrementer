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
    // Check if this URL has already been saved, if it has delete the existing save, and calculate the hash/salt
    const saves = await deleteSave(instance.url, "addURL"),
          url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length),
          salt = Cryptography.salt(),
          hash = await Cryptography.hash(url1 + url2, salt);
    // "Unshift" this new save to the START of the array because it's an exact url type (not a wildcard/regexp)
    saves.unshift({
      "type": "url", "hash": hash, "salt": salt, "selectionEnd": url2.length,
      "selectionStart": instance.selectionStart, "interval": instance.interval, "leadingZeros": instance.leadingZeros,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "baseCustom": instance.baseCustom, "errorSkip": instance.errorSkip
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
    const saves = await Promisify.getItems("local", "saves");
    for (let i = 0; i < saves.length; i++) {
      const result = await matchesSave(saves[i], url);
      if (result.matches) {
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
   * Tests if a save of any type (url, wildcard, regexp) matches a plaintext URL.
   *
   * @param save the saved URL, wildcard, or regexp
   * @param url  the plaintext URL to match
   * @returns {Promise<{matches: boolean, selection: {}}>}
   * @public
   */
  async function matchesSave(save, url) {
    return save && url ? save.type === "url" ? await matchesURL(save, url) : save.type === "wildcard" ? await matchesWildcard(save, url) : save.type === "regexp" ? await matchesRegExp(save, url) : { matches: false } : { matches: false };
  }

  /**
   * Tests if a saved URL matches a plaintext URL.
   *
   * @param save the saved URL
   * @param url  the plaintext URL to match
   * @returns {Promise<{matches: boolean, selection: {}}>}
   * @private
   */
  async function matchesURL(save, url) {
    const url1 = url.substring(0, save.selectionStart),
          url2 = url.substring(url.length - save.selectionEnd), //url.slice(-save.url2length);
          hash = await Cryptography.hash(url1 + url2, save.salt),
          selection = url.substring(save.selectionStart, url2 ? url.lastIndexOf(url2) : url.length);
    // We check that the hash matches, and if url2 is empty (e.g. the selection is the last part of the URL with nothing after it, that the selection is valid and matches the saved base):
    const matches = hash === save.hash && IncrementDecrement.validateSelection(selection, save.base, save.baseCase, save.baseDateFormat, save.baseCustom, save.leadingZeros) === "";
    return { matches: matches, selection: { selection: selection, selectionStart: save.selectionStart } };
  }

  /**
   * Tests if a saved wildcard matches a plaintext URL.
   *
   * @param save the saved wildcard
   * @param url  the plaintext URL to match
   * @returns {Promise<{matches: RegExpExecArray}>}
   * @private
   */
  async function matchesWildcard(save, url) {
    const wildcard = await Cryptography.decrypt(save.ciphertext, save.iv),
          matches = url.includes(wildcard);
    return { matches: matches };
  }

  /**
   * Tests if a saved regexp matches a plaintext URL.
   *
   * @param save the saved regexp
   * @param url  the plaintext URL to match
   * @returns {Promise<{matches: RegExpExecArray}>}
   * @private
   */
  async function matchesRegExp(save, url) {
    const regexp = await Cryptography.decrypt(save.ciphertext, save.iv),
          matches = new RegExp(regexp).exec(url);
    return { matches: matches };
  }

  /**
   * Escapes a regular expression string.
   *
   * @param string the regular expression string to escape
   * @returns {string} the escaped string
   * @private
   */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  // Return Public Functions
  return {
    addURL: addURL,
    deleteSave: deleteSave,
    matchesSave: matchesSave
  };
})();