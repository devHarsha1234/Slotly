const validate = (schema) => (req, res, next) => {
  try {
    if (!schema) {
       console.error('Schema is undefined in validate middleware', req.path);
       return next(new Error('Internal server error: Schema undefined'));
    }
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400);
    if (error.errors) {
      next(new Error(error.errors.map(e => e.message).join(', ')));
    } else {
      next(error);
    }
  }
};

module.exports = validate;
