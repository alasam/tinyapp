const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

}))

const { checkUserEmails, urlsForUser, generateRandomString } = require('./helper');

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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

// Login check
app.post("/login", (req, res) => {
  const checkEmail = req.body.email;
  const userPassword = req.body.password;
  const user_id = checkUserEmails(checkEmail, users);
  if (!user_id) {
    res.status(403).send("Error 403: Email not found!");
  }  else if (user_id && bcrypt.compareSync(userPassword, users[user_id].password)) {
    req.session.user_id = user_id;
      res.redirect(`/urls/`);
  } else {
    res.status(403).send("Error 403: Incorrect Password!");
  }
});

// Clear Cookie
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect(`/login`);
});

// Register new account page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect(`/urls/`)
  };
  const user_id = req.session.user_id;
  const templateVars = { user_id: users[user_id] };
  res.render("urls_register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect(`/urls/`)
  };
  const user_id = req.session.user_id;
  const templateVars = { user_id: users[user_id] };
  res.render("urls_login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Get Index page
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("You are not logged in! Please register or login before proceeding.");
  }
  const user_id = req.session.user_id;
  const userURL = urlsForUser(user_id, urlDatabase);
  const templateVars = { urls: userURL, user_id: users[user_id]};
  
  res.render("urls_index", templateVars);
});

// Get new URL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`)
  } else {
    const user_id = req.session.user_id;
    const templateVars =  {user_id: users[user_id] };
  
    res.render("urls_new", templateVars);
  }

});

// Get new short URL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user_id: users[user_id] };
  res.render("urls_show", templateVars);
});


// Submitting new long url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);      
});

// Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("Error 404: Page Not Found!");
  } 
  const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});

// Store register data in users object
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const userPassword = req.body.password;
  const password = bcrypt.hashSync(userPassword, 10);

if (!email || !password) {
  res.status(400).send("Error 400: Please enter valid email/password");
} else if (checkUserEmails(email, users)) {
  res.status(400).send("Error 400: Email already in use!");
}

  users[user_id] = {};
  users[user_id]['id'] = user_id;
  users[user_id]['email'] = email;
  users[user_id]['password'] = password;
  req.session.user_id = user_id;

  res.redirect('/urls/');
})

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Error 403: You are unable to delete URL!");
  }
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Error 403: You are unable to delete URL!");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`); 
});
