import mongoose from 'mongoose';

const timelineMilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const TimelineMilestone = mongoose.model('TimelineMilestone', timelineMilestoneSchema);
export default TimelineMilestone;
