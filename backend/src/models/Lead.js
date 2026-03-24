const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lead = sequelize.define(
  "Lead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    insurance_type: {
      type: DataTypes.STRING,
    },
    observations: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "nova",
    },
    contract_value: {
      type: DataTypes.DECIMAL,
    },
    commission_value: {
      type: DataTypes.DECIMAL,
    },
    insurance_company: {
      type: DataTypes.STRING,
    },
    policy_number: {
      type: DataTypes.STRING,
    },
    contract_date: {
      type: DataTypes.DATE,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "leads",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Lead;
