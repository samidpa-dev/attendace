const passport = require('passport');

require('./strategies/basic');
require('./strategies/bearer');

function initialize(options) {
  return passport.initialize(options);
}

function authenticateBearer(req, res, next) {
  bearer('bearer', req, res, next);
}

// function bearer(name, req, res, next) {
//   return passport.authenticate(name, { session: false }, (err, user, info) => {
//     if (err) {
//       log.error(`ERROR: ${err.message}`);
//       return next(err);
//     }
//     if (!user) {
//       const message = new RegExp(/error_description="(.*)"/).exec(info);
//       log.error(`ERROR: ${message}`);

//       const originalUrl = req.originalUrl;
//       if (originalUrl.includes('/v2/m-integration')) {
//         return next(
//           response.error401(commonErrMsg.INVALID_TOKEN, '', commonErrMsg.INVALID_TOKEN__CODE)
//         );
//       } else {
//         return next(
//           response.error401((message && message[1]) || 'invalid token')
//         );
//       }
//     }
//     passport.transformAuthInfo(info, req, (err, tinfo) => {
//       if (err) {
//         log.error(`ERROR: ${err.message}`);
//         return next(err);
//       }
//       req.authInfo = tinfo;
//       next();
//     });
//   })(req, res, next);
// }

exports.initialize = initialize;
exports.authenticateBearer = authenticateBearer;
exports.authenticateBasic = passport.authenticate(['basic'], { session: false });