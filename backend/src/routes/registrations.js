import express from 'express';
import Registration from '../models/Registration.js';
import SystemSettings from '../models/SystemSettings.js';
import Workshop from '../models/Workshop.js';
import { protectAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper: Generate Unique Registration ID (e.g., EV26-4839)
const generateRegistrationId = async () => {
  let id = '';
  let exists = true;
  while (exists) {
    const num = Math.floor(1000 + Math.random() * 9000);
    id = `EV26-${num}`;
    const check = await Registration.findOne({ registrationId: id });
    if (!check) exists = false;
  }
  return id;
};

// Helper: Generate Unique Referral Code (e.g., REF-PART293)
const generateReferralCode = async (name) => {
  const cleanName = name.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase();
  let code = '';
  let exists = true;
  while (exists) {
    const num = Math.floor(100 + Math.random() * 900);
    code = `REF-${cleanName}${num}`;
    const check = await Registration.findOne({ referralCode: code });
    if (!check) exists = false;
  }
  return code;
};

// @desc    Register a new student for workshops
// @route   POST /api/registrations
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      college,
      department,
      year,
      ieeeMember,
      ieeeMemberId,
      ieeeDomain,
      registrationType,
      selectedWorkshops, // Comma separated or stringified array
      transactionId,
      referredBy
    } = req.body;

    // Basic Validations
    if (!fullName || !email || !phone || !college || !department || !year || !registrationType) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const isIeeeSbMember = ieeeMember === 'true' || ieeeMember === true;

    // IEEE SB Member specific validations
    if (isIeeeSbMember) {
      if (!ieeeMemberId || !ieeeDomain) {
        return res.status(400).json({ success: false, message: 'SKN IEEE SB Members must provide Membership ID and Domain' });
      }
    } else {
      // General user validations
      if (!transactionId) {
        return res.status(400).json({ success: false, message: 'Transaction ID is required for paid registrations' });
      }
    }

    // Check for Duplicate Email
    const emailExists = await Registration.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Check for Duplicate Transaction (Only if paid)
    if (!isIeeeSbMember && transactionId) {
      const txExists = await Registration.findOne({ transactionId: transactionId.trim() });
      if (txExists) {
        return res.status(400).json({ success: false, message: 'Transaction ID already used' });
      }
    }

    // Generate unique IDs
    const registrationId = await generateRegistrationId();
    const referralCode = await generateReferralCode(fullName);

    // Calculate Price and Set Transaction details
    let finalPaidAmount = 0;
    let finalTransactionId = `IEEE-SB-${registrationId}`;
    let finalScreenshotUrl = '';

    const systemSettings = await SystemSettings.findOne() || { priceFull: 150, priceCustom: 40 };

    // Parse workshops list
    let workshopsArray = [];
    if (registrationType === 'full') {
      const allWk = await Workshop.find({});
      workshopsArray = allWk.map(w => w.id);
    } else {
      if (typeof selectedWorkshops === 'string') {
        workshopsArray = selectedWorkshops.split(',').map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(selectedWorkshops)) {
        workshopsArray = selectedWorkshops;
      }
    }

    if (workshopsArray.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one workshop' });
    }

    if (!isIeeeSbMember) {
      // General student - Dynamic Price calculation
      if (registrationType === 'full') {
        finalPaidAmount = systemSettings.priceFull;
      } else {
        finalPaidAmount = workshopsArray.length * systemSettings.priceCustom;
      }
      finalTransactionId = transactionId.trim();
    } else {
      // SKN IEEE SB member is free
      finalPaidAmount = 0;
    }

    const registration = new Registration({
      registrationId,
      fullName,
      email: email.toLowerCase(),
      phone,
      college,
      department,
      year,
      ieeeMember: isIeeeSbMember,
      ieeeMemberId: isIeeeSbMember ? ieeeMemberId.trim() : '',
      ieeeDomain: isIeeeSbMember ? ieeeDomain.trim() : '',
      registrationType,
      selectedWorkshops: workshopsArray,
      paymentScreenshot: finalScreenshotUrl,
      transactionId: finalTransactionId,
      paidAmount: finalPaidAmount,
      referralCode,
      referredBy: referredBy || '',
      paymentStatus: 'Pending'
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Pending verification.',
      data: {
        registrationId,
        fullName,
        email,
        referralCode
      }
    });

  } catch (error) {
    console.error('Registration submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Student login using Email or Registration ID
// @route   POST /api/registrations/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { loginKey } = req.body;

    if (!loginKey) {
      return res.status(400).json({ success: false, message: 'Please enter Email or Registration ID' });
    }

    const key = loginKey.trim().toLowerCase();

    const registration = await Registration.findOne({
      $or: [
        { email: key },
        { registrationId: loginKey.trim().toUpperCase() }
      ]
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'No registration details found matching input' });
    }

    const token = jwt.sign(
      { registrationId: registration.registrationId, email: registration.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      data: registration
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in student registration details
// @route   GET /api/registrations/me
// @access  Private (Student Token)
router.get('/me', async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const registration = await Registration.findOne({ registrationId: decoded.registrationId });
      if (registration) {
        return res.json({ success: true, data: registration });
      }
    }
    return res.status(401).json({ success: false, message: 'Unauthorized student session' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired/invalid' });
  }
});

// ================= ADMIN ROUTE ENDPOINTS =================

// @desc    Get all registrations
// @route   GET /api/registrations
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { search, workshop, status, regType } = req.query;
    const query = {};

    if (status) query.paymentStatus = status;
    if (regType) query.registrationType = regType;
    if (workshop) query.selectedWorkshops = workshop;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { ieeeMemberId: { $regex: search, $options: 'i' } }
      ];
    }

    const registrations = await Registration.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Approve or Reject registration payment / membership status
// @route   PUT /api/registrations/:id/verify
// @access  Private (Admin)
router.put('/:id/verify', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    registration.paymentStatus = status;
    await registration.save();

    res.json({ success: true, message: `Registration status updated to ${status}`, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Edit a student registration record
// @route   PUT /api/registrations/:id
// @access  Private (Admin)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const { 
      fullName, email, phone, college, department, year, 
      selectedWorkshops, paidAmount, transactionId,
      ieeeMember, ieeeMemberId, ieeeDomain, feedback
    } = req.body;

    if (fullName !== undefined) registration.fullName = fullName;
    if (email !== undefined) registration.email = email.toLowerCase();
    if (phone !== undefined) registration.phone = phone;
    if (college !== undefined) registration.college = college;
    if (department !== undefined) registration.department = department;
    if (year !== undefined) registration.year = year;
    if (paidAmount !== undefined) registration.paidAmount = paidAmount;
    if (transactionId !== undefined) registration.transactionId = transactionId;
    if (selectedWorkshops !== undefined) registration.selectedWorkshops = selectedWorkshops;
    
    // IEEE branch specific options
    if (ieeeMember !== undefined) registration.ieeeMember = ieeeMember;
    if (ieeeMemberId !== undefined) registration.ieeeMemberId = ieeeMemberId;
    if (ieeeDomain !== undefined) registration.ieeeDomain = ieeeDomain;
    
    // Student Feedback reviews
    if (feedback !== undefined) registration.feedback = feedback;

    await registration.save();
    res.json({ success: true, message: 'Registration updated successfully', data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a registration record
// @route   DELETE /api/registrations/:id
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Bulk approve selected registrations
// @route   POST /api/registrations/bulk-approve
// @access  Private (Admin)
router.post('/bulk-approve', protectAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Invalid list of IDs' });
    }

    await Registration.updateMany(
      { _id: { $in: ids }, paymentStatus: { $ne: 'Approved' } },
      { $set: { paymentStatus: 'Approved' } }
    );

    res.json({ success: true, message: 'Bulk approval complete' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
