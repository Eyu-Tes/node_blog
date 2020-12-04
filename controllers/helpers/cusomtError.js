// @ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

// custom error messages
class NotFoundError extends Error {
    constructor(...params) {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
      super(...params)
  
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, NotFoundError)
      }
  
      this.name = 'NotFoundError'
      // Custom debugging information
      this.date = new Date()
    }
}

class AccessDeniedError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AccessDeniedError)
    }

    this.name = 'AccessDeniedError'
    // Custom debugging information
    this.date = new Date()
  }
}

module.exports = { NotFoundError, AccessDeniedError }
