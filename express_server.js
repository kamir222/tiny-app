"use strict";
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const app = express();
const PORT  = process.env.PORT || 8080; //if there is preconfigured port choose that, otherwise choose 8080

app.set('view engine', 'ejs') // tells express to use ejs as templating engine
app.use(bodyParser.urlencoded({extended: true})); // turning data into object (attaches form data to req.body)
app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['keyvatios']
}))

let urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  "user2RandomID": {
    "bqxVn2": "https://www.reddit.com",
    "9am5xK": "https://www.nytimes.com"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "purple-monkey-dinosaur",
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk",
  }
}

//  a function that produces a string of 6 random alphanumeric characters
function generateRandomString () {
  let randomString = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i = 0; i < 6; i++)
      randomString += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomString;
}

function urlsWithoutUserID () {
  let urls = {};
  for (let userID in urlDatabase) {
    for(let shortURL in urlDatabase[userID]) {
      urls[shortURL] = urlDatabase[userID][shortURL]
    }
  }
  return urls;
}

app.get('/', (req, res) => {
  res.end('Hello!');
})

app.get('/url.json', (req, res) => {
    res.json(urlDatabase);
})

//INDEX PAGE
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user : users[req.session.userID]
  };

  res.render("urls_index", templateVars);
})

//SHORT URL GENERATOR
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  if(!urlDatabase[req.session.userID]) {
    urlDatabase[req.session.userID] = {}
  }
  urlDatabase[req.session.userID][shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//REGISTER FORM
app.get('/urls/register', (req, res) => {
  let templateVars = {
    user : users[req.session.userID]
  };
  res.render("urls_form", templateVars);
})

app.post('/urls/register', (req, res) => {
  // generate a random user ID
  let userID = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (!userEmail || !userPassword) {
    res.status(400).send('email or password is missing');
    res.redirect(`/urls/register`);
    return;
  }

  for (let user in users) {
    if (userEmail === users[user].email) {
      res.status(400).send('Email exists');
      return;
    }
  }

  //add a new user object in the global users object:
  users[userID] = {id: userID, email: userEmail, hashedPassword: hashedPassword}

  //Set the cookie and redirect.
  req.session.userID = userID;
  res.redirect(`/urls`);
})

//NEW URL MAKER
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.userID]
  };
  res.render("urls_new", templateVars);
});


//LOGIN PAGE
app.get('/login', (req, res) => {
  let templateVars = {
    user : users[req.session.userID]
  };
  res.render("urls_login", templateVars);
})

app.post('/login', function (req, res) {
  //find a user that matches the email submitted via the login form
  let correctPassword = false;
  for (let user in users ) {
    if ((req.body.email === users[user].email) &&
      bcrypt.compareSync(req.body.password, users[user].hashedPassword)) {
            //send cookie
          req.session.userID = user;
          correctPassword = true;
    }
  }
  if (correctPassword) {
      res.redirect(`/urls`);
  } else {
    res.status(403).send('email or password incorrect');
  }
})

//LOGOUT
app.get('/logout', function (req, res) {
  req.session = null;
  res.redirect(`/urls`);
})

app.post('/logout', function (req, res) {
  //clear username
  req.session = null;
  res.redirect(`/urls`);
})

//SHORT URL PAGE
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.session.userID][shortURL];
  if (longURL === undefined) {
    res.send(`non-existent url: ${shortURL}`);
  } else {
    if (/^http:\/\//.test(longURL)) {
        res.redirect(longURL);
    } else {
      res.redirect('http://'+longURL);
    }
  }
});

app.get('/urls/:id', (req, res) => {
  let urlId = req.params.id;
  let fullUrl = urlsWithoutUserID()[urlId];
  let templateVars = {
      shortURL: urlId,
      longURL: fullUrl,
      user : users[req.session.userID],
      showEditControls: urlDatabase[req.session.userID] && urlDatabase[req.session.userID][urlId]
    };
  res.render("urls_show", templateVars);
})

app.post('/urls/:id', (req, res) => {
  // find url in database
  let urlId = req.params.id;
  let fullUrl = urlDatabase[req.session.userID][urlId];
  let url = fullUrl;

  // if does not exist return a 404
   if (!url) {
     res.status(404).send('URL not found.');
     return;
   }

  // update url
  let newUrl = req.body.url;

  if (fullUrl !== newUrl && newUrl !== '') {
    urlDatabase[req.session.userID][urlId] = newUrl;
  }
  res.redirect(`/urls/${urlId}`);
})

app.post('/urls/:id/delete', (req, res) => {
  // find url in database
  let urlId = req.params.id;
  let fullUrl = urlDatabase[req.session.userID][urlId];
  let url = fullUrl;

  // if url doesn'texist return a 404
   if (!url) {
     res.status(404).send('URL not found.');
     return;
   }

  // remove url from database
  delete urlDatabase[req.session.userID][urlId];

  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
