var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var User = require("../models/user");
var Notification = require("../models/notification");
var Reserve = require("../models/reserve");
var Review = require("../models/reviews")
var middleware = require("../middleware/index.js");

//books index route
router.get("/", function(req, res) {
    //page pagination
    var perPage = 4;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    // fuzzy search starts 
    if (req.query.search) {
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //get all books from DB
        //{res.render("file name", {name: data});
        //console.log(Book);
        Book.find().or([{name: regex}, {author:regex}, {genre:regex}, {publisher:regex}]).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allBooks) {
            Book.countDocuments({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                } else {
                    if (allBooks.length < 1) {
                        req.flash('error', 'Sorry, no book match your query. Please try again');
                        return res.redirect("back")
                    }
                    
                    res.render("books/index", {
                            library: allBooks, 
                            currentUser: req.user,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search
                    });
                }
            });
        });
    } else {
        Book.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allBooks) {
            if (err) {
                console.log(err);
            } else {
                    Book.countDocuments().exec(function (err, count) {
                      if (err) {
                        console.log(err);
                    } else {
                       res.render("books/index", {
                           library: allBooks, 
                           currentUser: req.user,
                           current: pageNumber,
                           pages: Math.ceil(count / perPage),
                           noMatch: noMatch,
                           search: false
                       });
                    }
                });  
            }
        });
    }
});



// CREATE ROUTE - add new books to DB
router.post("/", middleware.isLoggedIn, async function(req, res) {
    //get data from form and add to array
    // req.body."form name in new.ejs"
    var name = req.body.name;
    var image = req.body.image;
    var author = req.body.author;
    var summary = req.body.summary;
    var genre = req.body.genre;
    var publisher = req.body.publisher;
    var available = req.body.available;
    var submitted = {
        id: req.user._id,
        username: req.user.username
    };
    var newBook = {name: name, image: image, author: author, summary: summary, genre: genre, publisher: publisher, submitted: submitted, available: available};
    //create a new book and save to DB
    // Book.create(newBook, function(err, newlyCreated) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         //redirect to library page
    //         //console.log(req.body);
    //         res.redirect("/library");
    //     }
    // });
    try {
      let book = await Book.create(newBook);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        bookId: book.id,
        bookName: book.name
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to books page
      res.redirect(`/library/${book.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});

// NEW - show form to create new book
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    //todo - setup middleware for admin
    res.render("books/new");
});


//SHOW  - shows more info on books
router.get("/:id", function(req, res) {
    //find the book with provided ID
    Book.findById(req.params.id).populate("reviews reserves").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundBook) {
        if (err || !foundBook) {
            console.log(err);
            req.flash("error", "Sorry, That book does not exist!");
            return res.redirect("/library");
        } else {
            //console.log(foundBook);
            //render show template with that book
            res.render("books/show", {book: foundBook});
        }
    });  
   
});


//log who borrowed the books but we don't do logs sorry
router.get("/:id/reservedby", function(req, res) {
    
    Book.findById(req.params.id).populate("reserves").exec(function(err, book) {
        if (err) {
            console.log(err);
        } else {
            
            res.render("books/reservedby", {book: book});
        }
    });
});

router.get("/:id/bookreturn", function(req, res) {
    Book.findById(req.params.id, function(err, book) {
        if (err) {
            console.log(err);
        } else {
            res.render("reserve/bookreturn", {book: book});
        }
    });
});




//EDIT BOOKS
router.get("/:id/edit", middleware.checkBookOwnership, middleware.isAdmin, function(req, res) {
    Book.findById(req.params.id, function(err, foundBook) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("books/edit", {book: foundBook});
        }
    });
});

//UPDATE BOOKS
router.put("/:id", middleware.checkBookOwnership, middleware.isAdmin, function(req, res) {
    Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, updatedBook) {
        if (err) {
            res.redirect("/library");
        } else {
            res.redirect("/library/" + req.params.id);
        }
    });
});




router.delete("/:id", middleware.checkBookOwnership, function (req, res) {
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            res.redirect("/library");
        } else {
            Review.remove({"_id": {$in: book.reviews}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/library");
                }
                //  delete the book
                book.remove();
                req.flash("success", "Book deleted successfully!");
                res.redirect("/library");
            });
        }
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;