const path = require('path');
const db = require('../config/db');

const showLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
};

const showRegisterPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
};

const showHomePage = (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
  } else {
    res.redirect('/');
  }
};

const showProfilePage = (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
  } else {
    res.redirect('/');
  }
};

const handleLogin = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send('⚠️ Please enter both username and password.');

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.send('❌ Error during login.');
    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/home');
    } else {
      res.send('❌ Incorrect username or password.');
    }
  });
};

const getProfileData = (req, res) => {
  const username = req.session.username;
  const query = 'SELECT * FROM profiles WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results[0] || {});
  });
};

module.exports = {
  showLoginPage,
  showRegisterPage,
  showHomePage,
  showProfilePage,
  handleLogin,
  getProfileData
};