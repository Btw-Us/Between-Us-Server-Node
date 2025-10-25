const mongoose = require('mongoose');


connectToServerDatabase()
async function connectToServerDatabase() {
    const serverDbUrl = process.env.SERVER_DATABASE_URL;
    if (!serverDbUrl) {
        throw new Error('SERVER_DATABSE_URL is not defined in environment variables');
    }
    try {
        await mongoose.connect(serverDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('Error connecting to the server database:', error);
        throw error;
    }
}

const serverDatabaseConnection = mongoose.connection;

module.exports = { serverDatabaseConnection };
