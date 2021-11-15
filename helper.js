// Function to generate random string containing 6 characters (alphanumeric only)
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Function to check database for matching email, which will return the user ID or undefined if nothing found
const checkUserEmails = function(email, database)  {
  for (let userDb in database) {
    if (database[userDb].email === email) {
      return userDb;
    }
  }
  return undefined;
};

// Function pulls urls created by specific user to list in index
const urlsForUser = function(id, database) {
  const userDB = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userDB[url] = database[url];
    }
  }
  return userDB;
};



module.exports = { checkUserEmails, urlsForUser, generateRandomString};