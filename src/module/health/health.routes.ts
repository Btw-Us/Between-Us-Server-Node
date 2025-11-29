import express from 'express';

const HealthRoutes = express.Router();

HealthRoutes.get('/', (req, res) => {
    res.status(200).json({
        status: 'You are autherized to access this resource.',
        timestamp: new Date().toISOString()
    });
});

export default HealthRoutes;
