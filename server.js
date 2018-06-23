var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

var PORT = 8080;

// Initialize Express
var app = express();

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/mongoHeadlines");

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.get("/scrape", function(req, res) {
    request("http://www.mprnews.org", function(error, response, html){
      var $ = cheerio.load(html);
  
      $(".described").each(function(i, element) {
        var result = {};
        result.title = $(this).children("a").children("h2").text();
        result.link = $(this).children("a").attr("href");
        result.body = $(this).children("a").children(".details").text();
          console.log(result.title)
        db.Article.findOne({title: result.title})
            .then(function(found) {
                if (!found && result.title && result.body && result.link) {
                    db.Article.create(result)
                      .then(function(dbArticle) {
                        // console.log(dbArticle);
                      })
                      .catch(function(err) {
                        return res.json("error");
                      });
                }
        })
      });
      res.send("Scrape Complete");
      
    });
  });

  app.get("/api/all", function(req, res) {
    db.Article.find({}, function(error, found) {
      if (error) {
        console.log(error);
      }
      else {
        res.json(found);
      }
    });
  });


  app.get("/", function(req, res) {

    db.Article.find().sort({ _id: -1 }).exec(function(err, data) {
      if (err) {
        console.log(err);
      }
      else {
        const hbsData = {
          articles: data
        }
        res.render("index", hbsData);
      }
    });
  });

  app.get("/saved", function (req, res) {
    db.Article.find({saved: true}, function(error, data) {
      
      if (error) {
        console.log(error);
      }
      else {
        const hbsData = {
          articles: data
        }
        res.render("saved", hbsData);
      }
    })
  })

  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });

  app.post("/save/:id", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: true}})
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
  });

  app.post("/unsave/:id", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: false}})
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
  });


  // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(newNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: newNote._id} }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/articles/notes/:id", function(req,res) {
  db.Note.deleteOne({_id: req.params.id}).then(function(data){
    console.log(data)
  })
})

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });