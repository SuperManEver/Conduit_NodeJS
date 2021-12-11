const { User } = require('../models');
const { hashPassword, matchPassword } = require('../utils/password');
const { signAccessToken } = require('../utils/auth');

async function createUser(req, res) {
  try {
    // @todo: add 'joy' for input validation
    if (!req.body.user.username) throw new Error('Username is Required');
    if (!req.body.user.email) throw new Error('Email is Required');
    if (!req.body.user.password) throw new Error('Password is Required');

    // @todo: this step can be extracted to middleware??
    const existingUser = await User.findByPk(req.body.user.email);

    if (existingUser) {
      throw new Error('User already exists with this email id');
    }

    const user = await User.create(req.body.user);

    if (user) {
      if (user.dataValues.password) {
        delete user.dataValues.password;
      }

      user.dataValues.token = await signAccessToken(user.dataValues);
      user.dataValues.bio = null;
      user.dataValues.image = null;
      res.status(201).json({ user });
    }
  } catch (e) {
    res
      .status(422)
      .json({ errors: { body: ['Could not create user ', e.message] } });
  }
}

async function login(req, res) {
  try {
    /**
     * @todo: probably this should be migrated to controller
     */

    const { email, password } = res.locals.user;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(403);
      throw new Error('Invalid credentials');
    }

    const result = await user.comparePassword(password);

    console.log(result);

    /**
     * + 1. extract user's credentials from req's body
     * + 2. make sure required params are present
     * + 3. find user by given email
     * + 4. compare given password's hash with password in DB
     * 5. if passwords are match return user's info and creat access token
     */

    res.json({ message: 'ok!' });
  } catch (e) {
    const status = res.statusCode ? res.statusCode : 500;
    res.status(status).json({
      errors: { body: ['Login failed', e.message].join(' ') },
    });
  }
}

async function loginUser(req, res) {
  try {
    if (!req.body.user.email) throw new Error('Email is Required');
    if (!req.body.user.password) throw new Error('Password is Required');

    const user = await User.findByPk(req.body.user.email);

    if (!user) {
      res.status(401);
      throw new Error('No User with this email id');
    }

    // Check if password matches
    const passwordMatch = await matchPassword(
      user.password,
      req.body.user.password,
    );

    if (!passwordMatch) {
      res.status(401);
      throw new Error('Invalid password or email id');
    }

    delete user.dataValues.password;
    user.dataValues.token = await signAccessToken({
      email: user.dataValues.email,
      username: user.dataValues.username,
    });

    res.status(200).json({ user });
  } catch (e) {
    const status = res.statusCode ? res.statusCode : 500;
    res
      .status(status)
      .json({ errors: { body: ['Could not create user ', e.message] } });
  }
}

async function getUserByEmail(req, res) {
  try {
    const user = await User.findByPk(req.user.email);
    if (!user) {
      throw new Error('No such user found');
    }
    delete user.dataValues.password;
    user.dataValues.token = req.header('Authorization').split(' ')[1];
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(404).json({
      errors: { body: [e.message] },
    });
  }
}

async function updateUserDetails(req, res) {
  try {
    const user = await User.findByPk(req.user.email);

    if (!user) {
      res.status(401);
      throw new Error('No user with this email id');
    }

    if (req.body.user) {
      const username = req.body.user.username
        ? req.body.user.username
        : user.username;

      const bio = req.body.user.bio ? req.body.user.bio : user.bio;
      const image = req.body.user.image ? req.body.user.image : user.image;
      let password = user.password;

      if (req.body.user.password) {
        password = await hashPassword(req.body.user.password);
      }

      const updatedUser = await user.update({ username, bio, image, password });
      delete updatedUser.dataValues.password;

      // @todo: this should be done through middle ware
      updatedUser.dataValues.token = req.header('Authorization').split(' ')[1];
      res.json({ user: updatedUser });
    } else {
      delete user.dataValues.password;
      user.dataValues.token = req.header('Authorization').split(' ')[1];
      res.json(user);
    }
  } catch (e) {
    const status = res.statusCode ? res.statusCode : 500;
    return res.status(status).json({
      errors: { body: [e.message] },
    });
  }
}

module.exports = {
  updateUserDetails,
  createUser,
  loginUser,
  login,
  getUserByEmail,
};
