var WindowDispatcher = require('../dispatchers/WindowDispatcher');
var WindowConstants = require('../constants/WindowConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var ActionTypes = WindowConstants.ActionTypes;
var React = require('react');
var Ventus = require('ventus');

// Window manager
var wm = new Ventus.WindowManager();

// Require apps
var Browser = require('../components/browser/browser');

var apps = [];
apps.push(Browser);

// List of opened windows
var _windows = {};

function createFromEl(title, el) {

  // Create a window from a DOM element
  _windows[title] = wm.createWindow({
    title: title,
    width: 500,
    height: 500,
    x: 0,
    y: 0,
    softRemove: true
  });

  _windows[title].open();

  // Create react component from class
  var component = React.createElement(apps[0]);

  React.render(component, _windows[title].$content.get(0));
}

function toggleWindow(title) {

  if(_windows[title]) {
    var win = _windows[title];

    if(win.opened) {
      win.close();
    } else if(win.closed) {
      // Re add the window
      wm.windows.push(win);
      win.open();
    }
  } else {
    createFromEl(title, apps[0]);
  }
}

var WindowStore = assign({}, EventEmitter.prototype, {

  getAll: function() {
      return apps;
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
