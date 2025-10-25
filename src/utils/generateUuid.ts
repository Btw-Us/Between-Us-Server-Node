const { v4: uuidv4 } = require('uuid');

function generateUuid() {
    return uuidv4();
}
module.exports = { generateUuid };