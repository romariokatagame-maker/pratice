const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const store = require('../data/store');
const validate = require('../middleware/validate');
const { signToken, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isLength({ min: 3 }).withMessage('Nama minimal 3 karakter'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
    body('role').optional().isIn(['warga', 'polisi']).withMessage('Role tidak valid'),
    validate,
  ],
  (req, res) => {
    const { name, email, password, role } = req.body;

    if (store.findUserByEmail(email)) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const user = store.createUser({ name, email, password, role: role || 'warga' });
    return res.status(201).json({ token: signToken(user), user: store.publicUser(user) });
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
    validate,
  ],
  (req, res) => {
    const { email, password } = req.body;
    const user = store.findUserByEmail(email);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    return res.json({ token: signToken(user), user: store.publicUser(user) });
  }
);

router.get('/me', authenticate, (req, res) => {
  res.json({ user: store.publicUser(req.user) });
});

module.exports = router;
