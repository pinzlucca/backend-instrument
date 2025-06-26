const express = require("express");
const mongoose = require("mongoose");
const cors =require("cors");
const session = require("express-session");
const MongoStore = require('connect-mongo'); // Importa o MongoStore
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors({
  origin: "https://tecnologiaessencial.com.br", // URL exata do seu frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DE SESSÃO COM MONGOSTORE ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // Diz ao express-session para usar o MongoDB para armazenar as sessões
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60, // Tempo de vida da sessão: 14 dias
    autoRemove: 'native'
  }),
  cookie: {
    secure: true,
    httpOnly: true, // Importante para segurança
    sameSite: 'none' // Essencial para cross-domain
  }
}));
// --- FIM DA CONFIGURAÇÃO DE SESSÃO ---

// Conexão com MongoDB (sem alterações)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("🟢 Conectado ao MongoDB"))
.catch(err => console.error("Erro na conexão com o MongoDB:", err));

// ROTAS DA API
// Note que não há mais 'express.static' ou 'res.sendFile' aqui,
// pois o backend agora só serve a API, o que é mais limpo.

app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === process.env.LOGIN_USUARIO && senha === process.env.LOGIN_SENHA) {
    req.session.usuario = usuario;
    req.session.save(() => { // Garante que a sessão foi salva antes de responder
        res.status(200).json({ success: true, message: "Login bem-sucedido" });
    });
  } else {
    res.status(401).json({ success: false, message: "Usuário ou senha inválidos." });
  }
});

app.get("/check-auth", (req, res) => {
  if (req.session && req.session.usuario) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Não foi possível fazer logout" });
    res.clearCookie('connect.sid');
    res.status(200).json({ message: "Logout bem-sucedido" });
  });
});

const instrumentsRoutes = require("./routes/instruments");
// Adiciona um middleware de proteção a todas as rotas de instrumentos
const protectRoute = (req, res, next) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    next();
};
app.use("/instrumentos", protectRoute, instrumentsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});