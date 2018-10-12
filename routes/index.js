var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Book = require("../models/book");
var Notification = require("../models/notification");
var middleware = require("../middleware/index.js");


//====================================================
// INDEX and Auth Routes
//====================================================
//Landing Page
router.get("/", function(req, res) {
    res.render("landing");
});



//show register form
router.get("/register", function(req, res) {
    res.render("register");
});

//handle Sign up logic
router.post("/register", function(req, res) {
    var newUser = new User(
        {
            username: req.body.username, 
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar,
            email: req.body.email,
            });
    // eval(require('locus'));
    if (req.body.adminCode === "secret1234") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.render("register");
        }
        //log user in after successful registration
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to Library " + user.username);
            
            res.redirect("/follow/:id");
            
        });
    });
});


//show login form
router.get("/login", function(req, res) {
    res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/library",
        failureRedirect: "/login"
    }), function(req, res) {
        req.flash("success", "Welcome to Library " + req.params._id);
});


//handle logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/library");
});

//User profile
router.get("/users/:id", function(req, res) {

  User.findById(req.params.id).populate('followers').exec(function (err, foundUser) {
      if (err) {
          req.flash("error", "Something went wrong!");
          res.redirect("/");
      }
      Book.find().where('submitted.id').equals(foundUser._id).exec(function (err, books) {
          if (err) {
              req.flash("error", "Something went wrong!");
              res.redirect("/");
          } else {
              res.render("users/show", {user: foundUser, books: books});
          }
      });
  });

});

// router.get('/users/:id', async function(req, res) {
//   try {
//     let user = await User.findById(req.params.id).populate('followers').exec();
//     res.render('users/show', { user });
//   } catch(err) {
//     req.flash('error', err.message);
//     return res.redirect('back');
//   }
// });

//handle notification route 

// follow user actually dont need this
router.get('/follow/:id', async function(req, res) {
  var id = '5b70bb0f58e4610cf8181b92';
  
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(id);
    user.save();
    req.flash("success", "Welcome to Library " + user.username);
    // req.flash('success', 'Successfully followed ' + user.username + '!');
    // res.redirect('/users/' + req.params.id);
    res.redirect("/library");
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications',  async function(req, res) {
  try {
    
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/library/${notification.bookId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});


module.exports = router;