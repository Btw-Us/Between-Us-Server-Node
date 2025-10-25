const mongoose = require('mongoose');


connectToServerDatabase()
async function connectToServerDatabase() {
    const serverDbUrl = process.env.SERVER_DATABSE_URL;
    if (!serverDbUrl) {
        throw new Error('SERVER_DATABSE_URL is not defined in environment variables');
    }
    try {
        await mongoose.connect(serverDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to the BetweenUs database successfully');
    } catch (error) {
        console.error('Error connecting to the BetweenUs database:', error);
        throw error;
    }
}


const betweenUsDatabaseConnection = mongoose.connection;

module.exports = { betweenUsDatabaseConnection };