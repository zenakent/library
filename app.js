var express = require("express");
var app = express();
var middleware = require("./middleware/index.js");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var Book = require("./models/book");
var User = require("./models/user");
var Review = require("./models/reviews"); // comment
var Reserve = require("./models/reserve.js");
var User = require("./models/user");

var methodOverride = require("method-override");


//requiring routes
var reviewRoutes = require("./routes/reviews");
var bookRoutes = require("./routes/books");
var indexRoutes = require("./routes/index");
var reserveRoutes = require("./routes/reserve");

//====================================================


// mongoose.connect("mongodb://localhost:27017/library", { useNewUrlParser: true }); //used to connect to localDB
// mongodb://maui:a12345@ds123783.mlab.com:23783/library //used to connect to onlineDB
mongoose.connect("mongodb://maui:a12345@ds123783.mlab.com:23783/library", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment')

//====================================================
// Passport Config
//====================================================
app.use(require("express-session")({
    secret: "HICCUP!!",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy()); use this to have email as username

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//====================================================
//
//====================================================
app.use(async function(req, res, next){
   res.locals.currentUser = req.user;
   if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      console.log(err.message);
    }
   }
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

app.use("/", indexRoutes);
app.use("/library/:id/reviews",reviewRoutes);
app.use("/library",bookRoutes);
app.use("/library/:id/reserve", reserveRoutes);



//====================================================
//Library Server Start
//====================================================

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Library server has started");
})