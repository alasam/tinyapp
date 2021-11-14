const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

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
  const checkPassword = req.body.password;
  const user_id = checkUserEmails(checkEmail);
  
  if (!user_id) {
    res.status(403).send("Error 403: Email not found!");
  } else if (user_id && users[user_id].password !== checkPassword) {
    res.status(403).send("Error 403: Incorrect Password!");
  } 
  res.cookie('user_id', user_id);
  res.redirect(`/urls/`);
});

// Clear Cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls/`);
});

// Register new account page
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect(`/urls/`)
  };
  const user_id = req.cookies["user_id"];
  const templateVars = { user_id: users[user_id] };
  res.render("urls_register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect(`/urls/`)
  };
  const user_id = req.cookies["user_id"];
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
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in! Please register or login before proceeding.");
  }
  const user_id = req.cookies["user_id"];
  const userURL = urlsForUser(user_id);
  const templateVars = { urls: userURL, user_id: users[user_id]};
  
  res.render("urls_index", templateVars);
});

// Get new URL
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect(`/login`)
  } else {
    const user_id = req.cookies["user_id"];
    const templateVars =  {user_id: users[user_id] };
  
    res.render("urls_new", templateVars);
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user_id: users[user_id] };
  res.render("urls_show", templateVars);
});


// Submitting new long url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
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

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
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
    if (users[userDb].email === email) {
      return userDb;
    }
  }
  return undefined;
};

function urlsForUser (id) {
  const userDB = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userDB[url] = urlDatabase[url];
    }
  }
  return userDB;
}