/**
 * URL Incrementer Save URLs
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.SaveURLs = function () {

  async function saveURL(instance) {
    console.log("URLI.SaveURLs.saveURL() - saving a URL to local storage...");
    // Part 1: Check if this URL has already been saved, if it has remove the existing saved profile
    const profiles = await deleteURL(instance, "saveURL");
    // const localItems = URLI.Background.getLocalItems(),
    //       profiles = localItems && localItems.profiles && Array.isArray(localItems.profiles)? localItems.profiles : [],
    //       url1 = instance.url.substring(0, instance.selectionStart),
    //       url2 = instance.url.substring(instance.selectionStart + instance.selection.length);
    // if (profiles && profiles.length > 0) {
    //   for (let i = 0; i < profiles.length; i++) {
    //     const result = await matchesURL(profiles[i], instance.url);
    //     if (result.matches) {
    //       console.log("URLI.Popup.setup() - this URL has already been saved, so removing the old entry");
    //       profiles.splice(i, 1);
    //       break;
    //     }
    //   }
    // }
    console.log("in saveURL BEFORE calling crypto after calling deleteURL profiles=" + profiles);
    // Part 2: Put this URL into the profiles array and save it to local storage
    const url1 = instance.url.substring(0, instance.selectionStart),
          url2 = instance.url.substring(instance.selectionStart + instance.selection.length),
          urlsalt1 = URLI.Cryptography.generateSalt(),
          urlsalt2 = URLI.Cryptography.generateSalt(),
          urlhash1 = await URLI.Cryptography.calculateHash(url1, urlsalt1);
    console.log("good so far about to do urlhash2, urlhash1=" + urlhash1);
    console.log("good so far about to do urlhash2, urlsalt2=" + urlsalt2);
    console.log("good so far about to do urlhash2, url2=" + url2);
    const      urlhash2 = await URLI.Cryptography.calculateHash(url2, urlsalt2);
    console.log("in saveURL after calling crypto, urlhash2=" + urlhash2);
    // Put this new entry at the beginning of the array (unshift) as it's more likely to be used than older ones
    profiles.unshift({
      "urlhash1": urlhash1, "urlhash2": urlhash2,
      "urlsalt1": urlsalt1, "urlsalt2": urlsalt2,
      "url2length": url2.length, "selectionStart": instance.selectionStart, "interval": instance.interval, "leadingZeros": instance.leadingZeros,
      "base": instance.base, "baseCase": instance.baseCase, "baseDateFormat": instance.baseDateFormat, "errorSkip": instance.errorSkip
    });
    chrome.storage.local.set({"profiles": profiles});
  }

  async function deleteURL(instance, caller) {
    const localItems = await EXT.Promisify.getItems("local"),
          profiles = localItems && localItems.profiles && Array.isArray(localItems.profiles)? localItems.profiles : []; // localItems.profiles;
          // url1 = instance.url.substring(0, instance.selectionStart),
          // url2 = instance.url.substring(instance.selectionStart + instance.selection.length);
    if (profiles && profiles.length > 0) {
      for (let i = 0; i < profiles.length; i++) {
        // const urlhash1 = await URLI.Cryptography.calculateHash(url1, profiles[i].urlsalt1);
        // const urlhash2 = await URLI.Cryptography.calculateHash(url2, profiles[i].urlsalt2);
        // if (profiles[i].urlhash1 === urlhash1 && profiles[i].urlhash2 === urlhash2) {
        //   console.log("URLI.Action.deleteProfile() - deleting URL url=" + instance.url + ", with urlhash1=" + profiles[i].urlhash1);
        //   profiles.splice(i, 1);
        //   break;
        // }
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
          url2 = url.slice(-profile.url2length);
    const urlhash1 = await URLI.Cryptography.calculateHash(url1, profile.urlsalt1);
    const urlhash2 = await URLI.Cryptography.calculateHash(url2, profile.urlsalt2);
    const selection = url.substring(profile.selectionStart, profile.url2length > 0 ? url.lastIndexOf(url2) : url.length);
    const selectionParsed = isNaN(profile.base) ? undefined : parseInt(selection, profile.base).toString(profile.base);
    // Test for alphanumeric in the case where url2length is 0 but current url has a part 2
    // Test base matches selection for same reason
    console.log("profile.urlhash1=" + profile.urlhash1);
    console.log("urlhash1=" + urlhash1);
    const matches = (urlhash1 === profile.urlhash1) &&
      ((urlhash2 === profile.urlhash2) ||
    ((profile.url2length === 0) &&
      /^[a-z0-9]+$/i.test(selection) &&
      selectionParsed ? !(isNaN(parseInt(selection, profile.base)) || selection.toUpperCase() !== ("0".repeat(selection.length - selectionParsed.length) + selectionParsed.toUpperCase())) :
      profile.base === "date" && false)); // TODO date base
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