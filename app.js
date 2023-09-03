import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import favicon from "serve-favicon";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(favicon(__dirname + '/public/clipboard.png'));

// mongoose.connect("mongodb://127.0.0.1:27017/TodolistDB");
mongoose.connect("mongodb+srv://admin-me:mongo123@cluster0.gfrxs5c.mongodb.net/todolistDB");

const date = new Date();
const currentDate = date.toLocaleDateString('default', { weekday: 'long' }) + " " + date.getDate() + " " + date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();

const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({name: "Welcome to todolist application"});
const item2 = new Item({name: "Add your tasks"});
const item3 = new Item({name: "Work efficiently"});
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema( { name: String, lists: [itemSchema]});
const list = mongoose.model("list", listSchema);


app.get("/", async function (req, res) {
  let foundItems = await Item.find({});
  if(foundItems.length === 0) {
    Item.insertMany(defaultItems);
  }
  res.render("index.ejs", { tasks: foundItems, date: currentDate , listTitle: "Today"});
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
 
  list.findOne({name: customListName})
    .then(foundList => {
      if(!foundList){

        const newlist = new list({
          name: customListName,
          items: defaultItems
        });
 
        newlist.save();
        res.redirect("/" + customListName);
      } 
      else {
        res.render("index.ejs", { tasks: foundList.items, date: currentDate, listTitle: customListName});
      }
    })
    .catch((err) => {
      console.log(err);
    });
});


// route for adding items to custom lists
app.post("/", async function (req, res) {
  const itemName = req.body["newTask"];
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  newItem.save();
  res.redirect("/");
  
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId).exec();
  res.redirect("/");
});

app.listen(port, ()=> {
    console.log(`Server started at port ${port}`);
});