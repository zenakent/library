var mongoose = require("mongoose");

var reserveSchema = mongoose.Schema({
    returnDate: Date,
    borrowDate: {type: Date, default: Date.now }, 
    reserved: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Reserve", reserveSchema);