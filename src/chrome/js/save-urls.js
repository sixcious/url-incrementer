/**
 * URL Incrementer Save URLs
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.SaveURLs = function () {

  const URL_SEPARATOR = "-_-";

  async function addURL(instance) {
    console.log("URLI.SaveURLs.saveURL() - saving a URL to local storage...");
    // Part 1: Check if this URL has already been saved, if it has remove the existing save
    const saves = await deleteURL(instance.url, "addURL");
    // Part 2: Put this URL into the saves array and save it to local storage
    const url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length),
          salt = URLI.Cryptography.generateSalt(),
          hash = await URLI.Cryptography.calculateHash(url1 + url2, salt);
    // Put this new entry at the beginning of the array (unshift) as it's more likely to be used than older ones
    saves.unshift({
      "type": "exact", "hash": hash, "salt": salt, "selectionEnd": url2.length, /*"url2length": url2.length,*/
      "selectionStart": instance.selectionStart, "interval": instance.interval, "leadingZeros": instance.leadingZeros,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "baseCustom": instance.baseCustom, "errorSkip": instance.errorSkip
    });
    chrome.storage.local.set({"saves": saves});
  }

  async function deleteURL(url, caller) {
    const saves = await EXT.Promisify.getItems("local", "saves");
    if (saves && saves.length > 0) {
      for (let i = 0; i < saves.length; i++) {
        const result = await matchesURL(saves[i], url);
        if (result.matches) {
          console.log("URLI.SaveURLs.deleteURL() - splicing URL from saves array...");
          saves.splice(i, 1);
          break;
        }
      }
    }
    if (caller === "addURL" || caller === "addPartialURL") {
      return saves;
    } else {
      chrome.storage.local.set({"saves": saves});
    }
  }

  async function matchesURL(save, url) {
    return await save.type === "exact" ? matchesExactURL(save, url) : save.type === "partial" ? matchesPartialURL(save, url): "";
  }

  /**
   * Checks if the saved URL matches the URL.
   *
   * @param save the save with url hashes to check
   * @param url  the current URL to check
   * @returns {Promise<{matches: boolean, selection: string}>}
   * @private
   */
  async function matchesExactURL(save, url) {
    const url1 = url.substring(0, save.selectionStart),
          url2 = url.substring(url.length - save.selectionEnd), //url.slice(-save.url2length);
          hash = await URLI.Cryptography.calculateHash(url1 + url2, save.salt),
          selection = url.substring(save.selectionStart, url2 ? url.lastIndexOf(url2) : url.length);
    // We check that the hash matches, and if url2 is empty (e.g. the selection is the last part of the URL with nothing after it, that the selection is valid and matches the saved base):
    const matches = hash === save.hash && URLI.IncrementDecrement.validateSelection(selection, save.base, save.baseCase, save.baseDateFormat, save.baseCustom, save.leadingZeros) === "";
    return { "matches": matches, "selection": selection };
  }

  async function matchesPartialURL(save, url) {
    const urlp = url.substring(0, save.urllength);
    const hash = await URLI.Cryptography.calculateHash(urlp, save.salt);
    const matches = hash === save.hash;
    return { "matches": matches, "selection": "" }
  }

  // Return Public Functions
  return {
    addURL: addURL,
    deleteURL: deleteURL,
    matchesURL: matchesURL
  };
}();