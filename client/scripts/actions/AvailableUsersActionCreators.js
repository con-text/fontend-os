var AppDispatcher           = require('../dispatchers/AppDispatcher');
var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var ActionTypes = AvailableUsersConstants.ActionTypes;
var _ = require('lodash');

module.exports = {

  updateUsers: function(users) {

    var availableUsers = _.filter(users, function(user) {
      return _.isUndefined(user) === false;
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.USERS_UPDATED,
      users: availableUsers
    });
  }
};
