const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  pix_key: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'partner'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active'
  },
  level: {
    type: DataTypes.STRING(20),
    defaultValue: 'bronze'
  },
  total_contracts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  experience_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;