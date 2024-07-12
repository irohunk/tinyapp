const { users } = require('../data/userData');
const { urlDatabase } = require('../express_server');


const authenticateUser = (users, email, password) => {
  const user = users[email];

  if (!user) {
    return { error: "email does not exist", user: null };
  }

  if (user.password !== password) {
    return { error: "incorrect password", user: null };
  }

  return { error: null, user };
};

// Helper function to check if a user exists
const userExists = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};

// Helper function to create a new user
const createUser = (email, password, users) => {
  const userId = generateRandomString(); // You need a function to generate unique IDs
  users[userId] = {
    id: userId,
    email: email,
    password: password // In real projects, encrypt the password
  };
  return users[userId];
};

// Function to generate a random string for user ID
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Function to find a user by email
const getUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) return user;
  }
  return null;
};

const urlsForUser = (id) => {
  const userURLs = {}
    for (const urlId in urlDatabase) {
      if (urlDatabase[urlId].userID === id) {
        userURLs[urlId] = urlDatabase[urlId];
      }
    return userURLs;
  }
}

module.exports = { authenticateUser, userExists, createUser, getUserByEmail, urlsForUser };