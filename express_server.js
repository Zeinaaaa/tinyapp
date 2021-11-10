const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
function generateRandomString() {
  return Math.random().toString(36).slice(7)};
const urlDatabase = {
  "9sm5xK": "http://www.google.com",
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
};
app.post("/urls/register", (req, res) => {
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", userId)
  console.log(users);
  res.redirect("/urls");
})
app.post("/urls/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  console.log(urlDatabase);
});
app.get("/urls/register", (req, res) => {
  res.render("register.ejs");
})
app.post("/urls/login", (req,res) => {
  //req.body.username;
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})
app.post("/urls/:shortURL", (req, res) => {
  //req.body
  let shorturl = req.params.shortURL; 
  urlDatabase[shorturl] = req.body.newURL;
  res.redirect("/urls/")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let shorturl = req.params.shortURL;  delete urlDatabase[shorturl];
  res.redirect(`/urls`);
})
app.post("/urls/:shortURL/edit", (req, res) => {
  let shorturl = req.params.shortURL;
  res.redirect(`/urls/${shorturl}`);

})
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  let shorturl = req.params.shortURL;
  const longURL = urlDatabase[shorturl];
  res.redirect(longURL);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,  };
  if(req.cookies.user_id) {
    templateVars["user_id"] = users[req.cookies.user_id];}
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  if(req.cookies.user_id) {
    templateVars.user_id = users[req.cookies.user_id];}
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
   let shortURL = req.params.shortURL;
  const templateVars = {shorturl: shortURL, longURL: urlDatabase[shortURL]}
  if(req.cookies.user_id) {
    templateVars["user_id"] = users[req.cookies.user_id];}
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});