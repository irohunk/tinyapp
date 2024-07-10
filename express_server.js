const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found');
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }; /* What goes here? */ 
  res.render("urls_show", templateVars);
});

// Update/Edit
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    longURL: urls[id]
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

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
