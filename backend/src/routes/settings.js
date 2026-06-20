import express from 'express';
import SystemSettings from '../models/SystemSettings.js';
import TimelineMilestone from '../models/TimelineMilestone.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get public system settings (branding, pricing config, upi, dynamic QRs)
// @route   GET /api/settings/public
// @access  Public
router.get('/public', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    const publicData = {
      eventTitle: settings.eventTitle,
      eventTagline: settings.eventTagline,
      eventMode: settings.eventMode,
      upiId: settings.upiId,
      qrCodeFull: settings.qrCodeFull,
      qrCodeCustom: settings.qrCodeCustom,
      qrCode1: settings.qrCode1 || "",
      qrCode2: settings.qrCode2 || "",
      qrCode3: settings.qrCode3 || "",
      qrCode4: settings.qrCode4 || "",
      qrCode5: settings.qrCode5 || "",
      qrCode6: settings.qrCode6 || "",
      priceFull: settings.priceFull,
      priceCustom: settings.priceCustom
    };

    res.json({ success: true, data: publicData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update system settings (branding, prices, UPIs, QRs)
// @route   PUT /api/settings
// @access  Private (Admin)
router.put('/', protectAdmin, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    const {
      eventTitle,
      eventTagline,
      eventMode,
      upiId,
      qrCodeFull,
      qrCodeCustom,
      qrCode1,
      qrCode2,
      qrCode3,
      qrCode4,
      qrCode5,
      qrCode6,
      priceFull,
      priceCustom
    } = req.body;

    if (eventTitle !== undefined) settings.eventTitle = eventTitle;
    if (eventTagline !== undefined) settings.eventTagline = eventTagline;
    if (eventMode !== undefined) settings.eventMode = eventMode;
    if (upiId !== undefined) settings.upiId = upiId;
    if (qrCodeFull !== undefined) settings.qrCodeFull = qrCodeFull;
    if (qrCodeCustom !== undefined) settings.qrCodeCustom = qrCodeCustom;
    if (qrCode1 !== undefined) settings.qrCode1 = qrCode1;
    if (qrCode2 !== undefined) settings.qrCode2 = qrCode2;
    if (qrCode3 !== undefined) settings.qrCode3 = qrCode3;
    if (qrCode4 !== undefined) settings.qrCode4 = qrCode4;
    if (qrCode5 !== undefined) settings.qrCode5 = qrCode5;
    if (qrCode6 !== undefined) settings.qrCode6 = qrCode6;
    if (priceFull !== undefined) settings.priceFull = Number(priceFull);
    if (priceCustom !== undefined) settings.priceCustom = Number(priceCustom);

    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= TIMELINE MILESTONES CRUD =================

// @desc    Get active timeline milestones (Public)
// @route   GET /api/settings/timeline
// @access  Public
router.get('/timeline', async (req, res) => {
  try {
    const milestones = await TimelineMilestone.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, count: milestones.length, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all timeline milestones (Admin)
// @route   GET /api/settings/timeline/all
// @access  Private (Admin)
router.get('/timeline/all', protectAdmin, async (req, res) => {
  try {
    const milestones = await TimelineMilestone.find().sort({ order: 1 });
    res.json({ success: true, count: milestones.length, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a timeline milestone
// @route   POST /api/settings/timeline
// @access  Private (Admin)
router.post('/timeline', protectAdmin, async (req, res) => {
  try {
    const { title, date, desc, order, active } = req.body;
    if (!title || !date || !desc) {
      return res.status(400).json({ success: false, message: 'Please enter title, date, and description' });
    }

    const milestone = new TimelineMilestone({
      title,
      date,
      desc,
      order: order ? Number(order) : 0,
      active: active !== undefined ? active : true
    });

    await milestone.save();
    res.status(201).json({ success: true, message: 'Milestone created successfully', data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a timeline milestone
// @route   PUT /api/settings/timeline/:id
// @access  Private (Admin)
router.put('/timeline/:id', protectAdmin, async (req, res) => {
  try {
    const milestone = await TimelineMilestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    const { title, date, desc, order, active } = req.body;

    if (title !== undefined) milestone.title = title;
    if (date !== undefined) milestone.date = date;
    if (desc !== undefined) milestone.desc = desc;
    if (order !== undefined) milestone.order = Number(order);
    if (active !== undefined) milestone.active = active;

    await milestone.save();
    res.json({ success: true, message: 'Milestone updated successfully', data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a timeline milestone
// @route   DELETE /api/settings/timeline/:id
// @access  Private (Admin)
router.delete('/timeline/:id', protectAdmin, async (req, res) => {
  try {
    const milestone = await TimelineMilestone.findByIdAndDelete(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }
    res.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
