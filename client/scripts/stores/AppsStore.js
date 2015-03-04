// Dependencies
var EventEmitter  = require('events').EventEmitter;
var assign        = require('object-assign');
var React         = require('react');
var querystring   = require('querystring');

// Application dispatcher
var AppDispatcher = require('../dispatchers/AppDispatcher');

// Constants
var AppsConstants = require('../constants/AppsConstants');
var ActionTypes = AppsConstants.ActionTypes;

// Stores
var DesktopStore = require('./DesktopStore');
var SessionStore = require('../stores/SessionStore');

// Utils
var AppsApiUtils = require('../utils/AppsApiUtils');

// Event types
var CHANGE_EVENT = 'change';

var AppsStore = assign({}, EventEmitter.prototype, {

  init: function() {
    this._apps = [];
    this.fetchAll();
    this.openedApp = null;
  },

  getOpened: function() {
    return this.openedApp;
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

  open: function (id, params) {

    // Create a window from a DOM element
    var app = AppsStore.getApp(id);

    var uuid = SessionStore.getCurrentUser().uuid;

    var objectId = "54ee2009e4b0e85464a3e7e3";

    // Create react component from class
    var url = 'http://localhost:3001/app/'+ uuid +'/' + app.id + '/' + objectId;

    if(params) {
      url += '?' + querystring.stringify(params);
    }

    this.openedApp = React.createElement('iframe', {src: url, className: "app-window"});
    this.emitChange();
  },

  close: function() {
    this.openedApp = null;
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
    case ActionTypes.LAUNCH_APP:
      AppsStore.open(action.appId, action.params, action.store);
      AppsStore.emitChange();

      // Close search box if opened
      DesktopStore.closeSearch();

      break;
    case ActionTypes.CLOSE_APPS:
      AppsStore.close();
      AppsStore.emitChange();
      break;
    default:
      // No operation
  }
});

module.exports = AppsStore;
