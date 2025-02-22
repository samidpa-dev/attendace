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

  app.use(router);
}