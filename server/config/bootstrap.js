// config/bootstrap.js
module.exports.bootstrap = async function () {
  // ---------- 0) detect models access style ----------
  const UserModel = (sails.models && sails.models.user) ? sails.models.user : global.User;

  // ---------- 1) optional: seed admin on empty DB ----------
  try {
    if (UserModel) {
      // Quick DB sanity, fail fast without crashing lift
      try {
        await UserModel.getDatastore().sendNative('SELECT 1;');
      } catch (e) {
        sails.log.warn('DB not ready for seeding, skipping. Details:', e.code || e.message);
      }

      const userCount = await UserModel.count();
      if (userCount === 0) {
        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'admin';

        let hashed;
        if (sails.helpers?.passwords?.hashPassword) {
          hashed = await sails.helpers.passwords.hashPassword(adminPass);
        } else {
          try {
            const bcrypt = require('bcryptjs');
            hashed = await bcrypt.hash(adminPass, 10);
          } catch (e) {
            sails.log.warn('bcryptjs not installed, creating admin with plain password surrogate');
            hashed = adminPass; // works only if your model hashes in a lifecycle callback
          }
        }

        // Try to satisfy common field names
        const admin = await UserModel.create({
          email: adminUser,
          emailAddress: adminUser,
          username: adminUser,
          password: hashed,
          isAdmin: true
        }).fetch();

        sails.log.info('Seeded default admin:', admin.username || admin.email || admin.emailAddress);
      }
    } else {
      sails.log.verbose('No global User model found, skipping seed');
    }
  } catch (e) {
    sails.log.error('Bootstrap seed error:', e);
    // do not throw, we never block lift
  }

  // ---------- 2) mount raw WebSocket server at /ws ----------
  try {
    // Only if the dependency exists
    let WebSocket;
    try {
      WebSocket = require('ws');
    } catch {
      sails.log.verbose('ws package not installed, skipping raw WebSocket server');
      return;
    }

    const httpServer = sails.hooks.http && sails.hooks.http.server;
    if (!httpServer) {
      sails.log.warn('HTTP hook not ready, cannot mount /ws');
      return;
    }

    if (!sails._wsServer) {
      const wss = new WebSocket.Server({ server: httpServer, path: '/ws' });
      sails._wsServer = wss;

      wss.on('connection', (ws) => {
        try { ws.send(JSON.stringify({ type: 'hello', ok: true })); } catch {}
        ws.on('message', (msg) => {
          try { ws.send(JSON.stringify({ type: 'echo', data: msg.toString() })); } catch {}
        });
      });

      sails.log.info('Raw WebSocket listening at ws://localhost:1337/ws');
    }
  } catch (e) {
    sails.log.error('WebSocket bootstrap error:', e);
    // never throw
  }
};
