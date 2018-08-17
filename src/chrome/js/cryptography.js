/**
 * URL Incrementer Cryptography
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Cryptography = function () {

  /**
   * Calculates a cryptographic hash. We use the PBKDF2 algorithm with an Hmac-SHA512 hash function.
   * For simplicity, we hardcode the algorithm, hash, and iterations. Note: 512 Bits = 64 Bytes = 88 B64 Characters.
   *
   * @param text the text to hash
   * @param salt the salt to hash with
   * @returns {Promise<string>} the hash
   * @public
   */
  async function calculateHash(text, salt) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(text ? text : "gUmMiBeARs"), "PBKDF2", false, ["deriveBits"]); // Firefox: Hangs if the text is empty
    const bits = await crypto.subtle.deriveBits({name: "PBKDF2", hash: "SHA-512", salt: str2u8a(salt), iterations: 1337}, key, 512);
    return u8a2str(new Uint8Array(bits));
  }

  /**
   * Generates a random cryptographic salt.
   *
   * @returns {string} the salt
   * @public
   */
  function generateSalt() {
    return u8a2str(crypto.getRandomValues(new Uint8Array(64)));
  }

  /**
   * Converts an 8-bit Unsigned Integer Array to a Base 64 Encoded String.
   *
   * @param u8a the unsigned 8-bit integer array
   * @returns {string} the string
   * @private
   */
  function u8a2str(u8a) {
    return btoa(String.fromCharCode(...u8a));
  }

  /**
   * Converts a Base 64 Encoded String to an 8-bit Unsigned Integer Array.
   *
   * @param str the string
   * @returns {Uint8Array} the unsigned 8-bit integer array
   * @private
   */
  function str2u8a(str) {
    return new Uint8Array([...atob(str)].map(c => c.charCodeAt(0)));
  }

  // Return Public Functions
  return {
    calculateHash: calculateHash,
    generateSalt: generateSalt
  };
}();