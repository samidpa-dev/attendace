'use strict';

const router = require('express').Router();
const passport = require(__base + 'lib/passport');

module.exports = function (app) {
  app.use(passport.initialize());
  
  router.get('/ping', function(req, res) {
    res.sendStatus(200);
  });


  router.post(
    '/register', 
    require('./register')
  );

  router.post(
    '/login', 
    passport.authenticateBasic,
    require('./login')
  );

  router.all(
    '/v1/*',
    passport.authenticateBearer
  );

  router.use(
    '/v1',
    require('./v1')
  );

  app.use(router);
}