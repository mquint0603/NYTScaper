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
    request("http://www.nytimes.com/?WT.z_jog=1&hF=f&vS=undefined/", function(error, response, html){
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
  

      $(".theme-summary").each(function(i, element) {
        // Save an empty result object
        var result = {};

        result.title = $(this).children(".story-heading").text();

        result.body = $(this).children(".summary").text();

        result.link = $(".story-heading").children("a").attr("href");

          console.log(result)
        db.Article.findOne(result)
            .then(function(found) {
                if (!found && result.title && result.body && result.link) {
                    db.Article.create(result)
                      .then(function(dbArticle) {
                        console.log(dbArticle);
                      })
                    //   .catch(function(err) {
                    //     return res.json("error");
                    //   });
                }
        })
  
      });
  
      res.send("Scrape Complete");
    });
  });

  app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.Article.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });

  app.get("/", function(req, res) {
      res.render("index")
  })

  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
  });



app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });