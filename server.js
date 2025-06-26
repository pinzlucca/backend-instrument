const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// <-- MUDANÇA: Adicionado para confiar no proxy do Render, essencial para cookies seguros.
app.set('trust proxy', 1);

// CORS
app.use(cors({
  // Garante que a origem seja EXATAMENTE a URL do seu frontend
  origin: "https://tecnologiaessencial.com.br", 
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// <-- MUDANÇA: Configuração da sessão corrigida para produção e cross-domain
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // O cookie só será enviado em conexões HTTPS
    httpOnly: true,     // Previne acesso via JavaScript no frontend
    sameSite: 'none'    // Permite que o cookie seja enviado entre domínios diferentes
  }
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("🟢 Conectado ao MongoDB"))
.catch(err => console.error("Erro na conexão com o MongoDB:", err));


// <-- MUDANÇA: Servir arquivos estáticos ANTES da verificação de login para otimização
// Todos os arquivos na pasta 'front' serão servidos diretamente.
// Ex: /index.html, /script.js, /style.css
app.use(express.static(path.join(__dirname, "front")));

// Autenticação de sessão para rotas da API
// Este middleware agora protege apenas as rotas da API, não os arquivos estáticos
app.use((req, res, next) => {
  // Rotas da API que não precisam de login
  const urlLivreAPI = ["/login", "/check-auth", "/logout"];
  
  // Se a rota não for da API (já foi tratada pelo express.static) ou for uma rota livre, continue
  if (urlLivreAPI.includes(req.path) || !req.path.startsWith('/instrumentos')) {
    return next();
  }

  // Para todas as outras rotas da API (como /instrumentos), verifique a sessão
  if (!req.session || !req.session.usuario) {
    // Para chamadas de API, é melhor retornar um erro do que redirecionar
    return res.status(401).json({ error: "Não autorizado" });
  }
  
  next();
});

// Login
// <-- MUDANÇA: Em vez de redirecionar, envia uma resposta JSON para o frontend tratar.
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === process.env.LOGIN_USUARIO && senha === process.env.LOGIN_SENHA) {
    req.session.usuario = usuario;
    res.status(200).json({ success: true, message: "Login bem-sucedido" });
  } else {
    res.status(401).json({ success: false, message: "Usuário ou senha inválidos." });
  }
});

// <-- MUDANÇA: Rota renomeada de "/verifica-login" para "/check-auth" para corresponder ao frontend
app.get("/check-auth", (req, res) => {
  if (req.session && req.session.usuario) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Não foi possível fazer logout" });
    }
    // Limpa o cookie no navegador
    res.clearCookie('connect.sid'); // O nome 'connect.sid' é o padrão do express-session
    res.status(200).json({ message: "Logout bem-sucedido" });
  });
});

// Rotas da API de Instrumentos
const instrumentsRoutes = require("./routes/instruments");
app.use("/instrumentos", instrumentsRoutes);

// Rota de teste
app.get("/test", (req, res) => {
  res.json({ message: "Teste funcionando!" });
});

// Rota catch-all para servir o index.html em caso de rotas de frontend (SPA-like behavior)
// Deve ser uma das últimas rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});