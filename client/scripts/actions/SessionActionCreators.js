var SessionConstants = require('../constants/SessionConstants');
var SessionDispatcher = require('../dispatchers/SessionDispatcher');

var ActionTypes = SessionConstants.ActionTypes;

module.exports = {

  createSession: function(user) {
    SessionDispatcher.handleViewAction({
      type: ActionTypes.CREATE_SESSION,
      user: user
    });
  },

  destoySession: function () {
    SessionDispatcher.handleViewAction({
      type: ActionTypes.DESTROY_SESSION
    });
  }
};
