/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *   => `node app.js`
 *   => `npm start`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *   => `modulus deploy`
 *   => `heroku scale`
 *
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */

// Ensure we're in the same directory as this script
process.chdir(__dirname);

(async () => {
  // Attempt to import `sails`.
  var sails;
  try {
    sails = require('sails');
  } catch (err) {
    console.error('Encountered an error when attempting to require(\'sails\'):');
    console.error(err.stack);
    console.error('--');
    console.error('To resolve this, run:');
    console.error('npm install sails');
    console.error('--');
    process.exit(1);
  }

  // Try to get `rc` dependency (for loading `.sailsrc` files).
  var rc;
  try {
    rc = require('sails/accessible/rc');
  } catch (err0) {
    try {
      rc = require('rc');
    } catch (err1) {
      console.error('Could not find dependency: `rc`.');
      console.error('Your `.sailsrc` file(s) will be ignored.');
      console.error('To resolve this, run:');
      console.error('npm install rc --save');
      rc = function () { return {}; };
    }//‡
  }//‡


  // Start server
  sails.lift(rc('sails'));
})();
