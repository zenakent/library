var express = require("express");
var router = express.Router({mergeParams: true});
var Book = require("../models/book");
var Reserve = require("../models/reserve");
var middleware = require("../middleware/index.js");
var Notification = require("../models/notification");
var User = require("../models/user");



//====================================================
//RESERVE ROUTES
//====================================================

router.get("/new", function(req, res) {
    Book.findById(req.params.id, function(err, book) {
        if (err) {
            console.log(err);
        } else {
            res.render("reserve/new", {book: book});
        }
    });
});


//create reserve
router.post("/", middleware.isLoggedIn,  async function(req, res) {
    //lookup book using id
    // console.log("this is available " + req.body.available);
    var username = req.user.username;
    var userId = req.user._id;
    var available = req.body.available;
    var daysToAdd = 2;
    var id = '5b70bb0f58e4610cf8181b92';
    var reservedBy = {username: username, userId: userId, available: available};
// ===================================================================================
    try {
        let book = await Book.findById(req.params.id);
        let reserve = await Reserve.create(reservedBy);
        // let user = await User.findById(req.user._id).populate('followers').exec();
        let user = await User.findById(id).exec();
        
        reserve.returnDate = reserve.borrowDate.setDate(reserve.borrowDate.getDate() + daysToAdd);
        reserve.reserved.id = reservedBy.userId;
        reserve.reserved.username = reservedBy.username;
        reserve.save();
        
        book.reserves.push(reserve);
        if (book.available < 1) {
            req.flash("error", "There are no more available books");
            res.redirect("/library/" + book._id);
        } else {
            book.available--;
            await book.save();
            
            
            let newNotification = {
            username:req.user.username,
            bookId: book.id,
            bookName: book.name
            }
        
            let notification = await Notification.create(newNotification);
            user.notifications.push(notification);
            user.save();
            
            req.flash("success", "You have successfully borrowed this book. You may pick it up at the library in 2 days at 10:00am" );
            res.redirect("/library/" + book._id); 
        }
    } catch(err) {
      req.flash('error', 'Something went wrong!');
      res.redirect('back');
    }
// ===================================================================================
    // Book.findById(req.params.id, function(err, book) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         //create new reserve name
            
    //         Reserve.create(reservedBy, function(err, reserve) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 //add username and ID to reserve
    //                 console.log("this is borrow date = " + reserve.borrowDate);
    //                 // console.log("new reserves userID " + reservedBy.userId)
    //                 // console.log("new reserves username " + reservedBy.username)
    //                 // console.log("new reserves username " + reservedBy.available)
    //                 reserve.returnDate = reserve.borrowDate.setDate(reserve.borrowDate.getDate() + daysToAdd);
    //                 reserve.reserved.id = reservedBy.userId;
    //                 reserve.reserved.username = reservedBy.username;
    //                 // //save review
    //                 reserve.save();
    //                 //connect reserve user to book
    //                 //redirect to book show page
    //                 book.reserves.push(reserve);
    //                 if (book.available < 1) {
    //                     req.flash("error", "There are no more available books");
    //                     res.redirect("/library/" + book._id);
    //                 } else {
    //                     book.available--;
    //                     book.save();
    //                     res.redirect("/library/" + book._id);
    //                 }
    //             }
    //         });
    //     }
    // });
});

// //UPDATE ROUTE FOR RESERVATIONS also set limit here. i think it's here


//EDIT ROUTE FOR RESERVE BUT NOT REALLY 
//more like deleting reserve page so we could get the specific ID for the reserve
router.get("/:reserve_id/edit", function(req, res) {
    Book.findById(req.params.id, function(err, book) {
        if (err) {
            console.log(err);
        } else {
            //console.log(book.reserves._id);
           
            
        }
        
    });
    Reserve.findById(req.params.reserve_id, function(err, foundReserve, book) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("reserve/bookreturn", {book_id: req.params.id, reserve: foundReserve});
        }
    });
});


//reserve destroy route do you actually need this?
router.delete("/:reserve_id", function(req, res) {
    Book.findById(req.params.id, function(err, book) {
        if (err) {
            console.log(err);
        } else {
            book.available++;
            //console.log(book.reserves._id);
            book.save();
        }
        
    });
    
    Reserve.findByIdAndRemove(req.params.reserve_id, function(err, book) {
        
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/library/" + req.params.id);
        }
    });
});


module.exports = router;