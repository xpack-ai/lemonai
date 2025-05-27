const sequelize = require('./index.js');
const { Model, DataTypes } = require("sequelize");

class ExperienceTable extends Model { }

const fields = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'ID'
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'type'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'title'
  },
  goal: {
    type: DataTypes.TEXT('long'),
    comment: 'goal'
  },
  content: {
    type: DataTypes.TEXT('long'),
    comment: 'Content'
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Enabled'
  },
  create_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Created At'
  },
  update_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Updated At'
  }
};

ExperienceTable.init(fields, {
  sequelize,
  modelName: 'experience'
});

module.exports = exports = ExperienceTable;