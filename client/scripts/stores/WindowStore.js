var WindowDispatcher = require('../dispatchers/WindowDispatcher');
var WindowConstants = require('../constants/WindowConstants');
var ActionTypes = WindowConstants.ActionTypes;

var AppsApiUtils = require('../utils/AppsApiUtils');

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var React = require('react');

// Window manager
var wm = new Ventus.WindowManager();

// List of opened windows
var _windows = {};
var _apps = {};

function createFromEl(id) {

  // Create a window from a DOM element
  var app = _apps[id];

  _windows[id] = wm.createWindow({
    title: app.name,
    height: 786,
    width: 1024,
    x: 0,
    y: 0,
    softRemove: true
  });

  _windows[id].open();

  // Create react component from class
  var url = 'http://localhost:3001/app/123/' + app.id;
  var component = React.createElement('iframe', {src: url, className: "app-window"});
  var renderedIframe = React.render(component, _windows[id].$content.get(0));
}

function toggleWindow(id) {

  if(_windows[id]) {
    var win = _windows[id];

    if(!win.closed) {
      win.close();
    } else if(win.closed) {
      // Re add the window
      wm.windows.push(win);
      win.open();
    }
  } else {
    createFromEl(id);
  }
}

var WindowStore = assign({}, EventEmitter.prototype, {

  getAll: function(cb) {
      AppsApiUtils.getAll(function(data, err) {

        if(Object.keys(_apps).length === 0) {
          data.forEach(function(app) {
            _apps[app.id] = app;
          });
        }

        cb(data, err);
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
WindowDispatcher.register(function(payload) {

  var action = payload.action;
  var title;

  switch(action.type) {
    case ActionTypes.CREATE_WINDOW_FROM_ELEMENT:
      createFromEl(action.title, action.el);
      WindowStore.emitChange();
      break;
    case ActionTypes.DESTROY_WINDOW:
      WindowStore.emitChange();
      break;
    case ActionTypes.TOGGLE_WINDOW:
      toggleWindow(action.title);
      break;
    default:
      // No operation
  }

});

module.exports = WindowStore;
