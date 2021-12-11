const path = require('path');
const process = require('process');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const { SESSION_SECRET, ACCESS_TOKEN_SECRET } = require('../config');
const { User } = require('../models');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// @todo: remove 'local' strategy for passport.js

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: ACCESS_TOKEN_SECRET,
    },
    async (jwtPaylod, done) => {
      try {
        const user = await User.findOne({ where: { email: jwtPaylod.email } });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

const sessionConfig = session({
  store: new FileStore({ path: path.join(process.cwd(), 'sessions') }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
});

module.exports = { passport, session: sessionConfig };
