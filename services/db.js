const _ = require('lodash');
const { Sequelize, QueryTypes, DataTypes } = require('sequelize');

const configDB = require('../config/database');

const nodeEnv = process.env.NODE_ENV || 'development';
const configDbForEnv = configDB[nodeEnv];
const sequelizeOptions = _.omit(configDbForEnv, ['url']);

const dbConnect = new Sequelize(configDbForEnv.url, sequelizeOptions);

const checkConnection = async () => {
  try {
    await dbConnect.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

checkConnection();

module.exports = {
  dbConnect,
  sequelize: dbConnect,
  Sequelize,
  QueryTypes,
  DataTypes,
};
