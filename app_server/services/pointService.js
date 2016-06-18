var User = require('../models/user');
var Point = require('../models/point');
var UserPoint = require('../models/userPoint');
var UserVote = require('../models/userVote');

module.exports.test = function(userVoteId) {
    UserPoint.find({$or: [{'dongs.userVote': userVoteId}, {'rockstars.userVote': userVoteId}]}, (err, userPoint) => {

    });
}

/**
 * Helpre to add a vote to a message.  isUpVote=true for an upvote, or false for a downvote
 */
module.exports.messageVoteHelper = function(userVoteId, isUpVote) {
  return new Promise((resolve, reject) => {
    
    UserVote.findById(userVoteId, (err, userVote) => {
      if(!userVote) {
          reject({msg: 'Uservote not found with provided id'});
      } else {
        if (isUpVote) {
            userVote.upvote = (userVote.upvote || 0) + 1;
        } else {
            userVote.downvote = (userVote.downvote || 0) + 1;
        }
        userVote.save((err) => {
            if (err) {
                return reject({msg: 'Could not save +1 to message'});
            }
            // Attempt to find the userPoint with the mssasge id and save upvote there
            UserPoint.find({$or: [{'dongs.userVote': userVoteId}, {'rockstars.userVote': userVoteId}]}, (err, userPoints) => {
            if (userPoints && userPoints.length > 0) {
                var userPoint = userPoints[0];
                var type = userVote.type + 's';
                // If user point exists, update the point with the upvote or downvote
                if (userPoint[type] && userPoint[type].length > 0) {
                if (isUpVote) {
                    userPoint[type][0].upvote = userVote.upvote;
                } else {
                    userPoint[type][0].downvote = userVote.downvote;
                }
                userPoint.save((err) => {
                    if (err) {
                    reject({msg: 'Could not save +1 to users points'});
                    }
                    resolve(userVote);
                });
                }
            } else {
                resolve(userVote);
            }
            });

        });
      }
      
    }); // end user vote

  }); // end promise
}