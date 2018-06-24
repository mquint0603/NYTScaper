var db = require("../models");

module.exports = function(app){

app.get("/", function(req, res) {
    db.Article.find({saved: false}).sort({ _id: -1 }).exec(function(err, data) {
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
}

