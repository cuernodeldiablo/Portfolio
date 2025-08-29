const db = require('../config/db');

function findUser(username, password, callback) {
  const query = `
    SELECT * FROM users 
    WHERE LOWER(username) = LOWER(?) AND LOWER(password) = LOWER(?)
  `;
  db.query(query, [username, password], callback);
}

module.exports = { findUser };