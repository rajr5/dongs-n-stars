var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true
};

var userVoteSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  type: String,
  dong: { type: Number, default : 0 },
  rockstar: { type: Number, default : 0 },
  voteDate: { type: Date, default: Date.now },
  message: { type: String },
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 },
}, schemaOptions);

var UserVote = mongoose.model('UserVote', userVoteSchema);

module.exports = UserVote;
