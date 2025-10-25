require('./config/env')
import express = require('express');
const { RouterPaths, version } = require('./config/routePaths');
import healthRoute = require('./module/health/health');

const app = express();
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(RouterPaths.HealthCheck, healthRoute);

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