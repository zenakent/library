var Book = require("../models/book");
var Review = require("../models/reviews");
var User = require("../models/user");

//all the midleware goes here
var middlewareObj = {};


middlewareObj.checkBookOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id, function (err, foundBook) {
            if (err || !foundBook) {
                req.flash("error", "Sorry, that book does not exist!");
                res.redirect("/library");
            } else  if (foundBook.submitted.id.equals(req.user._id) || req.user.isAdmin) {  // 'foundBook.submitted.id === req.user._id' works as well
                req.book = foundBook;
                next();
                //does user own the book
                } else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
        });
    }
};

middlewareObj.checkProfileOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.params.id, function (err, foundUser) {
            if (err || !foundUser) {
                req.flash("error", "That user does not exit!");
            } else if (foundUser.id.equal(req.params.id) || req.user.isAdmin) {
                req.user = foundUser;
            } else {
                req.flash("error", "You do not have permission to do that");
                res.redirect("back");
            }
        });
    }
};
    


middlewareObj.checkReviewOwnership = function (req, res, next) {
    if (req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                req.flash('error', 'Sorry, that review does not exist!');
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin ) {
                    req.review = foundReview; //this line
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id).populate("reviews").exec(function (err, foundBook) {
            if (err || !foundBook) {
                req.flash("error", "Book not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundBook.reviews
                var foundUserReview = foundBook.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};


//middleware to see if logged in
middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "Please Login First!");
        res.redirect("/login");
    }
};

middlewareObj.isAdmin = function(req, res, next) {
    if (req.user.isAdmin) {
        return next();
    } else {
        req.flash("error", "You are not Admin!");
        res.redirect("/library");
    }
};

module.exports = middlewareObj;