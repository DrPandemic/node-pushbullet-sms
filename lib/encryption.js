"use strict";

// Packages
let forge = require("node-forge");

// TODO
/**
 * Derives a key from the encryption password.
 *
 * @param {string} password - e2e encryption password.
 * @returns {string} Usable key to encrypt and decrypt.
 */
function generateKey(password, identity) {
  let rand = forge.md.sha256.create();

  return forge.pkcs5.pbkdf2(password, identity, 30000, 32, rand);
}

/**
 * Encrypts a message with a given key.
 *
 *  @param {string} message - The text that will be encrypted.
 *  @param {string} key - Encryption key.
 *  @returns {string} Resulting blob.
 */
function encrypt(message, key) {
  let initializationVector = forge.random.getBytes(12);

  let cipher = forge.cipher.createCipher("AES-GCM", key);
  cipher.start({
    "iv": initializationVector
  });
  cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
  cipher.finish();

  let tag = cipher.mode.tag.getBytes();
  let encryptedMessage = cipher.output.getBytes();

  let encodedMessage = "1" + tag + initializationVector + encryptedMessage;

  return require("btoa")(encodedMessage);
}

/**
 * Decrypts a message with a given key.
 *
 * @param {string} message - Encrypted message.
 * @param {string} key - Decryption key.
 * @returns {string} Decrypted result.
 */
function decrypt(message, key) {
  let buffer, bytes, decipher, iv, tag;

  bytes = forge.util.decode64(message);
  buffer = forge.util.createBuffer(bytes);
  buffer.getBytes(1);
  tag = buffer.getBytes(16);
  iv = buffer.getBytes(12);
  decipher = forge.cipher.createDecipher('AES-GCM', key);
  decipher.start({
    'iv': iv,
    'tag': tag
  });
  decipher.update(buffer);
  decipher.finish();

  return decipher.output.toString('utf8');
}

/**
 * If the message is encrypted it will decrypt it.
 * If not, simply returns the message.
 *
 * @param {Object} message - Message to potentially decrypt.
 * @param {string} key - Encryption key.
 * @returns {Object} Decrypted object.
 */
function extract(message, key) {
  if(message.encrypted && key) {
    return JSON.parse(decrypt(message.ciphertext, key));
  }
  return message;
}

module.exports = {
  generateKey: generateKey,
  encrypt: encrypt,
  decrypt: decrypt,
  extract: extract
}
