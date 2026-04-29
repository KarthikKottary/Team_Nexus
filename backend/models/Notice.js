const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    targetRole: {
      type: String,
      enum: ['all', 'admin', 'participant'],
      default: 'all',
    },
    phase: {
      type: String,
      enum: ['pre-event', 'hacking', 'submission', 'judging', 'post-event', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    active: {
      type: Boolean,
      default: true,
    },
    targetTeams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', NoticeSchema);
