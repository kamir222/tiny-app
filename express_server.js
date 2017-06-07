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
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  // add shortURL as key and longURL as value
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (longURL === undefined) {
    res.send(`non-existent url: ${shortURL}`);
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls/:id', (req, res) => {
  //console.log('/urls/:id', req.params.id); //checking which endpoint it hits first
  let urlId = req.params.id;
  let fullUrl = urlDatabase[urlId];
  let templateVars = { shortURL: urlId, longURL: fullUrl };
  res.render("urls_show", templateVars);
})

app.post('/urls/:id/delete', (req, res) => {
  // find url in database
  let urlId = req.params.id;
  let fullUrl = urlDatabase[urlId];
  let url = fullUrl;

  // if does not exist return a 404
   if (!url) {
     res.status(404).send('URL not found.');
     return;
   }
  // remove donut from database
  delete urlDatabase[urlId];

  // redirect to home
  res.redirect('/urls');
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
