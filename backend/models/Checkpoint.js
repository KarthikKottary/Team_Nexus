const mongoose = require('mongoose');

const CheckpointSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  active: { type: Boolean, default: true },
  notifiedWarning: { type: Boolean, default: false },
  notifiedMissed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Checkpoint', CheckpointSchema);
