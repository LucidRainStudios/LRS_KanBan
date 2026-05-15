module.exports = {
  inputs: {},

  async fn() {
    const priorities = await sails.helpers.priorities.getMany();

    return {
      items: priorities,
    };
  },
};
