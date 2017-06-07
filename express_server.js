"use strict";
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT  = process.env.PORT || 8080; //if there is preconfigured port choose that, otherwise choose 8080

app.set('view engine', 'ejs') // tells express to use ejs as templating engine
app.use(bodyParser.urlencoded({extended: true})); // turning data into object (attaches form data to req.body)
app.use(cookieParser())

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//  a function that produces a string of 6 random alphanumeric characters
function generateRandomString () {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i < 6; i++)
      randomString += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomString;
}

app.get('/', (req, res) => {
  res.end('Hello!');
})
app.get('/url.json', (req, res) => {
    res.json(urlDatabase);
})

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
})

app.get('/urls/register', (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_form", templateVars);
})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  // add shortURL as key and longURL as value
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', function (req, res) {
  //set cookie
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
})

app.post('/logout', function (req, res) {
  //clear username
  res.clearCookie('username');
  res.redirect(`/urls`);
})

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
  let urlId = req.params.id;
  let fullUrl = urlDatabase[urlId];
  let templateVars = {
      shortURL: urlId,
      longURL: fullUrl,
      username: req.cookies["username"],
    };
  res.render("urls_show", templateVars);
})

app.post('/urls/:id', (req, res) => {
  // find url in database
  let urlId = req.params.id;
  let fullUrl = urlDatabase[urlId];
  let url = fullUrl;

  // if does not exist return a 404
   if (!url) {
     res.status(404).send('URL not found.');
     return;
   }

  // update name on url
  let newUrl = req.body.url;

  if (fullUrl !== newUrl) {
    urlDatabase[urlId] = newUrl;
  }
  res.redirect(`/urls/${urlId}`);
})

app.post('/urls/:id/delete', (req, res) => {
  // find url in database
  let urlId = req.params.id;
  let fullUrl = urlDatabase[urlId];
  let url = fullUrl;

  // if url doesn'texist return a 404
   if (!url) {
     res.status(404).send('URL not found.');
     return;
   }

  // remove url from database
  delete urlDatabase[urlId];

  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
