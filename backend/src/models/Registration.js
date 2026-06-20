import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  workshopId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { _id: false });

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true
  },
  ieeeMember: {
    type: Boolean,
    default: false
  },
  ieeeMemberId: {
    type: String,
    default: '',
    trim: true
  },
  ieeeDomain: {
    type: String,
    default: '',
    trim: true
  },
  registrationType: {
    type: String,
    enum: ['full', 'custom'],
    required: true
  },
  selectedWorkshops: [{
    type: String // IDs of workshops selected
  }],
  paymentScreenshot: {
    type: String, // local path, base64, or Google Drive link
    default: ''
  },
  transactionId: {
    type: String,
    default: '',
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  paidAmount: {
    type: Number,
    required: true
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: String,
    default: ''
  },
  attendance: [{
    type: String // Array of workshop IDs attended
  }],
  feedback: [feedbackSchema]
}, {
  timestamps: true
});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
