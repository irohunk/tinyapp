const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

const users = require("./data/userData");
const {
  authenticateUser,
  userExists,
  createUser
} = require("./helpers/authenticationHelpers");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'some secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to 'true' in production with HTTPS
}));



const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));

// Login
app.post('/login', (req, res) => {
  const username = req.body.username;
  
  res.cookie('username', username);
  res.redirect('/urls');
});

// Generate Random String as Short URL
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var randomString = '';
  for (var i = 6; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${id}`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
      username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    username: req.cookies["username"]};
  res.render(templateVars);
  
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found');
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] }; /* What goes here? */ 
  res.render("urls_show", templateVars);
});

// Update/Edit
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    longURL: urls[id],
    username: req.cookies["username"]
  }

  res.render('urls_show', templateVars);
})

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newlongURL = req.body.longURL;

  urlDatabase[id] = newlongURL;
  res.redirect('/urls');
})

// Delete
app.post("/urls/:id/delete", (req, res) => {
  const urlId = req.params.id;

  delete urlDatabase[urlId];

  res.redirect('/urls');
})

// Logout
app.post('/logout', (req, res) => {
  // Clear the 'username' cookie
  res.clearCookie('username');
  // Redirect to /urls page
  res.redirect('/urls');
});

// Register
app.get("/register", (req, res) => {
  console.log('Username from session:', req.session.username);
  res.render('register', { 
    username: req.session.username,
    error: req.session.error || null });
  // const templateVars = {error: req.cookies.error}
  // res.clearCookie("error")

  // return res.render("register", templateVars);
});

// logging to check if session data is populated
// app.use((req, res, next) => {
//   console.log('Session Data:', req.session); // Log session data
//   next();
// });

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.error = "Email and password cannot be empty.";
    return res.redirect('/register');
  }

  // Check if the user already exists; for simplicity, assume a function `userExists`
  if (userExists(email, users)) {
    req.session.error = "Email already exists.";
    return res.redirect('/register');
  }

  // Otherwise, create the user
  // Assuming a function `createUser`
  const newUser = createUser(email, password, users);
  
  // Clear error
  req.session.error = null;

  req.session.username = newUser.email; // Change this based on your user logic
  res.redirect('/urls');
});


// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = authenticateUser(email, password); // Example function

  if (user) {
    req.session.username = user.username; // Store the username in the session
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid credentials');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
