const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportJWT = require('passport-jwt');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const { SESSION_SECRET, ACCESS_TOKEN_SECRET } = require('../config');
const { User } = require('../models');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          where: {
            email,
          },
          raw: true,
        });

        User.comparePassword(password, user.password, (err, matched) => {
          if (err) {
            throw err;
          }

          if (matched) {
            done(null, user);
          } else {
            done(null, false, { message: 'Invalid username / password' });
          }
        });
      } catch (err) {
        done(null, false, { message: 'Invalid username / password' });
      }
    },
  ),
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: ACCESS_TOKEN_SECRET,
    },
    async (jwtPaylod, done) => {
      try {
        const user = await User.findById(jwtPaylod.user._id);

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

const sessionConfig = session({
  store: new FileStore(),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
});

module.exports = { passport, session: sessionConfig };
