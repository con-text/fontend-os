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
var SessionActionTypes = require('../constants/SessionConstants').ActionTypes;
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
    return _.filter(this._apps, function(app) {
      return app.isOpened;
    });
  },

  getApps: function() {
    return this._apps;
  },

  getApp: function(appId) {
    return _.findWhere(this._apps, {id: appId});
  },

  fetchAll: function() {
      AppsApiUtils.getAll(function(data, err) {

        if(Object.keys(this._apps).length === 0) {
          data.forEach(function(app) {

            // Inital position
            this._apps.push(app);
          }, this);
        }

      }.bind(this));
  },

  open: function (id, params, userId) {

    // Try close app with that id first
    this.close(id);

    // Create a window from a DOM element
    var app = AppsStore.getApp(id);

    var uuid = userId || SessionStore.getCurrentUser().uuid;

    params = params || {};
    // What is my current state?
    params.state = params.state || {};

    var url;
    var appServer = 'http://localhost:3001';

    // TODO: Move some of that code to AppsApiUtils
    if(!params.state.id) {

      // Ask app server for new state
      url = appServer + '/users/'+ uuid +'/apps/' + app.id + '/states';

      // Create new state or use default if available
      if(params.useDefault) {
        url += '/default';
      }

      $.ajax({
        url: url,
        success: function(data) {

          app.state = data;
          app.state.id = data._id;

          // Create react component from class
          url = appServer + '/app/'+ uuid +'/' + app.id + '/states/' + app.state.id;

          if(params.args) {
            url += '?' + querystring.stringify(params.args);
          }

          app.isOpened = true;
          app.element = React.createElement('iframe', {src: url,
            className: 'app-window',
            scrolling: 'no',
            seamless: 'seamless'
          });

          // Save that we opened app with new state
          AppsApiUtils.updateState(uuid, app, {isOpened: true}, function() {
            //...
          });

          this.emitChange();
          return;
        }.bind(this),
        type: params.useDefault ? 'GET' : 'POST'
      });

    } else {

      // Create react component from class
      app.state = params.state;
      url = appServer + '/app/'+ uuid +'/' + app.id + '/states/' + app.state.id;

      if(params.args) {
        url += '?' + querystring.stringify(params.args);
      }

      app.isOpened = true;
      app.element = React.createElement('iframe', {src: url,
        className: "app-window",
        scrolling: 'no',
        seamless: 'seamless',
        allowFullScreen: ''});
      this.emitChange();
    }
  },

  close: function(appId) {
    var app = this.getApp(appId);
    app.isOpened = false;
    var uuid = SessionStore.getCurrentUser().uuid;

    if(app.state && app.state.id) {
      AppsApiUtils.updateState(uuid, app, {isOpened: false}, function() {
      //...
      });
    }
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
  },

  updatePosition: function(app, position) {
    app = this.getApp(app.id);
    app.state.x = position.x;
    app.state.y = position.y;
  },

  updateState: function(app, state) {
    app = this.getApp(app.id);
    app.state = state;
    app.state.id = state._id;
  },

  deserializeState: function() {

    this.getApps().forEach(function(app) {

      // Initial state
      app.state = null;
      app.isOpened = false;

      // Now check in backend for more state
      AppsApiUtils.getStates(app.id, function(states) {
        states.forEach(function(state) {

          state.id = state._id;

          if(state.isOpened) {
            this.open(app.id, {
              state: state,
            });
          }

        }, this);

      }.bind(this));

    }, this);
  },

  onSessionDestroyed: function() {
    this.getApps().forEach(function(app) {

      // Initial state
      app.state = null;
      app.isOpened = false;
    });
  }
});

// Register with the dispatcher
AppDispatcher.register(function(payload) {

  var action = payload.action;
  var title;

  switch(action.type) {
    case ActionTypes.LAUNCH_APP:
      AppsStore.open(action.app.id, action.params, action.userId);
      AppsStore.emitChange();

      // Close search box if opened
      DesktopStore.closeSearch();

      break;
    case ActionTypes.CLOSE_APPS:
      AppsStore.close(action.app.id);
      AppsStore.emitChange();
      break;

    // Close app if it matches the state
    case ActionTypes.CLOSE_APP_WITH_STATE:

      var openedApp = _.findWhere(AppsStore.getOpened(), {id: action.app.id});

      if(openedApp && openedApp.state.id === action.app.state.id) {
        AppsStore.close(action.app.id);
        AppsStore.emitChange();
      }

      break;

    // Change the position
    case ActionTypes.SET_POSITION:
      AppsStore.updatePosition(action.app, action.position);
      AppsStore.emitChange();
      break;

    // Serialize the state
    case SessionActionTypes.CREATE_SESSION:
      AppsStore.deserializeState();
      AppsStore.emitChange();
      break;

    case SessionActionTypes.DESTROY_SESSION:
      AppsStore.onSessionDestroyed();
      AppsStore.emitChange();
      break;

    case ActionTypes.UPDATE_TITLE:
      AppsStore.updateState(action.app, action.state);
      break;

    default:
      // No operation
  }
});

module.exports = AppsStore;
