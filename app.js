const express = require("express");
const bodyParser = require("body-parser");
const { static } = require("express");
const mongoose = require("mongoose");
const lhash = require("lodash");

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://admin-karthik:mongo77@cluster0.gnfaa.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);
const item1 = new Item({
    name: "Buy Bungalow"
})

const item2 = new Item({
    name: "Buy a Car"
})

const item3 = new Item({
    name: "Buy a Yacht"
})

const defaultItems = [item1, item2, item3];





app.get("/", function (req, res) {

    Item.find(function (err, results) {
        if (results.length == 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully added items");
                }
            })
            res.redirect("/")

        }

        else {
            res.render("list", { listTitle: "Today", itemsList: results }); //passing from here to HTML

        }


    })




})

app.get("/:newPar", function (req, res) {
    const listName = lhash.capitalize(req.params.newPar);

    //findOne returns one item of every kind or one unique item

    List.findOne({ name: listName }, function (err, foundDocument) {
        if (!err) {
            if (!foundDocument) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + listName);
            } else {
                res.render("list", {
                    listTitle: foundDocument.name,
                    itemsList: foundDocument.items
                })
            }

        }

    })
})

app.get("/about", function (req, res) {
    res.render("about")
})

app.post("/", function (req, res) {

    const item = req.body.newItem;
    const listTitle = req.body.button;
    const newItem = new Item({
        name: item
    })
    if (listTitle == "Today") {

        newItem.save();
        res.redirect("/")

    } else {
        List.findOne({ name: listTitle }, function (err, foundList) {
            if (foundList) {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + listTitle);

            }

        })
    }


})

app.post("/delete", function (req, res) {
    const checkBoxId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName == "Today") {
        Item.findByIdAndRemove(checkBoxId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("deleted item successfully");
            }
            res.redirect("/");
        })

    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkBoxId } } },
            function (err, foundList) {
                if (!err) {
                    res.redirect("/" + listName);
                }
            })
    }



})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}


app.listen(3000, function () {
    console.log("Server started successfully")
})