const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers/authenticationHelpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedUserID, 'User ID should match the expected value');
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user, undefined, 'User should be undefined');
  });
});



// Test urlsForUser

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Define expected output
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });
  it('should return an empty object if no URLs belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Define expected output
    const expectedOutput = {};

    // Call the function with userId 'user1'
    const result = urlsForUser('non-existent', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });
  it('should return an empty object if the urlDatabase is empty', function() {
    // Define test data
    const urlDatabase = {};

    // Define expected output
    const expectedOutput = {};

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });
  it('should return urls that belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Define expected output
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user2', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });
});