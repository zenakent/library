var mongoose = require("mongoose");

//====================================================
// Schema 
//====================================================

var bookSchema= new mongoose.Schema({
    name: String,
    image: String,
    summary: String,
    author: String,
    genre: String,
    publisher: String,
    available: Number,
    createdAt: { type: Date, default: Date.now },
    submitted: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" //model name
        },
        username: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
        ],
    reserves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserve" 
        },
        ],
    rating: {
        type: Number,
        default: 0
    }
        
        
//============================       
//OLD CODES
//============================
        // reserves: [
        // {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Reserve" 
        // },
        // ]
    // limit    
//     reserves: {
//         type: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Reserve" 
//         }],
//         validate: [arrayLimit, '{PATH} exceeds the limit of 5']
//     }
});


//

module.exports = mongoose.model("Book", bookSchema);