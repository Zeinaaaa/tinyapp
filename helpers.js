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

const generateRandomString = () => {
  return Math.random().toString(36).slice(7)};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if(database[user].email === email) {
      return database[user].id
    }
  }
  return null;
};

const urlsForUser = function (id) {
  userDatabase = {};
  for (let user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      userDatabase[user] = urlDatabase[user];
    }
  }
  return userDatabase;
}

module.exports = {urlDatabase, users, generateRandomString, getUserByEmail, urlsForUser}; 