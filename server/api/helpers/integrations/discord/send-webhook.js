module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
    payload: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ url, payload }) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        sails.log.warn(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      sails.log.warn(`Discord webhook error: ${error.message}`);
    }
  },
};
