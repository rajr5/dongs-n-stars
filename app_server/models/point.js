var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true
};

var pointSchema = new mongoose.Schema({
  type: String,
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  added: { type: Date, default: Date.now},
  deleted: Date,
  userVote: { type: mongoose.Schema.Types.ObjectId, ref: 'UserVote' },
  message: String,
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false},
}, schemaOptions);

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
