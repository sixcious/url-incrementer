/**
 * URL Incrementer Encryption
 *
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Encryption = function () {

  function calculateHash(url, salt) {
    // TODO
  }

  function generateSalt() {
    // TODO
  }

  // Return Public Functions
  return {
    calculateHash: calculateHash,
    genreateSalt: generateSalt
  };
}();