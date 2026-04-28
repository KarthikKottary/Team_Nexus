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

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: 'Member' }, // e.g. Lead, Frontend, Backend
    email: { type: String },
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
      required: [true, 'GitHub repo URL is required'],
      trim: true,
    },
    members: {
      type: [MemberSchema],
      default: [],
    },
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
    // Link to the team's registered user (participant account)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', TeamSchema);
