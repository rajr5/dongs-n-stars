var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true
};

var pointSchema = new mongoose.Schema({
  type: String,
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  added: { type: Date, default: Date.now},
  deleted: Date,
  message: String,
  isDeleted: { type: Boolean, default: false},
}, schemaOptions);

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
