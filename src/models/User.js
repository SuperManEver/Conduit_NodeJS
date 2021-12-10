const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db');
const { encryptPassword } = require('../utils/auth');

const User = sequelize.define(
  'User',
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

User.beforeCreate(async (user) => {
  user.password = await encryptPassword(user.password);
});

User.prototype.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) =>
    bcrypt.compare(candidatePassword, this.password, (err, same) => {
      if (err || !same) {
        reject(err);
        return;
      }

      resolve(this.dataValues);
    }),
  );
};

module.exports = User;
