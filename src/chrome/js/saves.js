/**
 * URL Incrementer
 * @file saves.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Saves = (() => {

  /**
   * Adds a saved URL.
   *
   * @param instance the instance's URL and settings to save
   * @public
   */
  async function addURL(instance) {
    console.log("addURL() - saving a URL to local storage...");
    // Part 1: Check if this URL has already been saved, if it has remove the existing save
    // Part 2: Put this URL into the saves array and save it to local storage
    const saves = await deleteURL(instance.url, "addURL"),
          url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length),
          salt = Cryptography.salt(),
          hash = await Cryptography.hash(url1 + url2, salt);
    // Put this new entry at the beginning of the array (unshift) as it's more likely to be used than older ones
    saves.unshift({
      "type": "url", "hash": hash, "salt": salt, "selectionEnd": url2.length, /*"url2length": url2.length,*/
      "selectionStart": instance.selectionStart, "interval": instance.interval, "leadingZeros": instance.leadingZeros,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "baseCustom": instance.baseCustom, "errorSkip": instance.errorSkip
    });
    chrome.storage.local.set({"saves": saves});
  }

  /**
   * Deletes a saved URL or wildcard by a plaintext URL.
   *
   * @param url    the plaintext URL to lookup this save by
   * @param caller the caller who is calling this function
   * @returns {Promise<{}>} the new saves array after deleting the save
   * @public
   */
  async function deleteURL(url, caller) {
    const saves = await Promisify.getItems("local", "saves");
    if (saves && saves.length > 0) {
      for (let i = 0; i < saves.length; i++) {
        const result = saves[i].type === "url" ? await matchesURL(saves[i], url) : saves[i].type === "wildcard" ? await matchesWildcard(saves[i], url) : undefined;
        if (result.matches) {
          console.log("deleteURL() - splicing URL from saves array...");
          saves.splice(i, 1);
          break;
        }
      }
    }
    if (caller === "addURL" || caller === "addWildcard") {
      return saves;
    } else {
      chrome.storage.local.set({"saves": saves});
    }
  }

  /**
   * Tests if a saved URL matches a plaintext URL.
   *
   * @param save the saved URL
   * @param url  the plaintext URL
   * @returns {Promise<{matches: boolean, selection: {}}>}
   * @public
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
   * @param url  the plaintext URL
   * @returns {Promise<{matches: RegExpExecArray}>}
   * @public
   */
  async function matchesWildcard(save, url) {
    const wildcard = await Cryptography.decrypt(save.ciphertext, save.iv);
    const matches = new RegExp(escapeRegExp(wildcard)).exec(url);
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
    deleteURL: deleteURL,
    matchesURL: matchesURL,
    matchesWildcard: matchesWildcard
  };
})();