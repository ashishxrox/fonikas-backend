const express = require('express');
const { signup, login, currentUser, resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middleWare/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/current-user', authMiddleware, currentUser);
router.put('/reset-pass/:token', resetPassword);

module.exports = router;
