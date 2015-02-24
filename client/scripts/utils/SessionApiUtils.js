var SessionActionCreators = require('./../actions/SessionActionCreators');

// TODO: Should use HTTPS?
var baseUrl = 'http://localhost:5000';

function tryAuthenticate(user, options) {

  options = options || {};

  // Assume now we authenticate everyone
  var authSuccess = true;

  $.get(baseUrl + '/user/' + user.uuid + '/profile')
  .done(function(data){

    if(options.success) {
      options.success(data);
    }

  })
  .fail(function(err) {

    console.error("Failed to authenticate user");

    if(options.error) {
      options.error(err);
    }
  });
}

function sendToBuzzer(user) {

  $.get(baseUrl + '/user/' + user.uuid + '/buzz')
    .done(function(data) {
      
    });
}

module.exports = {

  authenticateUser: function(user, options) {
    tryAuthenticate(user, options);
  },

  sendToWearble: function(user) {
    sendToBuzzer(user);
  }
};
