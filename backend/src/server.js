const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Rotas
const authRoutes = require("./routes/auth.routes");
const leadRoutes = require("./routes/lead.routes");
const adminRoutes = require("./routes/admin.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando!" });
});

// ========== ENDPOINT PARA CRIAR TABELAS ==========
app.get("/api/sync", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    res.json({
      message: "✅ Tabelas recriadas com sucesso!",
      tables: ["users", "leads"],
    });
  } catch (error) {
    console.error("Erro ao sincronizar:", error);
    res.status(500).json({ error: error.message });
  }
});
// =================================================

// Testar banco
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Banco conectado com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro no banco:", err.message);
  });

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
