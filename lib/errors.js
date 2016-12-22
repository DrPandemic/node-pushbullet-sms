"use strict";

let errors = ["StateError", "NotImplementedError", "EncryptionError"];

/**
 * Creates a new error class.
 *
 * @param {string} name - Class name.
 * @returns {Object} Error class.
 */
function createError(name) {
  function error(message) {
    this.message = message;
    this.name = name;
    Error.captureStackTrace(this, error);
  }
  error.prototype = Object.create(Error.prototype);
  error.prototype.constructor = error;

  return error;
}

/**
 * Creates all error and returns them as an object.
 */
function processErrors(errors) {
  let errorObject = {};

  for(let error of errors) {
    errorObject[error] = createError(error);
  }

  return errorObject;
}

module.exports = processErrors(errors);
