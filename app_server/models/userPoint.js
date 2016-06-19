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
