var rest = require('restler');
var config = require('./../config/config');
var authenticated = require('./authenticated');

function getUserProfile(userId, cbk, errCbk) {

  // Base API
  var baseUrl = config.baseApiUrl;

  // Call the service
  rest.get(baseUrl + '/users/' + userId)
  .on('success', function(data, response) {
    cbk(data.message);

  })
  .on('error', function(err, response) {
    console.error("Fail", err, response);
    errCbk({code: response.code});
  });
}

module.exports.getUserProfile = getUserProfile;

module.exports.routeHandler = function(app, bleSocket) {

  /**
  * Pass user profile to the client-side
  */
  app.get('/users/:userId/profile', function(req, res) {

    var userId = req.params.userId;

    getUserProfile(userId, function(data) {
        res.json(data);
    }, function(err) {
      res.json(err.code, err.message);
    });

  });

  /**
  * Send the buzz to the ble socket, wait for user confirmation
  */
  app.get('/users/:userId/buzz', function(req, res) {

    // Write data to the socket
    bleSocket.sendMessage({
      request: 'buzz',
      data: req.params.userId,
      sid: req.sessionID
    });

    res.sendStatus(200);
  });

  /**
  * Client logs out, destroy the session
  */
  app.delete('/session', authenticated, function(req, res) {

    // Write data to the socket
    req.session.user = null;
    res.sendStatus(200);
  });
};
