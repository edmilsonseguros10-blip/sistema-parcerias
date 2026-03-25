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

// DIAGNÓSTICO: listar arquivos na pasta raiz
const rootPath = path.join(__dirname, "../..");
console.log("📁 Pasta raiz:", rootPath);
console.log("📁 Conteúdo da raiz:", fs.readdirSync(rootPath));

// Caminho para frontend
const frontendPath = path.join(rootPath, "frontend");
console.log("📁 Pasta frontend:", frontendPath);

if (fs.existsSync(frontendPath)) {
  console.log("✅ Pasta frontend encontrada!");
  console.log("📁 Conteúdo:", fs.readdirSync(frontendPath));
} else {
  console.log("❌ PASTA FRONTEND NÃO ENCONTRADA!");
}

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`index.html não encontrado em: ${indexPath}`);
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

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando!" });
});

sequelize
  .sync()
  .then(() => console.log("✅ Tabelas sincronizadas"))
  .catch((err) => console.error("❌ Erro ao sincronizar:", err));

sequelize
  .authenticate()
  .then(() => console.log("✅ Banco conectado!"))
  .catch((err) => console.error("❌ Banco:", err.message));

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
