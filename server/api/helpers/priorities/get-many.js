module.exports = {
  inputs: {},

  async fn() {
    return Priority.find().sort('position');
  },
};
