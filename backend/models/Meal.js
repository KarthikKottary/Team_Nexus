const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Lunch", "Dinner"
  startTime: { type: Date, required: true },
  batchIntervalMinutes: { type: Number, default: 15 },
  batches: [{
    batchNumber: Number,
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    notified: { type: Boolean, default: false },
    scheduledTime: Date
  }],
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Meal', MealSchema);
