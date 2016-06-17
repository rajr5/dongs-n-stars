var statService = require('../services/stats.js');

MAX_VOTES = 5;

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
      return res.json(content);
};

/**
 * GET /stats
 */
exports.getStats = function(req, res) {
  var numDays = req.query.numDays || 7;
  // Get all dong/rockstar points given within the specfied number of days
  // This is to determine the top/bottom dong receivers within the date range
  var dongPromise = statService.getDongsWithinRange(numDays);
  var rockstarPromise = statService.getRockstarsWithinRange(numDays);

  Promise.all([dongPromise, rockstarPromise])
  .then(function(data) {
    var output = {numDays: numDays, dongs: data[0], rockstars: data[1]};
    sendJson(res, 200, output);
  })
  .catch(function(err){
    sendJson(res, 400, err);
  });
};
