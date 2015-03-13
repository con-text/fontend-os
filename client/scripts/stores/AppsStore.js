// Dependencies
var EventEmitter  = require('events').EventEmitter;
var assign        = require('object-assign');
var React         = require('react');
var querystring   = require('querystring');
var _             = require('lodash');

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
    this.openedApps = [];
  },

  getOpened: function() {
    return this.openedApps;
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

    // Try close app with that id first
    this.close(id);

    // Create a window from a DOM element
    var app = AppsStore.getApp(id);

    var uuid = SessionStore.getCurrentUser().uuid;

    params = params || {};
    // What is my current state?

    var stateId = params.objectId;
    var url;

    // TODO: Move some of that code to AppsApiUtils
    if(!stateId) {
      // Ask app server for new state

      url = 'http://localhost:3001/users/'+ uuid +'/apps/' + app.id + '/states';

      // Create new state or use default if available
      if(params.useDefault) {
        url += '/default';
      }

      $.ajax({
        url: url,
        success: function(data) {

          stateId = data.stateId;
          app.stateId = stateId;
          // Create react component from class
          url = 'http://localhost:3001/app/'+ uuid +'/' + app.id + '/states/' + stateId;

          if(params.args) {
            url += '?' + querystring.stringify(params.args);
          }

          this.openedApps.push(app);
          this.openedApps[this.openedApps.length-1].element = React.createElement('iframe', {src: url, className: "app-window"});
          this.emitChange();
          return;
        }.bind(this),
        type: params.useDefault ? 'GET' : 'POST'
      });

    } else {

      app.stateId = stateId;
      // Create react component from class
      url = 'http://localhost:3001/app/'+ uuid +'/' + app.id + '/states/' + stateId;

      if(params.args) {
        url += '?' + querystring.stringify(params.args);
      }

      this.openedApps.push(app);
      this.openedApps[this.openedApps.length-1].element = React.createElement('iframe', {src: url, className: "app-window"});
      this.emitChange();
    }
  },

  close: function(appId) {
    _.remove(this.openedApps, function(openedApp) {
      return openedApp.id === appId;
    });
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
      AppsStore.open(action.app.id, action.params, action.store);
      AppsStore.emitChange();

      // Close search box if opened
      DesktopStore.closeSearch();

      break;
    case ActionTypes.CLOSE_APPS:
      AppsStore.close(action.app.id);
      AppsStore.emitChange();
      break;
    default:
      // No operation
  }
});

module.exports = AppsStore;
