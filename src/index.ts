import express from 'express';
import 'dotenv/config';
import { BetweenUsRoutes, ServerApiRoutes, version } from './utils/routePaths.js';
import { serverMiddleware } from "./middleware/server.middleware.js";
import { clientMiddlewareAllHeaders, clientMiddlewareBasic } from "./middleware/client.middleware.js";
import { authTokenMiddleware } from "./middleware/authtoken.middleware.js";
import ServerRoutes from './module/server/server.routes.js';
import HealthRoutes from './module/health/health.routes.js';
import AuthRoutes from './module/auth/auth.router.js';
import UserRoutes from './module/user/user.routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ServerApiRoutes.Token.GenerateServerToken, serverMiddleware, ServerRoutes)
app.use(BetweenUsRoutes.HealthCheck, clientMiddlewareBasic, HealthRoutes);
app.use(BetweenUsRoutes.Users.LogIn, clientMiddlewareAllHeaders, AuthRoutes);
app.use(BetweenUsRoutes.Users.User, authTokenMiddleware, UserRoutes);

app.get('/', (req, res) => {
    res.send(`
          <pre>🚀 BetweenUsServer Chat API ${version}
    
    Welcome to the BetweenUsServer Chat Application!
    
    📱 Features:
    • Real-time messaging
    • User authentication & management
    • Friend relationships
    • File sharing & media support
    • WebSocket connections for live chat
    
    📚 API Documentation:
    • REST API: /api/v1/*
    • WebSocket: /ws/v1/*
    
    🔧 Status: Server is running and ready to connect!
    
    Built with ❤️ using Express,PocketBase,TypeScript.
    </pre>
        `);
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
