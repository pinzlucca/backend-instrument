const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Corrigido: sem barra no final
app.use(cors({ origin: "https://tecnologiaessencial.com.br/front/" }));

// Preflight
app.options("*", cors());

// Middlewares
app.use(express.json());

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Conectado ao MongoDB"))
  .catch((err) => console.error("Erro na conexão com o MongoDB:", err));

// Rotas
const instrumentsRoutes = require("./routes/instruments");
app.use("/instrumentos", instrumentsRoutes);

// Teste
app.get("/test", (req, res) => {
  res.json({ message: "Teste funcionando!" });
});

// Middleware 404 com headers CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://tecnologiaessencial.com.br/front/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    return res.status(200).json({});
  }
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
