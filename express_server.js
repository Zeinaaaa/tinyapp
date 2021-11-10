const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
const urlDatabase = {
  "9sm5xK": "http://www.google.com",
  "b2xVn2": "http://www.lighthouselabs.ca"
};
function generateRandomString() {
  return Math.random().toString(36).slice(7)};
app.post("/urls", (req, res) => {
  console.log(req.body);  
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  console.log(urlDatabase);
});
app.post("/urls/login", (req,res) => {
  //req.body.username;
  res.cookie("username", req.body.username);
  console.log(req.cookies.username);

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
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
   let shortURL = req.params.shortURL;
  const templateVars = {shorturl: shortURL, longURL: urlDatabase[shortURL]}
  if(req.cookies.username) {
    templateVars.username = req.cookies.username;}
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});