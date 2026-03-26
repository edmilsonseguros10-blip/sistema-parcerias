const { Sequelize } = require("sequelize");

// Usa DATABASE_URL do ambiente (Render) ou variáveis separadas (local)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "parcerias",
      process.env.DB_USER || "admin",
      process.env.DB_PASSWORD || "admin123",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
      },
    );

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Banco conectado com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err.message);
  });

module.exports = sequelize;
