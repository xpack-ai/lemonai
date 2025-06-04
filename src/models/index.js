const { Sequelize } = require('sequelize');
const path = require('path')

const config = process.env;
const { getFilepath } = require('@src/utils/electron');
const sqliteFilepath = getFilepath('data', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqliteFilepath,
  define: {
    timestamps: false,
    freezeTableName: true,
  },
  logging: false
});

module.exports = exports = sequelize;
