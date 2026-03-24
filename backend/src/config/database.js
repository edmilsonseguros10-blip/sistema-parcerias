const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("parcerias", "admin", "admin123", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false,
});

// Testar conexão
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Banco conectado com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err.message);
  });

module.exports = sequelize;
