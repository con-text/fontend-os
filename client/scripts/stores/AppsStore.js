// Dependencies
var EventEmitter  = require('events').EventEmitter;
var assign        = require('object-assign');
var React         = require('react');

// Application dispatcher
var AppDispatcher = require('../dispatchers/AppDispatcher');

// Constants
var AppsConstants = require('../constants/AppsConstants');
var ActionTypes = AppsConstants.ActionTypes;

// Utils
var AppsApiUtils = require('../utils/AppsApiUtils');

// Event types
var CHANGE_EVENT = 'change';

var AppsStore = assign({}, EventEmitter.prototype, {

  init: function() {
    this._apps = [];
    this.fetchAll();
  },

  getApps: function() {
    return this._apps;
  },

  getApp: function(appId) {
    if(appId in this._apps) {
      return this._apps[appId];
    } else {
      console.error("Unknown app id", appId);
      return null;
    }
  },

  fetchAll: function() {
      AppsApiUtils.getAll(function(data, err) {

        if(Object.keys(this._apps).length === 0) {
          data.forEach(function(app) {
            this._apps[app.id] = app;
          }, this);
        }

      }.bind(this));
  },

  createFromEl: function (id) {

    // Create a window from a DOM element
    var app = AppsStore.getApp(id);

    // Create react component from class
    var url = 'http://localhost:3001/app/tester/' + app.id;
    var component = React.createElement('iframe', {src: url, className: "app-window"});
    var renderedIframe = React.render(component, _windows[id].$content.get(0));
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

});

// Register with the dispatcher
AppDispatcher.register(function(payload) {

  var action = payload.action;
  var title;

  switch(action.type) {
    case ActionTypes.CREATE_WINDOW_FROM_ELEMENT:
      createFromEl(action.title, action.el);
      AppsStore.emitChange();
      break;
    case ActionTypes.DESTROY_WINDOW:
      AppsStore.emitChange();
      break;
    default:
      // No operation
  }
});

module.exports = AppsStore;
