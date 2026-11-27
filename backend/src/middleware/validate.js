function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const err = result.error;
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
