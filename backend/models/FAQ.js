const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  keywords: [{ type: String }],
  category: { type: String, default: 'General' }
});

module.exports = mongoose.model('FAQ', FAQSchema);
