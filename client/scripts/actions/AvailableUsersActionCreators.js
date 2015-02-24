var AppDispatcher           = require('../dispatchers/AppDispatcher');
var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var ActionTypes = AvailableUsersConstants.ActionTypes;


module.exports = {

  updateUsers: function(users) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.USERS_UPDATED,
      users: users
    });
  }
};
