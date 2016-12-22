"use strict";

// Consts
const BASE_URL = "https://api.pushbullet.com/v2/";
const EPHEMERAL_URL = `${BASE_URL}ephemerals`;

// Packages
let Promise = require("bluebird");
let rest = require("restler");

// Dependencies
let headers = require("./headers");

/**
 * Send a GET query to the given URL.
 *
 * @param {string} token - PushBullet access token.
 * @param {string} action - The action appended to the URL.
 * @returns {Promise} Can resolves with the result.
 */
function query(token, action) {
  return new Promise((resolve, reject) => {
    rest.get(BASE_URL + action, headers(token))
    .on("complete", resolve)
    .on("error", reject)
    .on("timeout", reject)
  });
}

/**
 * Send a GET query to the 'ephemeral' URL with a JSON payload.
 *
 * @param {string} token - PushBullet access token.
 * @param {Object} message - JSON payload.
 * @returns {Promise} Can resolves with the result.
 */
function ephemeral(token, message) {
  return new Promise((resolve, reject) => {
    rest.postJson(EPHEMERAL_URL, {
      type: "push",
      push: message
    }, headers(token))
    .on("complete", resolve)
    .on("error", reject)
    .on("timeout", reject)
  });
}

module.exports = {
  query: query,
  ephemeral: ephemeral
}

