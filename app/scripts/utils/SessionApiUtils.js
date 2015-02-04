var SessionActionCreators = require('../actions/SessionActionCreators');

// TODO: Should use HTTPS?
var baseUrl = 'http://localhost:5000';

function tryAuthenticate(user, options) {

  var options = options || {};

  // Assume now we authenticate everyone
  var authSuccess = true;

  $.get(baseUrl + '/user/' + user._id + '/profile')
  .done(function(data){
    options.success(data);
  })
  .fail(function(err) {
    options.error(null);
  });
}

module.exports = {

  authenticateUser: function(user) {

      tryAuthenticate(user, {
        success: function(user) {
          SessionActionCreators.createSession(user);
        },
        error: function(err) {
          console.log(err);
        }
      })
  }
}
