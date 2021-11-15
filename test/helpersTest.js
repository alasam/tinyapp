// Modules
const { assert } = require('chai');
const { checkUserEmails } = require('../helper.js');

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

describe('checkUserEmails', function() {
  it('should return a user with valid email', function() {
    const user = checkUserEmails("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });  
  
  it('should return undefined with invalid email', function() {
    const user = checkUserEmails("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
   
  });  

});rs