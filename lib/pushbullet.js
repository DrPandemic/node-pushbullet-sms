"use strict";

// Errors
let StateError = require("./errors.js").StateError;
let EncryptionError = require("./errors.js").EncryptionError;

// Consts
const DEVICE_URL = "devices";
const PERMANENTS_URL = "permanents/";
const CONVERSATIONS_URL = "_threads";
const CONVERSATION_URL = "_thread_";
const ME_URL = "/users/me";

// Dependecies
let api = require('./api');
let encryption = require("./encryption");
let Stream = require("./stream");

class PushBullet {
  /**
   * PushBullet API abstraction contructor.
   *
   * @param {string} token - PushBullet access token.
   */
  constructor(token) {
    if (!token) {
      throw new StateError("API key is required");
    }

    this.token = token;
  }

  /**
   * Setup the encryption keys.
   *
   * @param {string=} e2ePassword - Encryption password.
   * @return {Promise} Will resolve if the key was generated.
   */
  setupEncryption(e2ePassword) {
    return this.me().then((me) => {
      this.e2eKey = encryption.generateKey(e2ePassword, me.iden);
    });
  }

  /**
   * Impersonates a device. Used to send SMS.
   *
   * @param {Object} device - A device received for the devices() call.
   */
  impersonate(device) {
    this.device = device;
  }

  /**
   * Fetches information about this account.
   *
   * @returns {Promise} Can resolves with account information.
   */
  me() {
    return api.query(this.token, ME_URL);
  }

  /**
   * Fetches all devices for this account.
   *
   * @returns {Promise} Can resolves with all devices.
   */
  devices() {
    return api.query(this.token, DEVICE_URL);
  }

  /**
   * Fetches conversations.
   *
   * @param {string} deviceID -
   *  The ID of the devices containing the conversations.
   * @returns {Promise} Can resolves with conversations.
   */
  conversations(deviceID) {
    return api.query(this.token, PERMANENTS_URL + deviceID + CONVERSATIONS_URL)
      .then((result) => {
        return encryption.extract(result, this.e2eKey);
      });
  }

  /**
   * Fetches a specific conversation.
   *
   * @param {string} deviceID -
   *  The ID of the devices containing the conversations.
   * @param {string} conversationID - Unique conversation ID for a device.
   * @returns {Promise} Can resolves with the specific conversation.
   */
  conversation(deviceID, conversationID) {
    return api.query(this.token,
                     PERMANENTS_URL +
                     deviceID +
                     CONVERSATION_URL +
                     conversationID)
      .then((result) => {
        return encryption.extract(result, this.e2eKey);
      });
  }

  /**
   * Sends a SMS from the given device.
   *  Should impersonate a device before being able to send a SMS.
   *  If a e2eKey is set, it will encrypt the message.
   *
   * @param {string} deviceID -
   *  The ID of the devices containing the conversations. The target.
   * @param {string} target - SMS recipient's phone number.
   * @param {string} message - Message to send by SMS.
   * @param {bool=} musstEncrypt - Fails if not encrypting.
   */
  sendSMS(deviceID, target, message, mustEncrypt) {
    if(mustEncrypt && !this.e2eKey) {
      throw new EncryptionError("The e2e key wasn't set");
    }

    if(!this.device) {
      throw new StateError("You must impersonate a device before sending a SMS");
    }

    /*eslint-disable */
    let payload = {
      conversation_iden: target,
      message: message,
      package_name: 'com.pushbullet.android',
      source_user_iden: this.device,
      target_device_iden: deviceID,
      type: 'messaging_extension_reply'
    }
    /*eslint-enable */

    if(this.e2eKey) {
      payload = {
        encrypted: true,
        ciphertext: encryption.encrypt(JSON.stringify(payload), this.e2eKey)
      };
    }

    return api.ephemeral(this.token, payload);
  }

  /**
   * Return a new stream listener.
   *  Comes from https://github.com/alexwhitman/node-pushbullet-api.
   *
   * @return {Stream} Stream listener.
   */
  stream() {
    return new Stream(this.token);
  }
}

module.exports = PushBullet;
