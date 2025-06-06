const sequelize = require('./index.js');
const { Model, DataTypes } = require("sequelize");

class ConversationTable extends Model { }

const fields = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Model ID'
  },
  conversation_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Conversation ID'
  },
  selected_repository: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Associated Code Repository'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Title'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Content'
  },
  input_tokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Input Tokens',
    defaultValue: 0
  },
  output_tokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Output Tokens',
    defaultValue: 0
  },
  create_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Create Time'
  },
  update_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Update Time'
  },
  is_favorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Is Favorite'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'done',
    comment: 'Status'
  }
};

ConversationTable.init(fields, {
  sequelize,
  modelName: 'conversation'
});


module.exports = exports = ConversationTable;