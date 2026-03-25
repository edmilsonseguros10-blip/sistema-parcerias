const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const sequelize = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Determinar o caminho correto para a pasta frontend
const frontendPath = path.join(__dirname, "../../frontend");
console.log("Servindo arquivos de:", frontendPath);

// Verificar se a pasta existe
if (!fs.existsSync(frontendPath)) {
  console.error("❌ PASTA FRONTEND NÃO ENCONTRADA:", frontendPath);
} else {
  console.log("✅ Pasta frontend encontrada");
}

// Servir arquivos estáticos
app.use(express.static(frontendPath));

// Rota explícita para a raiz
app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Arquivo index.html não encontrado");
  }
});

// Rotas da API
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

// Sincronizar banco
sequelize
  .sync()
  .then(() => console.log("✅ Tabelas sincronizadas"))
  .catch((err) => console.error("❌ Erro ao sincronizar:", err));

sequelize
  .authenticate()
  .then(() => console.log("✅ Banco conectado!"))
  .catch((err) => console.error("❌ Banco:", err.message));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/`);
});
