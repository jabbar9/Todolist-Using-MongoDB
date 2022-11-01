//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Create a connection from localhost and create a new database called as "todolistDB".
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlparser: true})

//Create a new Schema and specify "name" and the type of "data" which is String here
const itemsSchema = {
  name: String
};

//Creates a "Model" called Items For which a singular value is to be inserted as First parameter which is "Item" and the second parmeter is Schema
const Item = mongoose.model("Item", itemsSchema);

//Creates a new document which we will use for default values.
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<--- Hit this to delete an item"
})

//A default array for all items
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  
  //It finds all the values from "Items" collection and in this method first parameter is "{}" which return every value and the second parameter is callback function
  Item.find({}, function(err, foundItems) {
    
    if (foundItems.length === 0) {
      //Insert items into "Item" module where (1)first parameter is document array (2) function which deals with error if exists
      Item.insertMany(defaultItems, function(err) {
      if (err) {
        console.log(err)
      } else {
        console.log("Successfully saved default values to DB.")
      }
    });
    res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const  item = new Item({
    name: itemName
  });

  item.save();

  res.redirect("/");
});

//Creating a new post method to delete items as a post request when checked as input from "list.ejs"
app.post("/delete", function(req, res) {

  //Recieves "checkbox" using req.body.checkbox and stores it into checkedItemId.
  const checkedItemId = req.body.checkbox;

  //Once the id is recieved Find it by id and remove it from "Item" collection (1)Pass the Id (2)Callback function which is mandatory. And after it is checked redirect to the Home Page
  Item.findByIdAndRemove(checkedItemId, function(err) {
    if(!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/")
    }
  })
});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;
  
  List.findOne({name: customListName }, function(err, foundList) {
    if (!err) {
      if (!foundList){
        //Create a new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        
        list.save();
        res.redirect("/" +customListName);
      } else {
        //Show an Existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
