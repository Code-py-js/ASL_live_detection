const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  inputText: { 
    type: String, 
    default: '',
    validate: {
      validator: (v) => v !== null,
      message: 'Input text cannot be null'
    }
  },
  outputText: { 
    type: String, 
    default: '',
    validate: {
      validator: (v) => v !== null,
      message: 'Output text cannot be null'
    }
  },
  confidence: { 
    type: Number, 
    default: 0,
    min: [0, 'Confidence cannot be less than 0'],
    max: [1, 'Confidence cannot be greater than 1'],
    validate: {
      validator: (v) => v >= 0 && v <= 1,
      message: 'Confidence must be between 0 and 1'
    }
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Translation', TranslationSchema);
