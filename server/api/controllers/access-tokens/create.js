const bcrypt = require('bcrypt');
const validator = require('validator');

const { getRemoteAddress } = require('../../../utils/remoteAddress');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  INVALID_CREDENTIALS: {
    invalidCredentials: 'Invalid credentials',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const emailOrUsernameValidator = (value) => (value.includes('@') ? validator.isEmail(value) : value.length >= 3 && value.length <= 16 && /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/.test(value));

module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      custom: emailOrUsernameValidator,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidCredentials: {
      responseType: 'unauthorized',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const remoteAddress = getRemoteAddress(this.req);

    const user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);

    if (!user) {
      sails.log.warn(`Invalid email or username: "${inputs.emailOrUsername}"! (IP: ${remoteAddress})`);
      throw Errors.USER_NOT_FOUND;
    }

    if (!bcrypt.compareSync(inputs.password, user.password)) {
      sails.log.warn(`Invalid password! (IP: ${remoteAddress})`);
      throw Errors.INVALID_CREDENTIALS;
    }

    const accessToken = sails.helpers.utils.createToken(user.id);

    await Session.create({
      accessToken,
      remoteAddress,
      userId: user.id,
      userAgent: this.req.headers['user-agent'],
    });

    return {
      item: accessToken,
    };
  },
};
