const path = require('path');
const process = require('process');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const { SESSION_SECRET, ACCESS_TOKEN_SECRET } = require('../config');
const { User } = require('../models');

const JWTStrategy = passportJWT.Strategy;

const AUTH_HEADER = 'authorization';

function customTokenExtract() {
  return function (request) {
    let token = null;

    if (request.headers[AUTH_HEADER]) {
      const value = request.headers[AUTH_HEADER].split(/\s{1,}/);

      if (value[1]) {
        return value[1];
      }
    }

    return token;
  };
}

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: customTokenExtract(),
      secretOrKey: ACCESS_TOKEN_SECRET,
    },
    async (jwtPaylod, done) => {
      try {
        const { user } = jwtPaylod;

        const loggedInUser = await User.findOne({
          where: { email: user.email },
        });

        done(null, loggedInUser);
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
