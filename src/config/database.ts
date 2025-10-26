const mongoose = require('mongoose');


connectToServerDatabase()
async function connectToServerDatabase() {
    const serverDbUrl = process.env.DATABASE_URL;
    if (!serverDbUrl) {
        throw new Error('SERVER_DATABASE_URL is not defined in environment variables');
    }
    try {
        await mongoose.createConnection(serverDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('Error connecting to the BetweenUs database:', error);
        throw error;
    }
}


const betweenUsDatabaseConnection = mongoose.connection;

module.exports = { betweenUsDatabaseConnection };