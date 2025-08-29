const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const {
  showLoginPage,
  showRegisterPage,
  showHomePage,
  showProfilePage,
  handleLogin,
  getProfileData
} = require('../controllers/authController');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes
router.get('/', showLoginPage);
router.get('/register', showRegisterPage);
router.get('/home', showHomePage);
router.get('/profile', showProfilePage);
router.get('/api/user', getProfileData);

router.post('/auth', handleLogin);

router.post('/register', (req, res) => {
  const { newUsername, newPassword } = req.body;
  if (!newUsername || !newPassword) return res.redirect('/register?error=1');

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [newUsername, newPassword], (err) => {
    if (err) return res.redirect('/register?error=1');
    res.redirect('/register?success=1');
  });
});

// ✅ Profile update route with fallback logic
router.post('/profile/update', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resumes', maxCount: 5 }
]), (req, res) => {
  const { name, bio, motto, skills, existingImage } = req.body;
  const username = req.session.username;

  const newImage = req.files['profileImage']?.[0]?.filename;
  const newResumes = req.files['resumes']?.map(f => f.filename).join(',');

  const finalImage = newImage || existingImage || null;

  // Get existing resumePaths if profile exists
  const selectQuery = 'SELECT resumePaths FROM profiles WHERE username = ?';
  db.query(selectQuery, [username], (err, results) => {
    const existingResumes = results?.[0]?.resumePaths || null;
    const finalResumes = newResumes || existingResumes;

    const updateQuery = `
      INSERT INTO profiles (username, name, bio, motto, skills, imagePath, resumePaths)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        bio = VALUES(bio),
        motto = VALUES(motto),
        skills = VALUES(skills),
        imagePath = VALUES(imagePath),
        resumePaths = VALUES(resumePaths)
    `;

    db.query(updateQuery, [username, name, bio, motto, skills, finalImage, finalResumes], (err) => {
      if (err) {
        console.error('❌ DB error:', err);
        return res.send('❌ Error saving profile.');
      }
      res.redirect('/home');
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;