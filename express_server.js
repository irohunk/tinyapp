const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

const { users } = require("./data/userData");
const {
  authenticateUser,
  userExists,
  createUser,
  getUserByEmail
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
app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (user && user.password === password) {
    req.session.userId = user.id;
    console.log('Login successful, setting cookie:', user.id); // Debugging statement
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid login credentials');
  }
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
  const userId = req.session.userId;
  console.log('User ID from cookie:', userId); // Debugging statement
  // console.log(users);
  const user = users[userId];
  console.log('User object:', user); // Debugging statement
  const templateVars = { user, urls: urlDatabase };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;;
  const user = users[userId];
  const templateVars = {
      // username: req.cookies["username"],
      user
    };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const userId = req.session.userId;;
  const user = users[userId];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    // username: req.cookies["username"],
    user
  };
  res.render(templateVars);
  
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found');
  }
});

// Update/Edit
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;;
  const user = users[userId];
  const id = req.params.id;
  const templateVars = {
    longURL: urls[id],
    // username: req.cookies["username"],
    user
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
// app.get("/logout", (req, res) => {
//   const userId = req.cookies.user_id;
//   const user = users[userId];
//   const templateVars = {
//     // longURL: urls[id],
//     // // username: req.cookies["username"],
//     user
//   }

//   res.redirect('/login');
// })

app.post('/logout', (req, res) => {
  // const userId = req.cookies.user_id;
  // const user = users[userId];
  // Clear the 'username' cookie
  // res.clearCookie('username');
  req.session.email = null;
  // Redirect to /urls page
  res.redirect('/login');
});


// Register
// app.get("/register", (req, res) => {
//   console.log('Username from session:', req.session.username);
//   res.render('register', { 
//     username: req.session.username,
//     error: req.session.error || null });
//   // const templateVars = {error: req.cookies.error}
//   // res.clearCookie("error")

//   // return res.render("register", templateVars);
// });

app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('register', templateVars);
});

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

  req.session.userId = newUser.id; // Change this based on your user logic
  // res.cookie('user_id', userId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
