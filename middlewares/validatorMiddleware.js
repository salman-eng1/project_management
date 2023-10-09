const { validationResult } = require('express-validator');

//validationResult will check according to the rules and return empty value in case of valid id
    // and will return error info in case of invalid id
    
const validatorMiddleware=(req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    next();
};

module.exports =validatorMiddleware;