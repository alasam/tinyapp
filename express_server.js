// Modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { checkUserEmails, urlsForUser, generateRandomString } = require('./helper');

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

}));

// URL Database where example and added URLs are stored
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
// User Database where example and added users are stored
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

// Open port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Login check process; verifies if email and password exist or matches with an entry in our DB. If so, proceeds to /urls/, if not error message.
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

// Root redirects you /urls page unless you are not logged in, then /logon page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  res.redirect("/login");
});

// Logout user; clear cookies and redirects to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// Renders registration page from urls_registration template. If user is already logged in, redirects to /urls/.
app.get("/register", (req, res) => {

  const user_id = req.session.user_id;
  const templateVars = { user_id: users[user_id] };
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  res.render("urls_register", templateVars);
});

// Renders login page from urls_login template. If user is already logged in, redirects to /urls/.
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user_id: users[user_id] };
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  res.render("urls_login", templateVars);
});



// Renders url page from urls_index template. If user is not signed in, error message.
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("You are not logged in! Please register or login before proceeding.");
  }
  const user_id = req.session.user_id;
  const userURL = urlsForUser(user_id, urlDatabase);
  const templateVars = { urls: userURL, user_id: users[user_id]};
  
  res.render("urls_index", templateVars);
});

// Renders new url page from urls_new tempalte. If user is not logged in, redirects to login page.
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    const user_id = req.session.user_id;
    const templateVars =  {user_id: users[user_id] };
  
    res.render("urls_new", templateVars);
  }

});

// Get new short URL page, error if shortURL doesnt match any in db and if user doesnt match/exist
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Error 404: Page Not Found!");
  }

  const user_id = req.session.user_id;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user_id: users[user_id] };

  if (!templateVars.user_id || urlDatabase[shortURL].userID !== user_id) {
    return res.status(403).send("Error 403: Please login before proceeding");
  }

  res.render("urls_show", templateVars);
});


// New url submission page. URL will be given a randomize short url id, and added to the url Database. 
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// Verifies the short url and redirects to corrisponding long url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Error 404: Page Not Found!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Registers user to randomly generated user ID, encrypts password, and stores data in users DB. If password/email is invalid or email already in use, error message.
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  
  if (!req.body.email) {
    res.status(400).send("Error 400: Please enter valid email!");
  } else if (!req.body.password) {
    res.status(400).send("Error 400: Password cannot be blank!");
  } else if (checkUserEmails(req.body.email, users)) {
    res.status(400).send("Error 400: Email already in use!");
  } else {
    const email = req.body.email;
    const userPassword = req.body.password;
    const password = bcrypt.hashSync(userPassword, 10);
  
    users[user_id] = {};
    users[user_id]['id'] = user_id;
    users[user_id]['email'] = email;
    users[user_id]['password'] = password;
    req.session.user_id = user_id;
  
    res.redirect('/urls/');
  }


});

// Assigned url to be deleted by user. If unassigned user tries to delete, error message.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Error 403: You are unable to delete URL!");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Assigned url to be edit by user. If unassigned user tries to edit, error message.
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Error 403: You are unable to delete URL!");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
