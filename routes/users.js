const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const { authByToken } = require('../middleware/auth');
const { passport } = require('../services/passport');

router.post('/users', UserController.createUser);
router.post('/users/login', UserController.loginUser);
router.get('/user', authByToken, UserController.getUserByEmail);
router.put(
  '/user',
  passport.authenticate('jwt', { session: false }),
  UserController.updateUserDetails,
);

module.exports = router;
