var WindowConstants = require('../constants/WindowConstants');
var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');

var PayloadSources = WindowConstants.PayloadSources;

var WindowDispatcher = assign(new Dispatcher(), {

  /**
  * @param {object} action The details of the action
  */
  handleServerAction: function(action) {

  },

  handleViewAction: function(action) {
    var payload = {
      source: PayloadSources.VIEW_ACTION,
      action: action
    };

    this.dispatch(payload);
  }

});

module.exports = WindowDispatcher;
