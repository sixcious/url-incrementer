/**
 * URL Incrementer Cryptography
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Cryptography = function () {

  /**
   * Calculates a cryptographic hash. We use the PBKDF2WithHmacSHA512 algorithm and hash.
   * For simplicity, we hardcode the algorithm, hash, and iterations.
   *
   * @param plaintext
   * @param salt
   * @returns {Promise<string>} the hash
   * @public
   */
  async function calculateHash(plaintext, salt) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(plaintext ? plaintext : "gUmMiBeARs"), "PBKDF2", false, ["deriveBits"]); // Firefox: Hangs if the plaintext is empty
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
    return btoa(String.fromCharCode.apply(null, u8a));
  }

  /**
   * Converts a Base 64 Encoded String to an 8-bit Unsigned Integer Array.
   *
   * @param str the string
   * @returns {Uint8Array} the unsigned 8-bit integer array
   * @private
   */
  function str2u8a(str) {
    return new Uint8Array(atob(str).split("").map(function(c) { return c.charCodeAt(0); }));
  }

  // Return Public Functions
  return {
    calculateHash: calculateHash,
    generateSalt: generateSalt
  };
}();