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

  //CLIENT SIDE: on document ready, or when they click link to saved articles, send a post request with local storage data.
      //if it's going to render a page on document ready, I probably need a separate js file and only link that to the saved page.
      //then take articles and put them on page with jQuery? 
  // parse local storage string, for each item in saved object, find the article and put it in a handlebars object. Render saved.

  // app.post("articles/saved", function(req, res) {
  //   console.log(req)

  // })


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
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: newNote._id} }, { new: true });
    })
    .then(function(dbArticle) {
      console.log("created")
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/articles/notes/:id", function(req,res) {
  db.Note.deleteOne({_id: req.params.id}).then(function(data){
    res.json(data)
  })
})

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });