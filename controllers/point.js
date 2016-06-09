var User = require('../models/user');
var Point = require('../models/point');
var UserPoint = require('../models/userPoint');

/**
 * 200 - OK success GET
 * 201 - created success POST
 * 203 - created success PUT
 * 204 - no content success DELETE
 * 400 bad request
 * 401 unathorized
 * 403 forbidden
 * 404 not found
 * 405 method not allowed
 */

var sendJson = function(res, status, content) {
      content = content || {};
      res.status(status);
      res.json(content);
};

/**
 * GET /userPoints
 */
exports.getUsersPoints = function(req, res) {
  UserPoint.find({})
  .populate({path: 'user dongs rockstars', populate: {path: 'fromUser'}})
  .exec((err, userPoints) => {
    if (err) {
      sendJson(res, 404);
    } else {
      deleteUserFields(userPoints);
      sendJson(res, 200, {userPoints: userPoints});
    }
  });
};

/**
 * GET /userPoints/:id
 */
exports.getUserPoints = function(req, res) {
  var id = req.param.id;
  UserPoint.findById(id)
  .populate('user')
  .exec((err, userPoints) => {
    if (err) {
      sendJson(res, 404);
    } else {
      deleteUserFields(userPoints);
      sendJson(res, 200, {userPoints: userPoints});
    }
  });
};


/**
 * POST /point
 */
exports.createUserPoint = function(req, res) {
  req.assert('pointType', 'Point type is not valid.  Valid types are dong and rockstar').notEmpty().isIn(['dong', 'rockstar']);
  req.assert('toUser', 'User is not valid').notEmpty();

  var error = req.validationErrors();

  if (error) {
    sendJson(res, 400, {message: 'Invalid input', error});
  } else {
    var fromUserId = req.user._id;
    var pointType = req.query.pointType || req.body.pointType;
    var toUserId = req.query.toUser || req.body.toUser;
    var message = req.query.message || req.body.message || null;

    // var point = {
    //   fromUser: fromUserId,
    //   message: message
    // };

    UserPoint.findOne({user: toUserId}, (err, userPoint) => {
      if (err) {
        sendJson(res, 400, {message: 'Could not lookup existing userpoint', error: err});
      } else {
        if (!userPoint) {
          userPoint = new UserPoint({
            user: toUserId
          });
        }
        var pluralPointType = pointType + 's';
        // Push point (either rockstar or dong) to userPoint
        userPoint[pluralPointType].push({
            type: pointType,
            fromUser: fromUserId,
            message: message
          });
        console.log('userpoint', userPoint);
        userPoint.save((err)=>{
          if (err) {
            sendJson(res, 400, {message: 'Could not save userpoint', error: err});
          } else {
            sendJson(res, 200, {userPoints: userPoint});
          }
        });
      }
    });
  }
};


function deleteUserFields(userPoints) {
  userPoints.map((up) => {
    delete up.user.password;
    delete up.user.createdAt;
    delete up.user.updatedAt;
  }, this);
}
