const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db');

const Comment = sequelize.define('Comment', {
  body: {
    type: DataTypes.TEXT,
  },
});

module.exports = Comment;
