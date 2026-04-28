const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Medical', 'Technical', 'Security', 'Fire', 'Other'],
      required: [true, 'Alert type is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // The team that triggered it
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    // The user who triggered it
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: compute time-ago string
AlertSchema.virtual('timeAgo').get(function () {
  const diffMs = Date.now() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  return `${diffHrs}h ago`;
});

AlertSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Alert', AlertSchema);
