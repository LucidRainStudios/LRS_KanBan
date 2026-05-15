module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    return Priority.findOne(inputs.criteria);
  },
};
