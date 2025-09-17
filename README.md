# API de Gerenciamento de Documentos

## 📝 Descrição do Projeto

API robusta desenvolvida em **Node.js com TypeScript** para autenticação, gerenciamento seguro de documentos e **processamento assíncrono de arquivos em background**. Suporta **upload de arquivos PDF/CSV (até 50MB)**, autenticação via **JWT** e consulta organizada por usuário.

Para otimizar a performance e a escalabilidade, a API utiliza **Redis com BullMQ** para enfileirar e processar o parsing de documentos, aproveitando **streaming e workers**. O progresso das filas pode ser monitorado através de um dashboard interativo com **Bull Board**.

A aplicação segue os princípios **SOLID** e **Clean Architecture**, garantindo código escalável, desacoplado e de fácil manutenção.

### 🔧 Funcionalidades Principais

  * **Autenticação segura**: Registro e login com JWT.
  * **Upload de documentos**: Suporte para PDF/CSV com metadados.
  * **Processamento em background**: Filas com **Redis** e **BullMQ** para parsing assíncrono.
  * **Otimização de performance**: Uso de **streaming e workers** para analisar arquivos grandes sem sobrecarregar a aplicação.
  * **Monitoramento de filas**: Dashboard com **Bull Board** para visualizar o status dos jobs.
  * **Documentação da API**: Endpoints documentados e testáveis com **Swagger (OpenAPI)**.
  * **Validação de dados**: Tipagem e validação em todas as requisições com **Zod**.
  * **Tratamento de Erros**: Error Handler centralizado para uma gestão consistente de exceções.

## 🛠️ Stack Tecnológica

### Core

  - **Runtime**: Node.js (v18+)
  - **Framework**: Express 5.x
  - **Linguagem**: TypeScript
  - **Build**: TSX + TypeScript

### Banco de Dados

  - **ORM**: Prisma
  - **Database**: PostgreSQL

### Filas e Processamento em Background

  - **In-Memory Store**: Redis
  - **Gerenciador de Filas**: BullMQ

### Segurança

  - **Autenticação**: JWT + bcryptjs
  - **Validação**: Zod

### Processamento de Arquivos

  - **Upload**: Multer
  - **Parsing**: `pdf-parse` e `csv-parse` com suporte a streaming.

### Documentação e Monitoramento

  - **API Docs**: Swagger (via `swagger-ui-express`)
  - **Monitoramento de Filas**: Bull Board

### Testes

  - **Framework**: Vitest
  - **Modo**: Watch/CI

## 🔑 Endpoints e Interfaces

### API

| Método | Endpoint          | Descrição               |
|--------|-------------------|-------------------------|
| POST   | api/auth/register    | Registrar novo usuário  |
| POST   | api/auth/login       | Login e obtenção de token |
| GET    | api/me               | Dados do usuário logado   |
| POST   | api/datasets/upload  | Upload de PDF/CSV (50MB)|
| GET    | api/datasets         | Listar documentos       |

### Gerenciamento e Documentação

| Interface         | Endpoint                    | Descrição                               |
|-------------------|--------------------------------|-------------------------------------------|
| **Swagger UI**    | /docs | Documentação interativa e teste de endpoints |
| **Bull Board**    | /admin/queues | Dashboard para monitoramento das filas    |

## 🚀 Inicialização do Projeto

Você pode executar este projeto de duas maneiras: utilizando Docker (recomendado para maior simplicidade) ou configurando o ambiente manualmente.

### Opção 1: Com Docker (Recomendado)

Este é o método mais rápido e fácil para subir toda a aplicação, incluindo o banco de dados e o Redis, sem a necessidade de instalar nada além do Docker.


**Pré-requisitos**
  - Docker e Docker Compose instalados

**Passo a Passo**

1.  **Clone o repositório e configure as variáveis de ambiente:**
    ```bash
    git clone https://github.com/devcarloshenrique/RegisterAPI
    cd RegisterAPI
    cp .env.example .env 
    ```
    *Obs: As configurações no `.env` já estão ajustadas para o ambiente Docker, mas sinta-se à vontade para revisar.*    

2.  **Inicie todos os serviços com Docker Compose:**

    ```bash
    docker compose up -d
    ```

### Opção 2: Manualmente (Ambiente Local)

Utilize este método se preferir configurar cada serviço em sua própria máquina.

**Pré-requisitos:**
- Node.js (versão 18 ou superior)
- Instância do PostgreSQL rodando
- Instância do Redis rodando

**Passo a Passo**
1.  **Clone o repositório e instale as dependências:**
    ```bash
    git clone https://github.com/devcarloshenrique/RegisterAPI
    cd RegisterAPI
    ```
2.  **Configure as variáveis de ambiente:**
    ```bash
    cp .env.example .env
    ```
    *Edite o arquivo `.env` com as strings de conexão para seu PostgreSQL e Redis locais.*

3.  **Execute as migrações do banco de dados:**
    ```bash
    npx prisma migrate dev
    ```

4.  **Inicie a aplicação:**
      ```bash
      npm install
      npm run dev
      npm run dev:worker
    ```

## 💻 Acessando os Serviços

Após a inicialização por qualquer um dos métodos acima, os seguintes serviços estarão disponíveis:

  * **API**: [`http://localhost:3333`](https://www.google.com/search?q=http://localhost:3333)
  * **Documentação Swagger**: [`http://localhost:3333/docs`](https://www.google.com/search?q=http://localhost:3333/docs)
  * **Dashboard Bull Board**: [`http://localhost:3333/admin/queues`](https://www.google.com/search?q=http://localhost:3333/admin/queues)

## 🧪 Suíte de Testes

Para executar os testes e garantir a integridade do código, utilize os seguintes comandos:

```bash
# Execução única dos testes
npm test

# Executar testes em modo de desenvolvimento (watch)
npm run test:watch
```
