const { error } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
    const { error: validationError } = schema.validate(req.body, {
        abortEarly: false
    });

    if (validationError) {
        const details = validationError.details.map(d => d.message);
        return error(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    next();
};

module.exports = validate;