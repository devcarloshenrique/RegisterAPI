# API de Gerenciamento de Documentos

## 📝 Descrição do Projeto

API robusta desenvolvida em **Node.js com TypeScript** para autenticação e gerenciamento seguro de documentos. Suporta **upload de arquivos PDF/CSV (até 50MB)**, autenticação via **JWT**, e consulta organizada por usuário. Utiliza **PostgreSQL** com **Prisma ORM** e validações garantidas com **Zod**.

### 🔧 Funcionalidades Principais

* Autenticação segura com JWT (registro e login)
* Upload de documentos com metadados
* Listagem de arquivos por usuário autenticado
* Validação de dados em todas as requisições com Zod

A aplicação segue os princípios **SOLID** e **Clean Architecture**, garantindo código escalável, desacoplado e de fácil manutenção.

## 🛠️ Stack Tecnológica

### Core
- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Linguagem**: TypeScript
- **Build**: TSX + TypeScript

### Banco de Dados
- **ORM**: Prisma 6.12
- **Database**: PostgreSQL

### Segurança
- **Autenticação**: JWT + bcryptjs
- **Validação**: Zod

### Processamento de Arquivos
- **Upload**: Multer
- **PDF**: pdf-parse
- **CSV**: csv-parse

### Testes
- **Framework**: Vitest
- **Modo**: Watch/CI

### Ferramentas
- **Variáveis de Ambiente**: dotenv
- **Database GUI**: Prisma Studio

## 🔑 Endpoints

### Autenticação
| Método | Endpoint       | Descrição               |
|--------|----------------|-------------------------|
| POST   | /auth/register | Registrar novo usuário  |
| POST   | /auth/login    | Login e obtenção de token |

### Documentos
| Método | Endpoint          | Descrição               |
|--------|-------------------|-------------------------|
| POST   | /datasets/upload  | Upload de PDF/CSV (50MB)|
| GET    | /datasets         | Listar documentos       |
| GET    | /me               | Dados do usuário        |

## ⚡ Como Usar

1. **Registre-se**:
```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Usuario","email":"user@email.com","password":"senha123"}'
```

2. **Faça login** para obter token:
```bash
curl -X GET http://localhost:3333/me \
  -H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

3. **Obter usuários logado** 

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@email.com","password":"senha123"}'
```


4. **Use o token** (substitua <TOKEN>):
```bash
# Listar documentos
curl -X GET http://localhost:3333/datasets \
  -H "Authorization: Bearer <TOKEN>"

# Upload de arquivo
curl -X POST http://localhost:3333/datasets/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@documento.pdf"
```

## 🚀 Inicialização do Projeto

Siga estes passos para configurar e iniciar a aplicação:

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Configurar variáveis de ambiente**:
   ```bash
   # Renomeie .env.example para .env
   .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações locais

2. **Iniciar containers Docker**:
   ```bash
   docker compose up -d
   ```

3. **Instalar dependências**:
   ```bash
   npm install
   ```

4. **Configurar banco de dados**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Iniciar a aplicação**:
   Para desenvolvimento:
   ```bash
   npm run dev
   ```
   
   Para produção:
   ```bash
   npm run build
   npm start
   ```

### Verificações pós-instalação

1. Acesse o Prisma Studio para visualizar os dados:
   ```bash
   npx prisma studio
   ```
   Disponível em: `http://localhost:5555`

2. A API estará rodando em:
   - Desenvolvimento: `http://localhost:3333`
   
3. Para parar os containers:
   ```bash
   docker compose down
   ```

> **Nota**: Na primeira execução, o banco de dados pode levar alguns minutos para ficar totalmente disponível. Caso ocorram erros nas migrações, aguarde 1-2 minutos e execute novamente `npx prisma migrate deploy`.

## 🧪 Suíte de Testes

Testes implementados com Vitest cobrindo:
- Rotas de autenticação
- Validações de schema
- Casos de erro

Para executar:
```bash
npm test       # Execução única
npm run test:watch # Desenvolvimento
```

## 🏁 Conclusão
Esta API oferece uma solução completa para gerenciamento seguro de documentos, combinando boas práticas de desenvolvimento com tecnologias modernas.

### 🔮 Próximos Passos

### 📄 Documentação
- [ ] Swagger UI para documentação interativa

### 🔍 Busca Avançada
- [ ] `GET /datasets/:id/records` - Listar registros de dataset
- [ ] `GET /records/search?query=...` - Busca textual em JSON

### 🤖 IA Simulada
- [ ] `POST /queries` - Endpoint de perguntas/respostas
- [ ] Armazenar histórico em tabela `queries`

### 📊 Histórico
- [ ] `GET /queries` - Listar consultas anteriores
