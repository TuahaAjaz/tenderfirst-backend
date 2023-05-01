const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RolesSchema = Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    send: {
        type: Boolean,
        require: true
    },
    receive: {
        type: Boolean,
        require: true
    },
    issue: {
        type: Boolean,
        require: true
    },
    create: {
        type: Boolean,
        require: true
    },
    mine: {
        type: Boolean,
        require: true,
        default: false
    },
    admin: {
        type: Boolean,
        require: true
    },
}, {timestamps: true});

module.exports = mongoose.model("roles", RolesSchema);