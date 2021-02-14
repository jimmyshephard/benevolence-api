const {validationResult} = require('express-validator');

/**
 * Validate request middleware
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).
        json({
          errors: errors.array(),
          message: 'One or more required parameters are missing.',
        });
  }

  next();
}

module.exports = {validateRequest};
