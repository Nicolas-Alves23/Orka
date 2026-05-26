# 💰 FinanceIA — Backend

> Backend robusto para gestão financeira inteligente com IA (Claude) + dados reais da bolsa brasileira (BRAPI).

## 🚀 Tech Stack

| Tecnologia | Uso |
|---|---|
| **Node.js + TypeScript** | Runtime e tipagem estática |
| **Express** | Framework HTTP |
| **Drizzle ORM** | ORM type-safe para PostgreSQL |
| **Supabase** | Banco de dados PostgreSQL |
| **Claude (Anthropic)** | IA para recomendações personalizadas |
| **BRAPI** | Dados ao vivo da B3 |
| **Zod** | Validação de schemas |
| **JWT + Bcrypt** | Autenticação segura |
| **Helmet + CORS** | Segurança HTTP |

## 📁 Estrutura

```
src/
├── config/          # Variáveis de ambiente validadas
├── db/              # Schema Drizzle + conexão
├── middlewares/     # Auth, erro, rate limit
├── modules/
│   ├── auth/        # Register + Login
│   ├── finance/     # Perfil + divisão de orçamento
│   ├── ai/          # Recomendações com Claude
│   └── investments/ # Integração BRAPI
├── utils/           # Erros, JWT, responses
├── app.ts
└── server.ts
```

## 🔌 Endpoints

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |

### Finance
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/finance/profile` | Salvar perfil financeiro |
| GET | `/api/finance/profile` | Buscar perfil |
| GET | `/api/finance/budget-division` | Ver divisão do orçamento |
| GET | `/api/finance/history` | Histórico de recomendações |

### AI
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/ai/recommend` | Gerar recomendação personalizada |

## ⚙️ Como rodar localmente

```bash
# 1. Clone e instale
git clone https://github.com/seu-usuario/financeia
cd financeia/backend
npm install

# 2. Configure variáveis
cp .env.example .env
# Preencha DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY

# 3. Rode as migrations
npm run db:migrate

# 4. Inicie
npm run dev
```

## 🌍 Deploy

Backend hospedado no **Render** com deploy automático via GitHub.

`render.yaml` já configurado — basta conectar o repositório no [render.com](https://render.com).

## 📄 Licença

MIT
