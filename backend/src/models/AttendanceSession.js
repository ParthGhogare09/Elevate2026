import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  workshopId: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: false
  },
  attendanceId: {
    type: String,
    required: true
  },
  secureToken: {
    type: String,
    required: true
  },
  windowStart: {
    type: Date
  },
  windowEnd: {
    type: Date
  }
}, {
  timestamps: true
});

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
export default AttendanceSession;
