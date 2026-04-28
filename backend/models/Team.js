const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    author: { type: String, required: true },
    sha: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
    },
    repo: {
      type: String,
      trim: true,
      default: '',
    },
    joinCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    recentCommits: {
      type: [CommitSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'idle', 'inactive'],
      default: 'active',
    },
    lastCommitAt: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', TeamSchema);
