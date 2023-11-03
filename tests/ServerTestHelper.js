/* istanbul ignore file */
require('dotenv').config();

const Jwt = require('@hapi/jwt');

const ServerTestHelper = {
  async createAccessToken(payload) {
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = ServerTestHelper;
