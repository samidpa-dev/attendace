'use strict';

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcrypt');
const db = require(__base + 'app/models');
const opts = { passReqToCallback: true };

passport.use(new BasicStrategy(opts,
  async function(req, username, password, done) {
    try {
      const user = await db.Users.findOne({ where: { username } });
      if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
      }
      
      req.User = user;
      done(null, user);
    } catch (error) {
      console.log(error);
      done(err);
    }
  }
));
