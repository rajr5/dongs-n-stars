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
    .select('id updatedAt createdAt user added ' + obj)
    .exec((err, userPoints) => {
      if (err) {
        return reject(err);
      }
      resolve(userPoints);
    });

  });
}

module.exports.getDongsWithinRange = function(numDays) {
    return new Promise(function(resolve, reject) {
      var filterDate = getGtDate(numDays);
      userPointQueryHelper(filterDate, 'dongs', 'added')
      .then(function(data) {
        var output = filterGtRecordsHelper(data, 'dongs', 'added', filterDate);
        console.log(output);
        resolve(output);
      })
      .catch(function(err){
        reject(err);
      });
  });
};

module.exports.getRockstarsWithinRange = function(numDays) {
    return new Promise(function(resolve, reject) {
      var filterDate = getGtDate(numDays);
      userPointQueryHelper(filterDate, 'rockstars', 'added')
      .then(function(data) {
        var output = filterGtRecordsHelper(data, 'rockstars', 'added', filterDate);
        resolve(output);
      })
      .catch(function(err){
        reject(err);
      });
  });
};


/////////////////// UTIL FUNCTIONS /////////////////////////////
function filterGtRecordsHelper(arr, outerProp, prop, filterDate) {
  if (!Array.isArray(arr) || arr.length === 0 || !filterDate) {
    return arr;
  } else {
    console.log(arr);
    arr.map((elem) => {
      elem[outerProp] = filterGtRecords(elem[outerProp], prop, filterDate);
    });
  }
  return arr;
}


function filterGtRecords(arr, prop, filterDate) {
  if (!Array.isArray(arr) || arr.length === 0 || !filterDate) {
    return arr;
  } else {
    return arr.filter((obj) => {
      if (removeTime(obj[prop]) > removeTime(filterDate)) {
        return true;
      } else {
        return false;
      }
    });
  }
}

function removeTime(d) {
  try {
    var newDate = new Date(d);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    return newDate;
  } catch (e) {
    return d;
  }
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