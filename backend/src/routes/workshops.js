import express from 'express';
import Workshop from '../models/Workshop.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all workshops
// @route   GET /api/workshops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ createdAt: 1 });
    res.json({ success: true, count: workshops.length, data: workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single workshop details by slug ID
// @route   GET /api/workshops/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ id: req.params.id });
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    res.json({ success: true, data: workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new workshop
// @route   POST /api/workshops
// @access  Private (Admin)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { id, title, description, mentor, dateTime, status, meetingLink, whatsappGroupLink, studyMaterialLink } = req.body;

    const exists = await Workshop.findOne({ id });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Workshop with this ID already exists' });
    }

    const workshop = new Workshop({
      id,
      title,
      description,
      mentor,
      dateTime,
      status,
      meetingLink,
      whatsappGroupLink,
      studyMaterialLink
    });

    await workshop.save();
    res.status(201).json({ success: true, data: workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a workshop
// @route   PUT /api/workshops/:id
// @access  Private (Admin)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ id: req.params.id });
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    const { title, description, mentor, dateTime, status, meetingLink, resources, whatsappGroupLink, studyMaterialLink } = req.body;

    if (title !== undefined) workshop.title = title;
    if (description !== undefined) workshop.description = description;
    if (mentor !== undefined) workshop.mentor = mentor;
    if (dateTime !== undefined) workshop.dateTime = dateTime;
    if (status !== undefined) workshop.status = status;
    if (meetingLink !== undefined) workshop.meetingLink = meetingLink;
    if (resources !== undefined) workshop.resources = resources;
    if (whatsappGroupLink !== undefined) workshop.whatsappGroupLink = whatsappGroupLink;
    if (studyMaterialLink !== undefined) workshop.studyMaterialLink = studyMaterialLink;

    await workshop.save();
    res.json({ success: true, message: 'Workshop updated successfully', data: workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a workshop
// @route   DELETE /api/workshops/:id
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findOneAndDelete({ id: req.params.id });
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    res.json({ success: true, message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
