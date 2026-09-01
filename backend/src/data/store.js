const bcrypt = require('bcryptjs');

const CRIME_TYPES = [
  'jambret',
  'maling',
  'pembunuhan',
  'pelecehan',
  'kekerasan',
  'tawuran',
];

const REPORT_STATUS = ['pending', 'confirmed', 'responded', 'resolved'];

const users = new Map();
const reports = new Map();

let userSeq = 0;
let reportSeq = 0;

function createUser({ name, email, password, role }) {
  const id = `user_${++userSeq}`;
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return user;
}

function findUserByEmail(email) {
  return [...users.values()].find((u) => u.email === email.toLowerCase());
}

function findUserById(id) {
  return users.get(id);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function createReport({ userId, crimeType, description, latitude, longitude, address, photoURL }) {
  const id = `report_${++reportSeq}`;
  const report = {
    id,
    userId,
    crimeType,
    description,
    location: { latitude, longitude, address: address || 'Timika, Papua' },
    photoURL: photoURL || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    policeReply: null,
  };
  reports.set(id, report);
  return report;
}

function findReportById(id) {
  return reports.get(id);
}

function listReports({ userId, status } = {}) {
  return [...reports.values()]
    .filter((r) => (userId ? r.userId === userId : true))
    .filter((r) => (status ? r.status === status : true))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function respondToReport(id, { officerId, message, status }) {
  const report = reports.get(id);
  if (!report) return null;
  report.status = status;
  report.policeReply = {
    officerId,
    message,
    confirmTime: new Date().toISOString(),
  };
  return report;
}

function seed() {
  if (users.size > 0) return;
  createUser({ name: 'Warga Timika', email: 'warga@timika.id', password: 'warga1234', role: 'warga' });
  createUser({ name: 'Polres Mimika', email: 'polisi@timika.id', password: 'polisi1234', role: 'polisi' });
}

function reset() {
  users.clear();
  reports.clear();
  userSeq = 0;
  reportSeq = 0;
}

module.exports = {
  CRIME_TYPES,
  REPORT_STATUS,
  createUser,
  findUserByEmail,
  findUserById,
  publicUser,
  createReport,
  findReportById,
  listReports,
  respondToReport,
  seed,
  reset,
};
