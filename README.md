# BetweenUsServer - Chat API

A real-time chat server application built with Express.js and TypeScript, using PocketBase as the backend database.

## Features

- 🔐 **User Authentication** - Secure sign up, sign in, and email verification
- 🎫 **Server Token Management** - Generate and validate server tokens for API access
- 💾 **PocketBase Integration** - Automatic database schema initialization
- 🐳 **Docker Support** - Containerized deployment with Docker and Docker Compose
- 📱 **Multi-Client Support** - Web, Mobile, Desktop, and API clients

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js 5
- **Database**: PocketBase
- **Package Manager**: npm

## Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Docker and Docker Compose (for containerized deployment)
- PocketBase (for local development without Docker)

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# PocketBase Configuration
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password

# Server Configuration
PORT=3000
SERVER_JWT_SECRET=your_jwt_secret_key
```

### Environment Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `POCKETBASE_URL` | URL where PocketBase is running | `http://localhost:8090` |
| `POCKETBASE_ADMIN_EMAIL` | Admin email for PocketBase authentication | Required |
| `POCKETBASE_ADMIN_PASSWORD` | Admin password for PocketBase authentication | Required |
| `PORT` | Port for the Express server | `3000` |
| `SERVER_JWT_SECRET` | Secret key for server JWT validation | Required |

## Installation

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Btw-Us/BetweenUsServerJs.git
   cd BetweenUsServerJs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PocketBase** (in a separate terminal):
   ```bash
   # Download PocketBase from https://pocketbase.io/docs/
   ./pocketbase serve --http=0.0.0.0:8090
   ```
   
   After starting PocketBase for the first time, create an admin account at `http://localhost:8090/_/`.

5. **Run the development server**:
   ```bash
   npm run start:dev
   ```

6. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment

The easiest way to deploy the application is using Docker Compose, which bundles both the Node.js server and PocketBase together.

1. **Build and start the container**:
   ```bash
   docker compose up -d --build
   ```

2. **With custom environment variables**:
   ```bash
   # Using environment file
   docker compose --env-file .env up -d --build
   
   # Or with inline variables
   POCKETBASE_ADMIN_EMAIL=admin@myapp.com \
   POCKETBASE_ADMIN_PASSWORD=supersecurepassword \
   SERVER_JWT_SECRET=my_secret_key \
   docker compose up -d --build
   ```

3. **View logs**:
   ```bash
   docker compose logs -f
   ```

4. **Stop the container**:
   ```bash
   docker compose down
   ```

5. **Stop and remove data volumes**:
   ```bash
   docker compose down -v
   ```

#### Docker Ports

| Port | Service | Description |
|------|---------|-------------|
| `3000` | Node.js Express | Main API server |
| `8090` | PocketBase | Admin UI and database API |

#### First-Time Setup with Docker

After starting the container for the first time:

1. Access PocketBase Admin UI at `http://localhost:8090/_/`
2. Create the initial admin account using the credentials from your environment variables
3. The Node.js server will automatically initialize the required database collections

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Server welcome page and status |

### Server Token Endpoints

Requires `x-server-jwt` header and `x-client-type` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/server/token/create` | Create a new server token |

### Health Check Endpoints

Requires `Authorization: Bearer <token>` header and `x-client-type` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check endpoint |

### Authentication Endpoints

Requires `Authorization: Bearer <token>` header and `x-client-type` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/user/login/mobile/signin` | Sign in user |
| `POST` | `/api/v1/auth/user/login/mobile/signup` | Sign up new user |
| `POST` | `/api/v1/auth/user/login/mobile/verify-email` | Send verification email |

### Request Headers

| Header | Description | Required |
|--------|-------------|----------|
| `Authorization` | Bearer token for authentication | For protected routes |
| `x-server-jwt` | Server JWT secret for server routes | For server routes |
| `x-client-type` | Client type: `WEB`, `MOBILE`, `DESKTOP`, `API` | For all API routes |

## Project Structure

```
BetweenUsServerJs/
├── src/
│   ├── index.ts              # Application entry point
│   ├── lib/
│   │   └── pocketbase.ts     # PocketBase configuration and initialization
│   ├── middleware/
│   │   ├── client.middleware.ts  # Client authentication middleware
│   │   └── server.middleware.ts  # Server authentication middleware
│   ├── module/
│   │   ├── auth/             # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.router.ts
│   │   │   └── auth.service.ts
│   │   ├── health/           # Health check module
│   │   │   └── health.routes.ts
│   │   ├── server/           # Server token module
│   │   │   ├── server.controller.ts
│   │   │   ├── server.model.ts
│   │   │   ├── server.routes.ts
│   │   │   └── server.service.ts
│   │   └── user/             # User module
│   │       └── user.model.ts
│   └── utils/
│       ├── collectionName.ts # PocketBase collection names
│       ├── generateUuid.ts   # UUID generation utilities
│       ├── response.ts       # Response helpers
│       └── routePaths.ts     # API route definitions
├── dist/                     # Compiled JavaScript (generated)
├── Dockerfile               # Docker build configuration
├── docker-compose.yml       # Docker Compose configuration
├── supervisord.conf         # Process manager configuration
├── package.json
├── tsconfig.json
├── nodemon.json
├── .env.example
└── README.md
```

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run db:migrate` | Initialize PocketBase collections |
| `npm test` | Run tests (not yet configured) |

### Database Collections

The application automatically creates the following PocketBase collections on startup:

1. **ServerTokens** - Stores server authentication tokens
   - `token` (text): Unique token string
   - `generated_from` (select): SERVER, CLIENT, or ADMIN_PANEL
   - `expires_at` (date): Optional expiration timestamp

2. **Users** (auth collection) - User accounts with authentication
   - `uid` (text): Unique user identifier
   - `email` (text): User email address
   - `username` (text): Optional username
   - `fullName` (text): Optional full name
   - Built-in auth fields: password, verified, etc.

3. **UserDeviceDetails** - Stores device information
   - `deviceId` (text): Unique device identifier
   - `deviceName` (text): Device name
   - `uuid` (text): Associated user UUID
   - `lastLoginAt` (autodate): Last login timestamp

## Security Considerations

- **Change default credentials**: Always change `POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` in production
- **Use strong secrets**: Generate a strong `SERVER_JWT_SECRET`
- **HTTPS**: Use HTTPS in production (configure via reverse proxy like nginx or Traefik)
- **Environment variables**: Never commit `.env` files to version control

## Troubleshooting

### Common Issues

**PocketBase connection failed**:
- Ensure PocketBase is running and accessible at the configured `POCKETBASE_URL`
- Verify admin credentials are correct
- Check that the PocketBase admin account has been created

**Docker container not starting**:
- Check logs: `docker compose logs -f`
- Ensure ports 3000 and 8090 are not in use
- Verify environment variables are set correctly

**Authentication errors**:
- Ensure the server token is valid and not expired
- Check that required headers (`Authorization`, `x-client-type`) are included

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please open an issue on GitHub.
