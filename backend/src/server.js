const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
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

// Servir arquivos estáticos da pasta frontend
// Serve arquivos estáticos da pasta 'frontend', funcionando localmente e no Render
const frontendPath = path.join(
  __dirname,
  process.env.NODE_ENV === "production" ? "../../frontend" : "../frontend",
);
app.use(express.static(frontendPath));
app.get("/teste", (req, res) => {
  res.send("<h1>Teste OK! Servidor está respondendo rotas normais.</h1>");
});
// Rotas
const authRoutes = require("./routes/auth.routes");
const leadRoutes = require("./routes/lead.routes");
const adminRoutes = require("./routes/admin.routes");
const commissionRoutes = require("./routes/commission.routes"); // const commissionRoutes = require("./routes/commission.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/commissions", commissionRoutes); // app.use("/api/commissions", commissionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando!" });
});

// Sincronizar banco
sequelize
  .sync()
  .then(() => console.log("✅ Tabelas sincronizadas"))
  .catch((err) => console.error("❌ Erro:", err));

sequelize
  .authenticate()
  .then(() => console.log("✅ Banco conectado!"))
  .catch((err) => console.error("❌ Banco:", err.message));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/index.html`);
});
