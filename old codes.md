RESERVE BUTTON


<!--<a href="/library/<%= book._id %>/reserve" class="btn btn-info">Reserve this Book</a>  <!-- make this button work. it's a put route i think -->
                    
                    <form action="/library/<%= book._id %>?_method=PUT" method="POST">
                        <div class="form-group">
                            <input class="form-control" type="text" name="reserve" placeholder="type your name here to reserve it">
                        </div>
                        <div class="form-group">
                        <button class="btn btn-info btn-lg ">Reserve</button><!-- make this button work. it's a post route i think -->
                        </div>  
                    </form>
                    
                    //RESERVE BOOKS this is what we're doing now
router.put("/:id", middleware.isLoggedIn,function(req, res) {
    var reserve = { id: req.user._id, username: req.user.username};
    var borrowed_by = {reserve : reserve};
            
    Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, updatedBook) {
        if (err) {
            res.redirect("back");
        } else {
           res.redirect("/library/" + req.params.id);
        }
    });
});

<% book.reserves.forEach( function(reserve) { %>
                    <p class="text-center">Reserved By: <%= reserve.reserved.id%></p>
                    <% }) %>
                    
                    
                    
BOOK SCHEMA

 reserves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserve" 
        },
        ]
        
        
        
 <li class="dropdown">
                          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Notifications <span class="badge"><%= notifications.length %></span></a>
                          <ul class="dropdown-menu">
                            <li>
                                <a href="/notifications">View past notifications</a>
                            </li>
                            <% notifications.forEach(function(notification) { %>                          
                                <li>
                                    <a href="/notifications/<%= notification.id %>">
                                        <%= notification.username %> created a new book
                                    </a>
                                </li>
                            <% }); %>
                          </ul>
                        </li>