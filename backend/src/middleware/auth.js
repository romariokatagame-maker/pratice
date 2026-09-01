const jwt = require('jsonwebtoken');
const store = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'timika-aman-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    const payload = verifyToken(token);
    const user = store.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    return next();
  };
}

module.exports = { signToken, verifyToken, authenticate, authorize, JWT_SECRET };
