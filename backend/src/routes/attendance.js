import express from 'express';
import crypto from 'crypto';
import AttendanceSession from '../models/AttendanceSession.js';
import Registration from '../models/Registration.js';
import Workshop from '../models/Workshop.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper: Generate a secure random token for QR URLs
const generateSecureToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

// @desc    Admin activates attendance for a workshop
// @route   POST /api/attendance/activate
// @access  Private (Admin)
router.post('/activate', protectAdmin, async (req, res) => {
  try {
    const { workshopId, attendanceId, durationMinutes } = req.body;

    if (!workshopId || !attendanceId || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'Please provide workshopId, attendanceId, and duration' });
    }

    const secureToken = generateSecureToken();
    const windowStart = new Date();
    const windowEnd = new Date(windowStart.getTime() + durationMinutes * 60 * 1000);

    // Find and update or create session
    let session = await AttendanceSession.findOne({ workshopId });
    if (session) {
      session.active = true;
      session.attendanceId = attendanceId.trim();
      session.secureToken = secureToken;
      session.windowStart = windowStart;
      session.windowEnd = windowEnd;
      await session.save();
    } else {
      session = new AttendanceSession({
        workshopId,
        active: true,
        attendanceId: attendanceId.trim(),
        secureToken,
        windowStart,
        windowEnd
      });
      await session.save();
    }

    res.json({
      success: true,
      message: `Attendance activated for ${workshopId}`,
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Admin deactivates attendance for a workshop
// @route   POST /api/attendance/deactivate
// @access  Private (Admin)
router.post('/deactivate', protectAdmin, async (req, res) => {
  try {
    const { workshopId } = req.body;
    if (!workshopId) {
      return res.status(400).json({ success: false, message: 'Please provide workshopId' });
    }

    const session = await AttendanceSession.findOne({ workshopId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found' });
    }

    session.active = false;
    await session.save();

    res.json({ success: true, message: 'Attendance session closed', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get active attendance session details (for dynamic QR display)
// @route   GET /api/attendance/session/:workshopId
// @access  Public
router.get('/session/:workshopId', async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({ workshopId: req.params.workshopId });
    if (!session || !session.active) {
      return res.status(404).json({ success: false, message: 'No active attendance session found' });
    }

    // Check if window has expired
    const now = new Date();
    if (session.windowEnd && now > session.windowEnd) {
      session.active = false;
      await session.save();
      return res.status(404).json({ success: false, message: 'Attendance window has expired' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark attendance for a student
// @route   POST /api/attendance/mark
// @access  Public
router.post('/mark', async (req, res) => {
  try {
    const { studentKey, attendanceId, workshopId, qrToken } = req.body;

    if (!studentKey || !attendanceId || !workshopId) {
      return res.status(400).json({ success: false, message: 'Please fill in all details' });
    }

    // 1. Get Attendance Session
    const session = await AttendanceSession.findOne({ workshopId });
    if (!session || !session.active) {
      return res.status(400).json({ success: false, message: 'Attendance window is not active for this workshop' });
    }

    // 2. Validate Time Window
    const now = new Date();
    if (session.windowEnd && now > session.windowEnd) {
      session.active = false;
      await session.save();
      return res.status(400).json({ success: false, message: 'Attendance window has expired' });
    }

    // 3. Validate Attendance ID Code
    if (session.attendanceId.toUpperCase() !== attendanceId.trim().toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Invalid Attendance Passcode' });
    }

    // 4. Validate Secure QR Token (if provided/rotating)
    if (qrToken && session.secureToken !== qrToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR code session' });
    }

    // 5. Check if Student is Registered
    const key = studentKey.trim().toLowerCase();
    const student = await Registration.findOne({
      $or: [
        { email: key },
        { registrationId: studentKey.trim().toUpperCase() }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student registration not found' });
    }

    if (student.paymentStatus !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Registration payment verification is pending or rejected' });
    }

    // 6. Check if student is registered for this specific workshop
    if (!student.selectedWorkshops.includes(workshopId)) {
      return res.status(400).json({ success: false, message: 'You are not registered for this workshop' });
    }

    // 7. Check if Attendance already marked
    if (student.attendance.includes(workshopId)) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this workshop' });
    }

    // 8. Mark Attendance
    student.attendance.push(workshopId);
    await student.save();

    res.json({
      success: true,
      message: 'Attendance marked successfully!',
      data: {
        fullName: student.fullName,
        registrationId: student.registrationId,
        workshopId
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get attendance analytics for each workshop
// @route   GET /api/attendance/analytics
// @access  Private (Admin)
router.get('/analytics', protectAdmin, async (req, res) => {
  try {
    const workshops = await Workshop.find({});
    const result = [];

    for (const wk of workshops) {
      // Students registered for this workshop (Approved payments)
      const registeredCount = await Registration.countDocuments({
        selectedWorkshops: wk.id,
        paymentStatus: 'Approved'
      });

      // Students present
      const presentCount = await Registration.countDocuments({
        attendance: wk.id,
        paymentStatus: 'Approved'
      });

      const absentCount = Math.max(0, registeredCount - presentCount);
      const percentage = registeredCount > 0 ? ((presentCount / registeredCount) * 100).toFixed(1) : '0.0';

      result.push({
        workshopId: wk.id,
        title: wk.title,
        mentor: wk.mentor,
        dateTime: wk.dateTime,
        registeredCount,
        presentCount,
        absentCount,
        attendancePercentage: parseFloat(percentage)
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
