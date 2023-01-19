const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const fileupload = require("express-fileupload");
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb+srv://saima:saima786@cluster0.fanjbvi.mongodb.net/test")
  .then(() => {
    console.log("DataBase Connected");
  })
  .catch((err) => {
    console.log("Oh!! Database did not connect");
    console.log(err);
  });

const gameSchema = mongoose.Schema({
  title: String,
  creator: String,
  width: Number,
  height: Number,
  filename: String,
  thumbnailfile: String,
});

const Game = mongoose.model("Game", gameSchema);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(fileupload());
app.set("views", path.join(__dirname, "views"));

app.get("/", function (req, res) {
  res.render("homepage");
});

app.get("/game/:id", function (req, res) {
  const id = req.params.id;

  Game.findById(id, function (error, foundGame) {
    if (error) {
      console.log("Can't find game with that id");
    } else {
      res.render("edit", {
        title: foundGame.title,
        creator: foundGame.creator,
        width: foundGame.width,
        height: foundGame.height,
        id: id,
      });
    }
  });
});
app.get("/game/:id/edit", function (req, res) {
  const id = req.params.id;

  Game.findById(id, function (error, foundGame) {
    if (error) {
      console.log("Oh!! id not found ");
      console.log(error);
    } else {
      res.render("edit", {
        title: foundGame.title,
        creator: foundGame.creator,
        width: foundGame.width,
        height: foundGame.height,
        id:id
      });
    }
  });
});

app.post("/game/:id/update", function (req, res) {
  const id = req.params.id;

  Game.findByIdAndUpdate(
    id,
    {
      title: req.body.title,
      creator: req.body.creator,
      width: req.body.width,
      height: req.body.height,
    },
    function (err, updatedGame) {
      if (err) {
        console.log("couldn't update game");
        console.log(err);
      } else {
        res.redirect("/list");
        console.log("updated game:" + updatedGame);
      }
    }
  );
});
app.get("/game/:id/delete", function (req, res) {
  const id = req.params.id;
  Game.findByIdAndDelete(id, function (err) {
    if (err) {
      console.log("error in deleting game");
      console.log("err");
    } else {
      // console.log("deleted game from database:" + id);
      res.redirect("/list");
    }
  });
});

app.get("/list", function (req, res) {
  //Game List
  Game.find({}, function (error, game) {
    if (error) {
      console.log(
        "There was  aproblem retireving all of the games from the database"
      );
      console.log(error);
    } else {
      res.render("list", {
        gameslist: game,
      });
    }
  });
});

app.get("/addgame", function (req, res) {
  res.render("addgame");
});
app.post("/addgame", function (req, res) {
  const data = req.body;
  const gamefile = req.files.gamefile;
  const imagefile = req.files.imagefile;

  gamefile.mv("public/games/" + gamefile.name, function (error) {
    if (error) {
      console.log("couldn't upload the game file");
      console.log("error");
    } else {
      console.log("Game file sucessfully uploaded.");
    }
  });
  imagefile.mv("public/games/thumbnails/" + imagefile.name, function (error) {
    if (error) {
      console.log("couldn't upload the image file");
      console.log("error");
    } else {
      console.log("image file sucessfully uploaded.");
    }
  });

  Game.create(
    {
      title: data.title,
      creator: data.creator,
      width: data.width,
      height: data.height,
      filename: gamefile.name,
      thumbnailfile: imagefile.name,
    },
    function (error, data) {
      if (error) {
        console.log("there was a problem adding this game in database");
      } else {
        console.log("game added to database");
        console.log(data);
      }
    }
  );
  res.redirect("list");
});

app.listen("3000", function () {
  console.log("Listening on port no 3000.");
});
