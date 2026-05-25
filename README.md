# LiftNote

Aplicação web full-stack para acompanhamento de treinos, com coaching por IA, histórico de sessões e localização de academias próximas.

## Tecnologias

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT para autenticação
- Zod para validação
- Google Gemini API (coach IA)
- Geoapify API (localização de academias)
- Nodemailer (emails)
- Swagger (documentação da API)

**Frontend**
- Vue 3 + TypeScript
- Vite
- Vue Router + Pinia
- Tailwind CSS
- Axios

## Funcionalidades

- Cadastro e autenticação de usuários (JWT)
- Catálogo de exercícios (global + personalizado)
- Criação e gerenciamento de treinos
- Sessões de treino ao vivo com registro de séries e cargas
- Histórico de sessões e progresso por exercício
- Coach IA com análise de sessão, sobrecarga progressiva e relatório semanal
- Localização de academias por geolocalização
- Recuperação de senha por e-mail

## Estrutura

```
liftnote/
├── backend/    # API REST (Node.js/Express)
└── frontend/   # SPA (Vue 3)
```

## Instalação e execução

### Pré-requisitos

- Node.js 18+
- MongoDB em execução local ou URI remota

### Backend

```bash
cd liftnote/backend
npm install
```

Crie o arquivo `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/liftnote
JWT_SECRET=seu_secret_aqui
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=usuario@example.com
EMAIL_PASS=senha
EMAIL_FROM=noreply@liftnote.com
APP_URL=http://localhost:3000

# APIs externas
GEMINI_API_KEY=sua_chave_gemini
GEOAPIFY_API_KEY=sua_chave_geoapify
```

```bash
npm run seed   # Popula o catálogo de exercícios
npm run dev    # Servidor de desenvolvimento
npm start      # Produção
```

A API estará disponível em `http://localhost:3000`.  
Documentação Swagger: `http://localhost:3000/api-docs`

### Frontend

```bash
cd liftnote/frontend
npm install
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run type-check # Verificação de tipos TypeScript
npm run preview    # Preview do build
```

O frontend estará disponível em `http://localhost:5173`.

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/workouts` | Listar treinos |
| POST | `/api/workouts` | Criar treino |
| POST | `/api/sessions` | Iniciar sessão |
| GET | `/api/sessions/:id` | Detalhes da sessão |
| GET | `/api/exercises/catalog` | Catálogo de exercícios |
| GET | `/api/ai/session-analysis/:id` | Análise IA da sessão |
| GET | `/api/places/gyms` | Academias próximas |

Consulte `/api-docs` para a documentação completa.

## Healthcheck

```
GET /health
```
