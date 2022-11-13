//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Create a connection from localhost and create a new database called as "todolistDB".
mongoose.connect("mongodb+srv://Abdul:jabbar1234567890@cluster0.rnzl6gg.mongodb.net/todolistDB", {useNewUrlparser: true})

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

const List = mongoose.model("List", listSchema);  

app.get("/", function(req, res) {
  
  //It finds all the values from "Items" collection and in this method first parameter is "{}" which return every value and the second parameter is callback function
  Item.find({}, function(err, foundItems) {
    
    if (foundItems.length === 0) {
      //Insert items into "Item" module where (1)first parameter is document of array(2) function which deals with error if exists
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
  const listName = req.body.list;

  const  item = new Item({
    name: itemName
  });

  //listName stores submitted button. If it is not "Today" then findOne and push the new item into "items" array
  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

//Creating a new post method to delete items as a post request when checked as input from "list.ejs"
app.post("/delete", function(req, res) {

  //Recieves "checkbox" using req.body.checkbox and stores it into checkedItemId.
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
  //Once the id is recieved Find it by id and remove it from "Item" collection (1)Pass the Id (2)Callback function which is mandatory. And after it is checked redirect to the Home Page
  Item.findByIdAndRemove(checkedItemId, function(err) {
    if(!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/")
    }
  });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" +listName);
      }
    })
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  
  //findOne method returns an object. Coz it only returns a single document or object so we cant used arrays properties  
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

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server has Started Successfully");
});
