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
const matchEmail = (email) => {
  for (let user in users) {
    if(users[user].email===email) {
      return users[user].id;
    }
  }
  return null;
}

  
app.post("/urls/register", (req, res) => {
  let userId = generateRandomString();
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send("you must provide your email address and password")
    ;
  } else if (matchEmail(req.body.email) ) {
    res.status(400).send("you are already registered");
    console.log("the req email: ",req.body.email)
  } else {
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", userId)
  console.log(users);
  res.redirect("/urls");
  }
})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  console.log(req.body); 
  if (req.cookies.user_id) {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = req.cookies.user_id;
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  console.log("urlDatabase: ", urlDatabase);
  } else {
    res.send("Error: please login first");
    res.redirect("/urls")
  };
});
app.get("/urls/register", (req, res) => {
  console.log("getting register");
  let templateVars = {};
  templateVars.user_id = users[req.cookies.user_id];
  res.render("register", templateVars);
  
})
app.post("/register", (req, res) => {
  console.log("registration")
  res.redirect("/urls/register");
})
app.get("/urls/login" , (req, res) => {
  console.log("getting logging")
  let templateVars = {};
  templateVars.user_id = users[req.cookies.user_id];
  res.render("login", templateVars);
})
app.post("/login", (req,res) => {
  console.log("posting logging");
  res.redirect("/urls/login");
})
app.post("/urls/login", (req, res) => {
  let userId = matchEmail(req.body.email);
  if(matchEmail(req.body.email)) {
    if (users[userId].password !== req.body.password) {
      res.status(403).send("Your Password is wrong. Please try again!");
    } else{
      res.cookie("user_id", userId);
      res.redirect("/urls")
    };
  } else {
    res.status(403).send("Your email address can't be found");
  }
})
app.post("/urls/:shortURL", (req, res) => {
  //req.body
  let shorturl = req.params.shortURL; 
  urlDatabase[shorturl].longURL = req.body.newURL;
  res.redirect("/urls/")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let shorturl = req.params.shortURL;  
  if (req.cookies.user_id === urlDatabase[shorturl].userID) {
  delete urlDatabase[shorturl];
  res.redirect(`/urls`);
  } else {
    let templateVars = {"user_id": req.cookies.user_id};
    res.render("notYours", templateVars)
  };

})
app.post("/urls/:shortURL/edit", (req, res) => {
  let shorturl = req.params.shortURL;
  if (req.cookies.user_id === urlDatabase[shorturl].userID) {
    res.redirect(`/urls/${shorturl}`);
  } else {
    let templateVars = {"user_id": req.cookies.user_id};
    res.render("notYours", templateVars)
  };

})
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  let shorturl = req.params.shortURL;
  console.log("shorturl: ",shorturl)
  console.log("urlDatabase: ", urlDatabase);
  if(!urlDatabase[shorturl]) {
    const templateVars = {};
    templateVars["user_id"] = users[req.cookies.user_id];

    res.render("WrongURL",templateVars);
  } else {
  const longURL = urlDatabase[shorturl].longURL;
  console.log("longURL: ",longURL);
  res.redirect(longURL);
  }
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
  const templateVars = { urls: urlsForUser(req.cookies.user_id)  };
 
    templateVars["user_id"] = users[req.cookies.user_id];
  
    console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  templateVars.user_id = users[req.cookies.user_id];
  if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  } else{
    res.redirect("/urls")
  }
});
app.get("/urls/:shortURL", (req, res) => {
   let shorturl = req.params.shortURL;
   
   if (req.cookies.user_id === urlDatabase[shorturl].userID) {

    const templateVars = {shorturl: shorturl, longURL: urlDatabase[shorturl].longURL}
    
      templateVars["user_id"] = users[req.cookies.user_id];
    res.render("urls_show", templateVars);
  } else {
    let templateVars = {"user_id": req.cookies.user_id};
    res.render("notYours", templateVars)
  };
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});