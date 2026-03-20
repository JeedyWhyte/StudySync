const success = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'Something went wrong', statusCode = 500, code = 'SERVER_ERROR', details = []) => {
  return res.status(statusCode).json({ success: false, message, error: { code, details } });
};

module.exports = { success, error };