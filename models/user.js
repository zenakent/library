var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
   
    firstName: String,
    lastName: String,
    email: String,
    aboutme: String,
    reserve: [
        {
           type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Reserve'
        }
        ],
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ],
    isAdmin: {
        type: Boolean,
        default: false
    }
});

UserSchema.plugin(passportLocalMongoose);
// UserSchema.plugin(passportLocalMongoose, { usernameField : 'email' }); //use to have email as username

module.exports = mongoose.model("User", UserSchema);