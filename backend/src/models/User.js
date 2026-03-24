const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
    },
    pix_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("partner", "admin"),
      defaultValue: "partner",
    },
    status: {
      type: DataTypes.ENUM("active", "blocked"),
      defaultValue: "active",
    },
    level: {
      type: DataTypes.ENUM("bronze", "prata", "ouro", "diamante"),
      defaultValue: "bronze",
    },
    total_contracts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_commission: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    experience_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    referral_code: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
    },
  },
);

User.prototype.checkPassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;
