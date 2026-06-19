const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: true,
  },
  temperature: Number,
  condition: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
