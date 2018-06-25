var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");


var db = require("./models");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost/mongoHeadlines");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./controllers/apiRoutes.js")(app);
require("./controllers/htmlRoutes.js")(app);

  //CLIENT SIDE: on document ready, or when they click link to saved articles, send a post request with local storage data.
      //if it's going to render a page on document ready, I probably need a separate js file and only link that to the saved page.
      //then take articles and put them on page with jQuery? 
  // parse local storage string, for each item in saved object, find the article and put it in a handlebars object. Render saved.

  // app.post("articles/saved", function(req, res) {
  //   console.log(req)

  // })



app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });