function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function checkUserEmails (email, database)  {
  for (let userDb in database) {
    if (database[userDb].email === email) {
      return userDb;
    }
  }
  return undefined;
};

function urlsForUser (id, database) {
  const userDB = [];
  for (let url in database) {
    if (database[url].userID === id) {
      userDB[url] = database[url];
    }
  }
  return userDB;
}



module.exports = { checkUserEmails, urlsForUser, generateRandomString};