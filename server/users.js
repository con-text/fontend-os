var rest = require('restler');
var config = require('./../config/config');
var authenticated = require('./authenticated');

function getUserProfile(userId, cbk, errCbk) {

  // Base API
  var baseUrl = config.baseApiUrl;
  // Call the service
  rest.get(baseUrl + '/users/' + userId)
  .on('success', function(data, response) {
    cbk(data);

  })
  .on('error', function(err, response) {

    console.error("Fail", err, response);

    var statusCode = response ? resposne.statusCode : 500;

    if(errCbk) {
      errCbk({
        code: statusCode,
        message: 'Failed to retreive user profile'
      });
    }

  });
}

module.exports.getUserProfile = getUserProfile;

module.exports.routeHandler = function(app, socketWithFrontend, bleSocket) {

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

    var code = req.query.code;

    console.log('Buzz code: ' + req.query.code, req.query);

    // Write data to the socket
    bleSocket.sendMessage({
      request: 'buzz',
      data: req.params.userId,
      code: code,
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

    socketWithFrontend.emit('loginStatus', {
      result: "logout",
      userId: null
    });

    res.sendStatus(200);
  });
};
