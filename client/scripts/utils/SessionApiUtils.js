var keyMirror = require('keymirror');

// TODO: Should use HTTPS?
var baseUrl = 'http://localhost:5000';


var RequestType = keyMirror({
  User: null,
  File: null
});

function tryAuthenticate(user, options) {

  options = options || {};

  // Assume now we authenticate everyone
  $.get(baseUrl + '/users/' + user.uuid + '/profile')
  .done(function(data){

    if(options.success) {
      options.success(data);
    }

  })
  .fail(function(err) {

    console.error('Failed to authenticate user');

    if(options.error) {
      options.error(err);
    }
  });
}


function sendToBuzzer(user, requestType) {

  if(!user || !user.uuid) {
    throw 'User ID not defined';
  }

  // Are we authenticating or requesting files?
  var requestCode = 0;

  if(requestType === RequestType.File) {
    requestCode = 1;
  }

  $.ajax({
    url: baseUrl + '/users/' + user.uuid + '/buzz',
    data: {code: requestCode},
    type: 'GET',
    success: function() {
      console.log('SessionApiUtils: Buzz sent to the wearbale');
    }
  });
}

module.exports = {

  authenticateUser: function(user, options) {
    tryAuthenticate(user, options);
  },

  sendToWearble: function(user, requestType) {

    // Default message to wearble is user auth
    requestType = requestType || RequestType.User;
    sendToBuzzer(user, requestType);
  },

  destroySession: function(callback) {
    $.ajax({
      url: baseUrl + '/session/',
      type: 'DELETE',
      success: callback
    });
  },

  getProfile: function(userId) {
    return $.getJSON(baseUrl + '/users/' + userId + '/profile');
  },

  RequestType: RequestType
};
