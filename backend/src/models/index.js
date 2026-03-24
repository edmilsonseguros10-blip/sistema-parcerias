const sequelize = require("../config/database");
const User = require("./User");
const Lead = require("./Lead");

// Definir relacionamentos
User.hasMany(Lead, { foreignKey: "user_id" });
Lead.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Lead,
};
