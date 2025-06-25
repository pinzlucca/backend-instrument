
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
  origin: "https://tecnologiaessencial.com.br",
  credentials: true
}));
app.options("*", cors());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("🟢 Conectado ao MongoDB"))
.catch(err => console.error("Erro na conexão com o MongoDB:", err));

// Autenticação de sessão
app.use((req, res, next) => {
  const urlLivre = ["/login.html", "/login", "/verifica-login", "/logout"];
  const isStatic = req.url.match(/\.(html|js|css|png|jpg|jpeg|gif)$/);
  const permitido = urlLivre.includes(req.path) || isStatic;

  if (!permitido && (!req.session || !req.session.usuario)) {
    return res.redirect("/login.html");
  }
  next();
});

// Login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === process.env.LOGIN_USUARIO && senha === process.env.LOGIN_SENHA) {
    req.session.usuario = usuario;
    res.redirect("/index.html");
  } else {
    res.status(401).send("Usuário ou senha inválidos.");
  }
});

// Verificação de sessão
app.get("/verifica-login", (req, res) => {
  if (req.session && req.session.usuario) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// Rotas
const instrumentsRoutes = require("./routes/instruments");
app.use("/instrumentos", instrumentsRoutes);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rota de teste
app.get("/test", (req, res) => {
  res.json({ message: "Teste funcionando!" });
});

// Middleware 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});