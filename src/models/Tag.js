const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db');

const Tag = sequelize.define(
  'Tag',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = Tag;
