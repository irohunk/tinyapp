const express = require("express");
const bodyParser = require('body-parser');
// const session = require('express-session');
const app = express();
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session'); // Import cookie-session

const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

const { users } = require("./data/userData");
const {
  authenticateUser,
  userExists,
  createUser,
  getUserByEmail,
  urlsForUser
} = require("./helpers/authenticationHelpers");

app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(express.json());

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie-session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['15321'], // Replace 'your-secret-key' with a real secret key
  // Cookie options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Session middleware
// app.use(session({
//   secret: 'some secret key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to 'true' in production with HTTPS
// }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ491Q",
  },
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
  console.log("user = ", user); // debugging

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    console.log('Login successful, setting cookie:', user.id); // Debugging statement
    console.log("Session userID", req.session.userId);
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid login credentials');
  }
});

// Generate Random String as Short URL
function generateShortURL() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var randomString = '';
  for (var i = 6; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}

// Protecting the routes
const authenticate = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};


// URLs route
app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  // Debug: Print user ID
  console.log("Session User ID:", userId);

  if (!userId) {
    return res.send("Please log in or register to view URLs.");
    // return res.redirect('/login?error=Please log in to view URLs');
  }
 
  const user = users[userId];
  // console.log('User object:', user); // Debugging statement
  const userURLs = urlsForUser(userId, urlDatabase);
  console.log("Filtered URLs for User:", userURLs); // Debugging

  const templateVars = {
    user,
    urls: userURLs
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("<h2>You need to be logged in to shorten URLs.</h2>");
    // return res.redirect('/login?error=Please log in to shorten URLs');
    // req.session.error = "<h2>You need to be logged in to shorten URLs.</h2>";
    // return res.redirect("/login");
  }
  // const longURL = req.body.longURL;
  const { longURL } = req.body;
  const id = generateShortURL();

  urlDatabase[id] = {
    longURL,
    userID: userId
  }

  console.log(urlDatabase);
  
  console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${id}`);
});


app.get("/urls/new", (req, res) => {
  // Check if the user is logged in
  if (!req.session.userId) {
    // Redirect to the login page if not logged in
    return res.redirect("/login");
  }
  // Extract user ID from session
  const userId = req.session.userId;;
  // Fetch user details for template rendering
  const user = users[userId];

  // Prepare template variables
  const templateVars = {
    user
  };
  
  // Render the template with user data
  res.render("urls_new", templateVars);
});



app.get("/u/:id", (req, res) => {
  // Retrieve the userId from session if needed
  const userId = req.session.userId;;
  // const user = users[userId];

  // Get the shortened URL id from the request parameters
  const id = req.params.id;
  // const longURL = urlDatabase[id].longURL; // CHANGED HERE

  // Fetch the URL entry from the database
  const urlEntry = urlDatabase[id];
  // const templateVars = {
  //   user
  // };
  
  // Check if the URL entry exists
  if (urlEntry) {
    const longURL = urlEntry.longURL; // Correctly access longURL
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found'); // Provide clear feedback
  }
  
  // res.render(templateVars);
});

// Update/Edit
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;;
  const user = users[userId];
  const id = req.params.id;

  // Check if the user is logged in
  if (!userId) {
    return res.status(403).send("Please log in to view this URL.");
  }

  // Check if the URL exists
  const urlEntry = urlDatabase[id];
  if (!urlEntry) {
    return res.status(404).send("URL not found.");
  }

  // Check if the current user owns the URL
  if (urlEntry.userID !== userId) {
    return res.status(403).send("You do not have permission to view this URL.");
  }

  const templateVars = {
    longURL: urlEntry.longURL,
    user,
    id
  }

  res.render('urls_show', templateVars);
})


app.post("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  // Check if the user is logged in
  if (!userId) {
    return res.status(403).send("Please log in to edit this URL.");
  }

  // Check if the URL exists
  const urlEntry = urlDatabase[id];
  if (!urlEntry) {
    return res.status(404).send("URL not found.");
  }

  // Check if the current user owns the URL
  if (urlEntry.userID !== userId) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  // Update the longURL
  urlDatabase[id].longURL = newLongURL;

  res.redirect('/urls');
})


// Delete
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const urlToDelete = req.params.id;
  const urlEntry = urlDatabase[urlToDelete];

  // Check if the user is logged in
  if (!userId) {
    return res.status(403).send("Please log in to delete URLs.");
  }
  
  // Check if the URL exists
  if (!urlEntry) {
    return res.status(404).send("URL not found.");
  }
  
  // Check if the current user owns the URL
  if (urlEntry.userID !== userId) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }

  // Delete the URL entry
  delete urlDatabase[urlToDelete];

  // Redirect to URLs list after deletion
  res.redirect('/urls');
})


// Logout
app.post('/logout', (req, res) => {
  // Clear the session
  // req.session.email = null;
  req.session = null;
  // Redirect to /urls page
  res.redirect('/login');
});


// Register
app.get('/register', (req, res) => {
  // Render the registration page with a null user (no one logged in)
  const templateVars = { user: null };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  // Validate email and password are not empty
  if (!email || !password) {
    req.session.error = "Email and password cannot be empty.";
    return res.redirect('/register');
  }

  // Check if the user already exists
  if (userExists(email, users)) {
    req.session.error = "Email already exists.";
    // return res.redirect('/register');
    return res.status(400).send('Email already exists');
  }

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Otherwise, create the user
  const newUser = createUser(email, hashedPassword, users);
  
  // Clear error
  req.session.error = null;

  // Set session userID to newly created user's ID
  req.session.userId = newUser.id;
  // res.cookie('user_id', userId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


module.exports = { urlDatabase };