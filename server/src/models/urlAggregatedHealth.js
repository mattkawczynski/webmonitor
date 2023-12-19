const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const urlAggregatedHealthSchema = new Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'urlEntrySchema'
  },
  avgResponseTime: {
    type: Number,
  },
  incidentCount: {
    type: Number,
    default: 0
  },
  successResponseCount: {
    type: Number,
    default: 0
  },
  dateHour: {
    type: Date,
  }
}, {
  timestamps: true,
}); 


const UrlAggregatedHealth = mongoose.model('urlAggregatedHealth', urlAggregatedHealthSchema);
module.exports = UrlAggregatedHealth;