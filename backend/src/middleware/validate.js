const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      error: 'Data tidak valid',
      details: result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = validate;
