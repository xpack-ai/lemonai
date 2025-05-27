const { Sequelize } = require('sequelize');
const path = require('path')

const config = process.env;


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../../', config.STORAGE_PATH || 'data/database.sqlite'),
  define: {
    timestamps: false,
    freezeTableName: true,
  },
  logging: false
});

module.exports = exports = sequelize;
