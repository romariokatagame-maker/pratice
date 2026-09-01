const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const store = require('../data/store');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const createReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak laporan, coba lagi nanti' },
});

module.exports = function reportsRouter(io) {
  const router = express.Router();

  router.post(
    '/',
    authenticate,
    createReportLimiter,
    [
      body('crimeType').isIn(store.CRIME_TYPES).withMessage('Tipe kejahatan tidak valid'),
      body('description').isLength({ min: 10, max: 500 }).withMessage('Deskripsi 10-500 karakter'),
      body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude tidak valid'),
      body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude tidak valid'),
      body('address').optional().isLength({ max: 200 }),
      body('photoURL').optional({ values: 'falsy' }).isURL().withMessage('URL foto tidak valid'),
      validate,
    ],
    (req, res) => {
      const report = store.createReport({
        userId: req.user.id,
        crimeType: req.body.crimeType,
        description: req.body.description,
        latitude: Number(req.body.latitude),
        longitude: Number(req.body.longitude),
        address: req.body.address,
        photoURL: req.body.photoURL,
      });

      io.to('polisi').emit('newReport', report);

      res.status(201).json({
        success: true,
        reportId: report.id,
        message: 'Laporan berhasil dikirim ke kepolisian',
        report,
      });
    }
  );

  router.get(
    '/',
    authenticate,
    [query('status').optional().isIn(store.REPORT_STATUS), validate],
    (req, res) => {
      const filter = { status: req.query.status };
      if (req.user.role !== 'polisi') {
        filter.userId = req.user.id;
      }
      res.json(store.listReports(filter));
    }
  );

  router.get('/:id', authenticate, (req, res) => {
    const report = store.findReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
    if (req.user.role !== 'polisi' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    return res.json(report);
  });

  router.put(
    '/:id/respond',
    authenticate,
    authorize('polisi'),
    [
      param('id').notEmpty(),
      body('message').isLength({ min: 5, max: 500 }).withMessage('Pesan 5-500 karakter'),
      body('status').optional().isIn(['confirmed', 'responded', 'resolved']),
      validate,
    ],
    (req, res) => {
      const report = store.respondToReport(req.params.id, {
        officerId: req.user.id,
        message: req.body.message,
        status: req.body.status || 'confirmed',
      });

      if (!report) {
        return res.status(404).json({ error: 'Laporan tidak ditemukan' });
      }

      io.to(`user:${report.userId}`).emit('reportUpdated', report);
      io.to('polisi').emit('reportUpdated', report);

      return res.json({ success: true, message: 'Balasan terkirim', report });
    }
  );

  return router;
};
