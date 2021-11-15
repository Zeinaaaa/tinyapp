const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const {getUserByEmail} = require("./helpers.js")
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(
	cookieSession({
		name: "session",
		keys: ["I like security it's the best", "key2"],
	})
);
app.set("view engine", "ejs");


const generateRandomString = () => {
  return Math.random().toString(36).slice(7)};

const urlDatabase = {
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  },
  "b2xVn2": {
    longURL: "http://www.google.com",
    userID: "thg2349"
  },
  "jhfgkj": {
    longURL: "http://www.reddit.com",
    userID: "aJ48lW"
  },
};

function urlsForUser(id) {
  userDatabase = {};
  for (let user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      userDatabase[user] = urlDatabase[user];
    }
  }
  return userDatabase;
}


const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
const hash = (users) => {
  for (let user in users) {
    users[user].password = bcrypt.hashSync(users[user].password, 10);
  }
  return users;
}
hash(users);

  
app.post("/urls/register", (req, res) => {
  let userId = generateRandomString();
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send("you must provide your email address and password")
    ;
  } else if (getUserByEmail(req.body.email, users) ) {
    res.status(400).send("you are already registered");
  } else {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10) 
    }
    req.session.user_id = userId
    res.redirect("/urls");
  }
})


app.post("/logout", (req, res) => {
  delete req.session["user_id"];
  res.redirect("/urls");
});

//modified the successful post to redirect to /urls/:shortURL as requested
app.post("/urls", (req, res) => { 
  if (req.session.user_id) {
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = longURL;
    urlDatabase[shortURL].userID = req.session.user_id;
    //res.send("URL added. <a href= '/urls'> Go to main page </a>"); 
    res.redirect(`/urls/${shortURL}`)        
  } else {
    res.send("Error: please login first");
    res.redirect("/urls")
  };
});


app.get("/urls/register", (req, res) => {
  let templateVars = {};
  templateVars.user_id = users[req.session.user_id];
  res.render("register", templateVars);
  
})


app.post("/register", (req, res) => {
  res.redirect("/urls/register");
})

//while not logged in navigates to the login form. but if logged in navigate to /urls
app.get("/urls/login" , (req, res) => {
  let templateVars = {};
  if (!req.session.user_id) {
    templateVars.user_id = users[req.session.user_id];
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
}
})


app.post("/login", (req,res) => {
  res.redirect("/urls/login");
})


app.post("/urls/login", (req, res) => {
  let userId = getUserByEmail(req.body.email, users);
  if(getUserByEmail(req.body.email, users)) {
    if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
      res.status(403).send("Your Password is wrong. Please try again!");
    } else{
      req.session.user_id = userId;
      res.redirect("/urls")
    };
  } else {
    res.status(403).send("Your email address can't be found");
  }
})

//used if statement to give only the owner the ability to edit the urls
app.post("/urls/:shortURL", (req, res) => {
  let shorturl = req.params.shortURL; 
  if (req.session.user_id === urlDatabase[shorturl].userID) {
  urlDatabase[shorturl].longURL = req.body.newURL;
  res.redirect("/urls/");
  } else {
    let templateVars = {"user_id": req.session.user_id};
    res.render("notYours", templateVars);
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let shorturl = req.params.shortURL;  
  if (req.session.user_id === urlDatabase[shorturl].userID) {
  delete urlDatabase[shorturl];
  res.redirect(`/urls`);
  } else {
    let templateVars = {"user_id": req.session.user_id};
    res.render("notYours", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shorturl = req.params.shortURL;
  if(!urlDatabase[shorturl]) {
    const templateVars = {};
    templateVars["user_id"] = users[req.session.user_id];
    res.render("WrongURL",templateVars);
  } else {
    const longURL = urlDatabase[shorturl].longURL;
    res.redirect(longURL);
  }
});

//redirect to /urls if logged in or to /login if the user is not logged in
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/urls/login");
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = {urls: urlsForUser(req.session.user_id)};
  templateVars["user_id"] = users[req.session.user_id];
  res.render("urls_index", templateVars);
});

//if the user is not logged in he will be directed to the login page.
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  templateVars.user_id = users[req.session.user_id];
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else{
    res.redirect("/urls/login");
  }
});

//the edit button on the main page will now use this get.
app.get("/urls/:shortURL", (req, res) => {
  let shorturl = req.params.shortURL;
  if (!urlDatabase[shorturl]) {
    const templateVars = {};
    templateVars["user_id"] = users[req.session.user_id];

    res.render("WrongURL",templateVars);

  } else {
    if (!req.session.user_id) {
      const templateVars = {};
      templateVars["user_id"] = users[req.session.user_id];
      res.render("pleaseLogin", templateVars);

    }else if (req.session.user_id === urlDatabase[shorturl].userID) {

      const templateVars = {shorturl: shorturl, longURL: urlDatabase[shorturl].longURL}
      
        templateVars["user_id"] = users[req.session.user_id];
      res.render("urls_show", templateVars);
    } else {
    let templateVars = {"user_id": req.session.user_id};
    res.render("notYours", templateVars);
    }
  }
});


app.listen(PORT);