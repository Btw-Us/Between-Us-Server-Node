require('./config/env')
require('./config/database');
import express = require('express');
const { BetweenUsRoutes, version, ServerApiRoutes } = require('./utils/routePaths');
import healthRoute = require('./module/health/health');
import serverRoutes = require('./module/server/server.routes');
import authRoutes = require('./module/auth/auth.routes');

const { checkAdminHeader, validateServerTokenGeneration } = require('./middleware/headers.middleware');
const app = express();
const PORT = process.env.PORT || 3000;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(BetweenUsRoutes.HealthCheck, checkAdminHeader, healthRoute);
app.use(ServerApiRoutes.Token.ServerToken, validateServerTokenGeneration, serverRoutes);
app.use(BetweenUsRoutes.Users.LogIn,checkAdminHeader, authRoutes);


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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});