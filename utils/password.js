const bcrypt = require('bcrypt');

const { SALT_WORK_FACTOR } = require('../config');

module.exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_WORK_FACTOR, (err, encrypted) => {
      if (err) return reject(err);

      resolve(encrypted);
    });
  });
};

module.exports.matchPassword = (hash, password) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, same) => {
      if (err) return reject(err);
      resolve(same);
    });
  });
};
