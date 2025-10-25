# BetweenUsServerJs
![Code](https://tokei.rs/b1/github/Btw-Us/BetweenUsServerJs?category=code)
[![wakatime](https://wakatime.com/badge/user/3a4240f0-6bea-4626-be2a-1129790e4336/project/37bfa66f-b585-4363-8b5b-cf82d0c585d8.svg)](https://wakatime.com/badge/user/3a4240f0-6bea-4626-be2a-1129790e4336/project/37bfa66f-b585-4363-8b5b-cf82d0c585d8)

> *A humble server, fueling fragments of a quiet dream.*

**BetweenUsServerJs** is the backend powering the BetweenUs chat application. It is built with a modern technology stack to ensure scalability, reliability, and maintainability.

⚠️ **Warning:** This project is currently under active development. Features may be incomplete or unstable.

---

## Technology Stack

*   **Framework**: [Express.js](https://expressjs.com/) – Minimalist web framework for Node.js
*   **Database**: [MongoDB](https://www.mongodb.com/) – NoSQL database for chat data
*   **ODM**: [Mongoose](https://mongoosejs.com/) – Elegant mongodb object modeling for node.js
*   **Language**: [TypeScript](https://www.typescriptlang.org/) – Typed superset of JavaScript
*   **Authentication**: JWT (Planned)
*   **Environment Variables**: [Dotenv](https://github.com/motdotla/dotenv)
*   **Containerization**: [Docker](https://www.docker.com/)

---

## Directory Structure

```
.
├── src
│   ├── config
│   ├── middleware
│   ├── module
│   ├── service
│   └── utils
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Configuration

### 1. Environment Variables (`.env`)

Create a `.env` file in the root of the project and add the following variables. You can use `.env.example` as a template.

```dotenv
# Application
PORT=YOUR_PORT
NODE_ENV=YOUR_NODE_ENV

# Database URLs
DATABASE_URL=mongodb://YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME
SERVER_DATABASE_URL=mongodb://YOUR_DB_HOST:YOUR_DB_PORT/YOUR_SERVER_DB_NAME

# Server Password for generating server tokens
SERVER_ADMIN_PASSWORD=YOUR_SERVER_ADMIN_PASSWORD

# MongoDB
MONGO_PORT=YOUR_MONGO_PORT
MONGO_INITDB_DATABASE=YOUR_MONGO_INITDB_DATABASE

# MongoDB Data Storage Path
# Options:
# 1. Named volume (default): mongo-data
# 2. Relative path: ./mongodb-data
# 3. Absolute path: /var/lib/mongodb
# Default: mongo-data (Docker named volume)
MONGO_DATA_PATH=YOUR_MONGO_DATA_PATH

# Mongo Express Admin Panel
MONGO_EXPRESS_PORT=YOUR_MONGO_EXPRESS_PORT
ME_CONFIG_MONGODB_SERVER=YOUR_MONGO_EXPRESS_DB_HOST
ME_CONFIG_MONGODB_PORT=YOUR_MONGO_EXPRESS_DB_PORT
ME_CONFIG_BASICAUTH_USERNAME=YOUR_ME_USERNAME
ME_CONFIG_BASICAUTH_PASSWORD=YOUR_ME_PASSWORD
```

---

## Running the Application

1.  **Prerequisites**
    *   Install [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
    *   Install [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/)

2.  **Clone Repo**

    ```bash
    git clone https://github.com/Btw-Us/BetweenUsServerJs.git
    cd BetweenUsServerJs
    ```

3.  **Create Configs**

    *   Create a `.env` file from `.env.example`.

4.  **Run with Docker**

    ```bash
    docker-compose up --build
    ```

5.  **Access Services**

    *   Main App → `http://localhost:3000`
    *   MongoDB (Mongo Express) → `http://localhost:8081`

---

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build for production
npm run build

# Start in production
npm run start
```

### Docker Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs for the app service
docker-compose logs app

# Stop services
docker-compose down

# Stop services and remove volumes (⚠️ data loss)
docker-compose down -v

# Rebuild a specific service
docker-compose up --build app
```
