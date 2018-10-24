/**
 * URL Incrementer
 * @file cryptography.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Cryptography = (() => {

  /**
   * Calculates a cryptographic hash. We use the PBKDF2 algorithm with an Hmac-SHA512 hash function.
   * For simplicity, we hardcode the algorithm, hash, and iterations. Note: 512 Bits = 64 Bytes = 88 B64 Characters.
   *
   * @param text the text to hash
   * @param salt the salt to hash with
   * @returns {Promise<string>} the hash as a base 64 encoded string
   * @public
   */
  async function hash(text, salt) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(text), "PBKDF2", false, ["deriveBits"]); // Firefox: Hangs if the text is empty
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-512", salt: b642u8a(salt), iterations: 1000 }, key, 512);
    return u8a2b64(new Uint8Array(bits));
  }

  /**
   * Generates a random cryptographic salt.
   *
   * @returns {string} the salt as a base 64 encoded string
   * @public
   */
  function salt() {
    return u8a2b64(crypto.getRandomValues(new Uint8Array(64)));
  }

  /**
   * Encrypts plaintext into ciphertext using a symmetric key. We use the AES-GCM algorithm with a SHA256 hash function.
   * The key/password is hardcoded, so this only provides a simple layer of protection. Note: 256 Bits = 32 Bytes = 44 B64 Characters.
   *
   * @param plaintext the text to encrypt
   * @returns {Promise<{iv: string, ciphertext: string}>} the iv and ciphertext as base 64 encoded strings
   * @public
   */
  async function encrypt(plaintext) {
    const algorithm = { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(64)) };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("gummibears"));
    const key = await crypto.subtle.importKey("raw", digest, algorithm, false, ["encrypt"]);
    const encryption = await crypto.subtle.encrypt(algorithm, key, new TextEncoder().encode(plaintext));
    return { iv: u8a2b64(algorithm.iv), ciphertext: u8a2b64(new Uint8Array(encryption)) };
  }

  /**
   * Decrypts ciphertext into plaintext using a symmetric key. We use the AES-GCM algorithm with a SHA256 hash function.
   * The key/password is hardcoded, so this only provides a simple layer of protection. Note: 256 Bits = 32 Bytes = 44 B64 Characters.
   *
   * @param ciphertext the text to decrypt
   * @param iv         the initialization vector for the algorithm
   * @returns {Promise<string>} the decrypted text
   * @public
   */
  async function decrypt(ciphertext, iv) {
    const algorithm = { name: "AES-GCM", iv: b642u8a(iv) };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("gummibears"));
    const key = await crypto.subtle.importKey("raw", digest, algorithm, false, ["decrypt"]);
    const decryption = await crypto.subtle.decrypt(algorithm, key, b642u8a(ciphertext));
    return new TextDecoder().decode(decryption);
  }

  /**
   * Converts an 8-bit Unsigned Integer Array to a Base 64 Encoded String.
   *
   * @param u8a the unsigned 8-bit integer array
   * @returns {string} the base 64 encoded string
   * @private
   */
  function u8a2b64(u8a) {
    return btoa(String.fromCharCode(...u8a));
  }

  /**
   * Converts a Base 64 Encoded String to an 8-bit Unsigned Integer Array.
   *
   * @param b64 the base 64 encoded string
   * @returns {Uint8Array} the unsigned 8-bit integer array
   * @private
   */
  function b642u8a(b64) {
    return new Uint8Array([...atob(b64)].map(c => c.charCodeAt(0)));
  }

  // Return Public Functions
  return {
    hash: hash,
    salt: salt,
    encrypt: encrypt,
    decrypt: decrypt
  };
})();