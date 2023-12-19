const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlHealthSchema = new Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'urlEntrySchema'
  },
  statusCode: {
    type: Number,
  },
  statusText: {
    type: String,
  },
  responseTime: {
    type: Number,
  }
}, {
  timestamps: true,
}); 

const UrlHealth = mongoose.model('urlHealth', urlHealthSchema);
module.exports = UrlHealth;