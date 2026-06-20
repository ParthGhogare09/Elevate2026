import express from 'express';
import Announcement from '../models/Announcement.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all active announcements
// @route   GET /api/announcements/active
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please enter title and content' });
    }

    const announcement = new Announcement({
      title,
      content,
      type,
      active: true
    });

    await announcement.save();
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle announcement active status
// @route   PUT /api/announcements/:id/toggle
// @access  Private (Admin)
router.put('/:id/toggle', protectAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement.active = !announcement.active;
    await announcement.save();

    res.json({ success: true, message: `Announcement active status set to ${announcement.active}`, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
