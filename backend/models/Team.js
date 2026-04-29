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
    college_name: {
      type: String,
      required: [true, 'College name is required'],
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
      enum: ['pending', 'active'],
      default: 'pending',
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
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    scores: {
      innovation: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      impact: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    scoreHistory: [{
      total: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    completedCheckpoints: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checkpoint'
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', TeamSchema);
