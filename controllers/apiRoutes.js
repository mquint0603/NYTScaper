var db = require("../models");

module.exports = function(app) {

app.get("/articles/scrape", function(req, res) {
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

  app.get("/articles/all", function(req, res) {
    db.Article.find({}, function(error, found) {
      if (error) {
        console.log(error);
      }
      else {
        res.json(found);
      }
    });
  });

  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
  });

  app.post("/articles/save/:id", function(req, res) {
    db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: true}})
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
  });

  app.post("/articles/unsave/:id", function(req, res) {
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
}