var User = require('../models/user');
var Point = require('../models/point');
var UserPoint = require('../models/userPoint');
var UserVote = require('../models/userVote');

module.exports.test = function(userVoteId) {
    UserPoint.find({$or: [{'dongs.userVote': userVoteId}, {'rockstars.userVote': userVoteId}]}, (err, userPoint) => {

    });
}

function includes(arr, id) {
    return arr.some(function(elem) {
        return elem.equals(id);
    });
}

/**
 * Helpre to add a vote to a message.  isUpVote=true for an upvote, or false for a downvote
 */
module.exports.messageVoteHelper = function(userVoteId, isUpVote, votingUserId) {
  return new Promise((resolve, reject) => {
    if (userVoteId === votingUserId) {
        return reject({msg: 'You cannot vote on your own message'});
    }
    UserVote.findById(userVoteId, (err, userVote) => {
      if(!userVote) {
          return reject({msg: 'Uservote not found with provided id'});
      // Check if this user has already voted with thie vote type
      } if((isUpVote && includes(userVote.upvoteUsers, votingUserId)) ||
          (!isUpVote && includes(userVote.downvoteUsers, votingUserId))) {
        return reject({msg: 'Only one +1 and -1 allowed per message'});
      } else {
        if (isUpVote) {
            userVote.upvote = (userVote.upvote || 0) + 1;
            userVote.upvoteUsers.push(votingUserId);
        } else {
            userVote.downvote = (userVote.downvote || 0) + 1;
            userVote.downvoteUsers.push(votingUserId);
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
                    userPoint[type][0].upvoteUsers.push(votingUserId);
                } else {
                    userPoint[type][0].downvote = userVote.downvote;
                    userPoint[type][0].downvoteUsers.push(votingUserId);
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