const express = require('express');
const app = express();
const PORT  = process.env.PORT || 8080; //if there is preconfigured port choose that, otherwise choose 8080

app.set('view engine', 'ejs') // tells express to use ejs as templating engine

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get('/', (req, res) => {
  res.end('Hello!');
})
app.get('/Hello', function(req, res){
  res.end('hello word!');
})
app.get('/url.json', (req, res) => {
    res.json(urlDatabase);
})
app.get('/greetings', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
