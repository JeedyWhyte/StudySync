const jwt = require('jsonwebtoken');

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const signRefresh = (payload) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

const verify = (token, secret) => jwt.verify(token, secret);

module.exports = { signToken, signRefresh, verify };