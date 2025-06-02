# Backend - Sistema de Controle de Instrumentos Musicais

Este é o backend de um sistema para gerenciamento de instrumentos musicais em assistência técnica. Ele permite o cadastro, movimentação por status (aguardando, em serviço, em garantia, CRM) e controle automático de prazos com histórico.

## Funcionalidades

- ✅ Cadastro de instrumentos com nome, cliente, descrição e status inicial
- 🔁 Mudança manual ou automática de status
- 📅 Histórico com data/hora de cada mudança de status
- ⏳ Transição automática para:
  - `em garantia` por 90 dias após conclusão do serviço
- ❌ Exclusão de instrumentos manualmente
- 🌐 API REST com endpoints

## 📦 Tecnologias

- Node.js
- Express.js
- MongoDB + Mongoose
- CORS
- Dotenv

## 📁 Estrutura de Arquivos
backend-instrument/
├── models/
│ └── Instrumento.js # Schema do instrumento
├── routes/
│ └── instrumentos.js # Rotas da API
├── .env # Variáveis de ambiente (ex: MONGO_URI)
├── server.js # Arquivo principal
├── package.json # Dependências
└── README.md
