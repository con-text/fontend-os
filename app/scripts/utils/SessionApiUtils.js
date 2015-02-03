var SessionActionCreators = require('../actions/SessionActionCreators');

function tryAuthenticate(userData, options) {

  var options = options || {};

  // Assume now we authenticate everyone
  var authSuccess = true;

  if(options.success && authSuccess) {
    options.success(userData);
  } else if(options.error) {
    options.error(null);
  }
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
