'use strict';

const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require(__base + 'app/models');
const opts = { 
  passReqToCallback: true,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (req, jwt_payload, done) => {
  try {
      const user = await db.User.findByPk(jwt_payload.id);
      if (user) {
          req.User = user;
          return done(null, user);
      } else {
          return done(null, false);
      }
  } catch (err) {
      return done(err, false);
  }
}));
