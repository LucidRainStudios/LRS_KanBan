module.exports = {
  fn() {
    return {
      webhookUrl: process.env.DISCORD_TASK_WEBHOOK_URL,
      notifyBoardIds: new Set([
        '1604177589386085452', // Tech Team
        '1604178028152226912', // Creative Team
        '1604178149526996072', // Art Team
        '1604178239931024495', // Marketing Team
      ]),
    };
  },
};
