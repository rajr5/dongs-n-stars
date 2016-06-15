var mongoose = require('mongoose');
var Point = require('./point').schema;

var schemaOptions = {
  timestamps: true
};

var userPointSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  dongs: [Point],
  rockstars: [Point],
}, schemaOptions);

var UserPoint = mongoose.model('UserPoint', userPointSchema);

module.exports = UserPoint;


// var pointSchema = new mongoose.Schema({
//   type: String,
//   fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   added: { type: Date, default: Date.now},
//   deleted: Date,
//   message: String,
//   isDeleted: { type: Boolean, default: false},
// }, schemaOptions);