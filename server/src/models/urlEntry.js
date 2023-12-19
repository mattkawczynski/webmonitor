const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlEntrySchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  lastNotificationDate: {
    type: Date,
    default: Date.now,
  },
  latestResponseTime: {
    type: Number,
  },
  urlHealth: {
    type: String,
  },
  hitCount: {
    type: Number,
    default: 0
  },
  incidentCount: {
    type: Number,
    default: 0
  },
  sendNotification: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
}); 

const UrlEntry = mongoose.model('urlEntry', urlEntrySchema);
module.exports = UrlEntry;
