const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
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

// Submitting username
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  console.log(req.cookies);
  res.redirect(`/urls/`);
});

// Clear Cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(req.cookies);
  res.redirect(`/urls/`);
});

// Register new account page
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user_id: users[user_id] };
  res.render("urls_register", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user_id: users[user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars =  {user_id: users[user_id] };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const templateVars = { shortURL, longURL: urlDatabase[shortURL], user_id: users[user_id] };
  res.render("urls_show", templateVars);
});


// Submitting new long url
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console

  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);      
});

// Redirects shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

// Store registar data in users object
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

if (!email || !password) {
  res.status(400).send("Error 400: Please enter valid email/password");
} else if (checkUserEmails(email)) {
  res.status(400).send("Error 400: Email already in use!");
}

  users[user_id] = {};
  users[user_id]['id'] = user_id;
  users[user_id]['email'] = email;
  users[user_id]['password'] = password;
  res.cookie("user_id", user_id);

  res.redirect('/urls/');
})


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); 
})

function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function checkUserEmails (email)  {
  for (let userDb in users) {
    console.log(userDb)
    if (users[userDb].email === email) {
      return userDb;
    }
  }
  return undefined;
};