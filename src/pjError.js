'use strict';

class pjError extends Error {
    constructor(code, message, details = null) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = 'pjError';
        this.code = code;
        this.message = message;
        this.details = details;
    }
}

module.exports = pjError;
