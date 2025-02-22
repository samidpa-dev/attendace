const passport = require('passport');

require('./strategies/basic');
require('./strategies/bearer');

function initialize(options) {
  return passport.initialize(options);
}

exports.initialize = initialize;
exports.authenticateBearer = passport.authenticate(['jwt'], { session: false });;
exports.authenticateBasic = passport.authenticate(['basic'], { session: false });