const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const { authByToken } = require('../middleware/auth');
const { passport } = require('../services/passport');

router.post('/users', UserController.createUser);

router.post('/users/login', (req, res, next) => {
  console.log('BEFORE: ', req.body);

  passport.authenticate('local', async (err, user) => {
    // await AuthController.validateLoginParams(req.body);

    console.log('user: ', user);

    if (err) {
      return next(err);
    }

    if (!user) {
      console.log('NO USER!', user);
      return res.status(400).json({ message: 'Error' });
    }

    req.login(user, async () => {
      const data = AuthController.login(user);

      res.json({ data });
    });
  })(req, res, next);
});

router.get('/user', authByToken, UserController.getUserByEmail);
router.put(
  '/user',
  passport.authenticate('jwt', { session: false }),
  UserController.updateUserDetails,
);

module.exports = router;
