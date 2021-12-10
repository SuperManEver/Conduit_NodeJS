const express = require('express');
const Joi = require('joi');

const router = express.Router();
const UserController = require('../controllers/users');
const { authByToken } = require('../middleware/auth');
const { passport } = require('../services/passport');

router.post('/users', UserController.createUser);

async function checkLoginCredentialsPresence(req, res, next) {
  try {
    if (!req.body.user) {
      res.status(403);
      throw new Error("Incorrect user's credentials");
    }

    const schema = Joi.object({
      password: Joi.string().min(3).max(30).required(),
      email: Joi.string().email({
        minDomainSegments: 2,
      }),
    });

    res.locals.user = await schema.validateAsync(req.body.user);

    next();
  } catch (err) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: err.message },
    });
  }
}

router.post('/users/login', checkLoginCredentialsPresence, (req, res, next) => {
  console.log('CURRENT USER: ', res.locals.user);

  /**
   * 1. extract user's credentials from req's body
   * 2. make sure required params are present
   * 3. find user by given email
   * 4. compare given password's hash with password in DB
   * 5. if passwords are match return user's info and creat access token
   */

  res.json({ message: 'ok!' });
});

router.get('/user', authByToken, UserController.getUserByEmail);
router.put(
  '/user',
  passport.authenticate('jwt', { session: false }),
  UserController.updateUserDetails,
);

module.exports = router;
