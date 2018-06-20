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
    // First, we grab the body of the html with request
    request("http://www.mprnews.org", function(error, response, html){
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
  
      $(".described").each(function(i, element) {
        // Save an empty result object
        var result = {};
        result.title = $(this).children("a").children("h2").text();
        result.link = $(this).children("a").attr("href");
        result.body = $(this).children("a").children(".details").text();
          // console.log(result)
        db.Article.findOne(result)
            .then(function(found) {
                if (!found && result.title && result.body && result.link) {
                    db.Article.create(result)
                      .then(function(dbArticle) {
                        console.log(dbArticle);
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
    db.Article.find({saved: false}, function(error, data) {
      if (error) {
        console.log(error);
      }
      else {
        const hbsData = {
          articles: data
        }
        res.render("index", hbsData);
      }
    });
  })

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
    db.Article.findOne({_id: req.params.id})
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
  });

  app.post("/save/:id", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: true}})
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
  });



app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });