const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express(); // ✅ Define 'app' before using it

const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: true })); // ✅ Enable form data parsing
app.use(express.json()); // ✅ Optional: enable JSON parsing for Postman

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', authRoutes);

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});