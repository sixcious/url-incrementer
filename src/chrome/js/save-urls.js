/**
 * URL Incrementer Save URLs
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.SaveURLs = function () {

  const URL_SEPARATOR = "-_-";

  async function saveURL(instance) {
    console.log("URLI.SaveURLs.saveURL() - saving a URL to local storage...");
    // Part 1: Check if this URL has already been saved, if it has remove the existing saved profile
    const profiles = await deleteURL(instance, "saveURL");
    // Part 2: Put this URL into the profiles array and save it to local storage
    const url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length),
          salt = URLI.Cryptography.generateSalt(),
          hash = await URLI.Cryptography.calculateHash(url1 + url2, salt);
    // Put this new entry at the beginning of the array (unshift) as it's more likely to be used than older ones
    profiles.unshift({
      "hash": hash, "salt": salt, "selectionEnd": url2.length, /*"url2length": url2.length,*/
      "selectionStart": instance.selectionStart, "interval": instance.interval, "leadingZeros": instance.leadingZeros,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "baseCustom": instance.baseCustom, "errorSkip": instance.errorSkip
    });
    chrome.storage.local.set({"profiles": profiles});
  }

  async function deleteURL(instance, caller) {
    const localItems = await EXT.Promisify.getItems("local"),
          profiles = localItems && localItems.profiles && Array.isArray(localItems.profiles)? localItems.profiles : []; // localItems.profiles;
    if (profiles && profiles.length > 0) {
      for (let i = 0; i < profiles.length; i++) {
        const result = await matchesURL(profiles[i], instance.url);
        if (result.matches) {
          console.log("URLI.SaveURLs.deleteURL() - splicing URL from array...");
          profiles.splice(i, 1);
          break;
        }
      }
    }
    if (caller === "saveURL") {
      return profiles;
    } else {
      chrome.storage.local.set({"profiles": profiles});
    }
  }

  /**
   * Checks if the saved profile's hashed URL matches the URL.
   *
   * @param profile the saved profile with url hashes to check
   * @param url     the current URL to check
   * @returns {Promise<{matches: boolean, selection: string}>}
   * @public
   */
  async function matchesURL(profile, url) {
    const url1 = url.substring(0, profile.selectionStart),
          url2 = url.substring(url.length - profile.selectionEnd), //url.slice(-profile.url2length);
          hash = await URLI.Cryptography.calculateHash(url1 + url2, profile.salt),
          selection = url.substring(profile.selectionStart, url2 ? url.lastIndexOf(url2) : url.length);
    // We check that the hash matches, and if url2 is empty (e.g. the selection is the last part of the URL with nothing after it, that the selection is valid and matches the saved base):
    const matches = hash === profile.hash && URLI.IncrementDecrement.validateSelection(selection, profile.base, profile.baseCase, profile.baseDateFormat, profile.baseCustom) === "";
    return {
      "matches": matches,
      "selection": selection
    };
  }

  // Return Public Functions
  return {
    saveURL: saveURL,
    deleteURL: deleteURL,
    matchesURL: matchesURL
  };
}();