var User = require('../models/user');
var Point = require('../models/point');
var UserPoint = require('../models/userPoint');
var UserVote = require('../models/userVote');


/**
 * Dynamically build query in a helper function
 */
function userPointQueryHelper(gtDate, obj, dateField) {
  return new Promise(function(resolve, reject) {
    var whereClause = {};

    if (gtDate) {
      whereClause[obj+'.'+dateField] = {};
      whereClause[obj+'.'+dateField].$gt = gtDate;
    }
    UserPoint.find({})
    .where(whereClause)
    .populate({path: 'user'})
    .select('id updatedAt createdAt user ' + obj)
    .exec((err, userPoints) => {
      if (err) {
        return reject(err);
      }
      resolve(userPoints);
    });

  });
}

function getGtDate(numDays) {
  var gtDate;
  if (numDays !== undefined && numDays > 0) {
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);

    gtDate = new Date(today);
    gtDate.setDate(today.getDate()-numDays);
  }
  return gtDate;
}

module.exports.getDongsWithinRange = function(numDays) {
    return new Promise(function(resolve, reject) {
      userPointQueryHelper(getGtDate(numDays), 'dongs', 'added')
      .then(function(data) {
        resolve(data);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

module.exports.getRockstarsWithinRange = function(numDays) {
    return new Promise(function(resolve, reject) {
      userPointQueryHelper(getGtDate(numDays), 'rockstars', 'added')
      .then(function(data) {
        resolve(data);
      })
      .catch(function(err){
        reject(err);
      });
  });
};