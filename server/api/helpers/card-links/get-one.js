module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    return CardLink.findOne(inputs.criteria);
  },
};
