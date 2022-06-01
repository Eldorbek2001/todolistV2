//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://<username>:<password>@cluster0.mjlk1.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list!"
});
const item2 = new Item({
  name: "To add a new item, fill in the blank and hit +"
});
const item3 = new Item({
  name: "<-- hit this to delete an item"
});
const defaultItems = [item1, item2, item3];
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        }
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customName = _.capitalize(req.params.customListName) ;
  List.findOne({
    name: customName
  }, function(err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const newList = new List({
          name: customName,
          items: defaultItems
        })
        newList.save();
        res.render("list", {listTitle: customName, newListItems: newList.items});
      } else {
        res.render("list", { listTitle: customName, newListItems: foundlist.items})
      }
    } else {
      console.log(err);
    }
  })
})



app.post("/", function(req, res) {

  const listname = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({name: itemName});
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listname}, function(err, foundlist) {
      if (!err) {
        if (foundlist) {
          foundlist.items.push(item);
          foundlist.save();
          };
          res.redirect("/" + listname);
        }
      }
    );
  }
});

app.post("/delete", function(req, res) {
  const idToRemove = req.body.checkbox;
  const listName = req.body.listName;
if (listName === "Today"){
    Item.findByIdAndRemove(idToRemove, function(err) {
    if (err) {console.log(err);}
     else { res.redirect("/"); }
  })
}else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: idToRemove}}}, function(err, foundlist) {
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/"+listName);
    }
  })
}
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
