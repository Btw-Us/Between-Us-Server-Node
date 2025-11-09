const mongoose = require('mongoose');

enum GeneratedFrom {
    SERVER = "SERVER",
    CLIENT = "CLIENT",
    ADMIN_PANEL = "ADMIN_PANEL"
}


const serverTokenSchema = new mongoose.Schema({
    GeneratedFrom: {
        type: String,
        enum: Object.values(GeneratedFrom),
        required: true,
        default: GeneratedFrom.SERVER
    },
    Token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    CreateByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        nullable: true
    },
    ExpriesAt: {
        type: Date,
        required: false,
        nullable: true
    }
});

const ServerTokenModel = mongoose.model('ServerTokken', serverTokenSchema);

export = {ServerTokenModel, GeneratedFrom};