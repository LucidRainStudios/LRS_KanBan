const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    const accessToken = await AccessToken.destroyOne({
      userId: currentUser.id,
    });

    if (!accessToken) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    return {
      item: accessToken,
    };
  },
};
