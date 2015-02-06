var rest = require('restler');
var config = require('./../config/config');

function getUserProfile(userId, callback) {

  // Base API
  var baseUrl = config.baseApiUrl;

  // Assume we get this id
  var id = "EA8F2A44";

  // Call the service
  rest.get(baseUrl + '/users/' + id).on('complete', function(data) {
    callback(data.message);
  });
}

module.exports.getUserProfile = getUserProfile;

module.exports.routeHandler = function(app) {
  app.get('/user/:userId/profile', function(req, res) {

    var userId = req.params.userId;

    getUserProfile(userId, function(data) {
        res.json(data);
    });

  });
};
