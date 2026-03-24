const express = require("express");
const path = require("path");

const app = express();

app.use(
  express.static(
    "C:/Users/edmil/OneDrive/Documentos/sistema-parcerias/frontend",
  ),
);

app.get("/teste", (req, res) => {
  res.send("Servidor mínimo funcionando!");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
});
