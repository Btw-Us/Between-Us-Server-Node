import express from 'express';
import 'dotenv/config';
import { ServerApiRoutes, version } from './utils/routePaths.js';
import { serverMiddleware } from "./middleware/server.middleware.js";
import ServerRoutes from './module/server/server.routes.js';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ServerApiRoutes.Token.GenerateServerToken, serverMiddleware, ServerRoutes)

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
    
    Built with ❤️ using Express,MongoDB
    </pre>
        `);
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
