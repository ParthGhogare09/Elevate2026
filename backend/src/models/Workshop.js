import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'Recording', 'Notes', 'Other'], default: 'Other' }
});

const workshopSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mentor: {
    type: String,
    required: true
  },
  dateTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Completed'],
    default: 'Open'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  whatsappGroupLink: {
    type: String,
    default: ''
  },
  studyMaterialLink: {
    type: String,
    default: ''
  },
  resources: [resourceSchema]
}, {
  timestamps: true
});

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;
