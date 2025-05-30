const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS para permitir apenas o domínio do frontend
app.use(cors({ origin: "https://frontinstrument.netlify.app" }));

// Habilita o tratamento de requisições preflight para todas as rotas
app.options('*', cors());

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

// Importa e registra as rotas dos instrumentos
const instrumentsRoutes = require("./routes/instruments");
app.use("/instrumentos", instrumentsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});