//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list!"
});
const item2 = new Item({
  name: "To add a new item, fill in the blank and hit +"
});
const item3 = new Item({
  name: "<-- hit this to overline an item"
});
const defaultItems=  [item1, item2, item3];
app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems){
      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
           if(err){
             console.log(err);
           }
         });
      }
      else{
          res.render("list", {listTitle: "Today ", newListItems: foundItems});
        }
      });
    });

app.post("/", function(req, res){
      const item = req.body.newItem;
        Item.insertMany([new Item({
          name: item
        })]);
        res.redirect("/");
});

app.post("/delete", function(req, res){
  const idToRemove = req.body.checkbox;
  Item.findByIdAndRemove(idToRemove, function(err){
    if(err){
      console.log(err);
    }
    else{
  res.redirect("/");
    }
  })

})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
