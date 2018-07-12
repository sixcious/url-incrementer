/**
 * URL Incrementer Encryption
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Encryption = function () {

  // https://timtaubert.de/blog/2015/05/implementing-a-pbkdf2-based-password-storage-scheme-for-firefox-os/

  const SECRET_KEY_FACTORY_ALGORITHM = "PBKDF2", //"PBKDF2WithHmacSHA512",
        SECRET_KEY_HASH_ALGORITHM = "SHA-512",
        PBKDF2_ITERATION_COUNT = 1000,
        HASH_BITS_LENGTH = 512,
        SALT_BYTE_LENGTH = 64;

  /**
   *
   * @param plaintext
   * @param salt
   * @param iterations
   * @param algorithm
   * @param hash
   * @returns {Promise<*>} the calculated ciphertext hash from the plaintext
   */
  async function calculateHash(plaintext, salt, iterations, algorithm, hash) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(plaintext), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({name: "PBKDF2", hash: "SHA-512", salt: str2buf(salt), iterations: 1000}, key, 512);
    return buf2str(new Uint8Array(bits));
  }

  function generateSalt() {
    return buf2str(crypto.getRandomValues(new Uint8Array(64)));
  }

  //https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
  //https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/42334410#42334410
  /*
  var base64 = btoa(
  new Uint8Array(arrayBuffer)
    .reduce((data, byte) => data + String.fromCharCode(byte), '')
);
   */
  function buf2str(buf) {
    return btoa(String.fromCharCode.apply(null, buf));
  }

  function str2buf(str) {
    return new Uint8Array(atob(str).split("").map(function(c) { return c.charCodeAt(0); }));
  }

  // Return Public Functions
  return {
    calculateHash: calculateHash,
    generateSalt: generateSalt
  };
}();