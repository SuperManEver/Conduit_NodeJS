const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config');

module.exports.sign = async (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        username: user.username,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      (err, token) => {
        if (err) return reject(err);
        return resolve(token);
      },
    );
  });
};

module.exports.decode = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return reject(err);

      return resolve(decoded);
    });
  });
};
