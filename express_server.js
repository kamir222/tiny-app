"use strict";
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT  = process.env.PORT || 8080; //if there is preconfigured port choose that, otherwise choose 8080

app.set('view engine', 'ejs') // tells express to use ejs as templating engine
app.use(bodyParser.urlencoded({extended: true})); // turning data into object (attaches form data to req.body)

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.end('Hello!');
})
app.get('/url.json', (req, res) => {
    res.json(urlDatabase);
})
app.get('/greetings', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
})
app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  console.log("/urls/new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.get('/urls/:id', (req, res) => {
  //console.log('/urls/:id', req.params.id); //checking which endpoint it hits first
  let urlId = req.params.id;
  let fullUrl = urlDatabase[urlId];
  let templateVars = { shortURL: urlId, longURL: fullUrl };
  res.render("urls_show", templateVars);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//  a function that produces a string of 6 random alphanumeric characters
function generateRandomString() {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++ )
      randomString += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomString;
}
