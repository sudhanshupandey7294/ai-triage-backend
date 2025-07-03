// backend/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  symptoms: [String],
  vitals: {
    heartRate: Number,
    temperature: Number,
    bp: String
  },
  urgencyScore: {
    level: String,
    scoreBreakdown: Object
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
