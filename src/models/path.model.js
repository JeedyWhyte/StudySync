const mongoose = require("mongoose");
const pathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const Path = mongoose.model("Path", pathSchema);
module.exports = Path;