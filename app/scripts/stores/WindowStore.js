
var WindowDispatcher = require('../dispatchers/WindowDispatcher');
var WindowConstants = require('../constants/WindowConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var Ventus = require('ventus');
var CHANGE_EVENT = 'change';
var ActionTypes = WindowConstants.ActionTypes;

var wm = new Ventus.WindowManager();

// List of opened windows
var _windows = {};

function createFromEl(title, el) {

  // Create a window from a DOM element
  _windows[title] = wm.createWindow.fromElement(el, {
    title: title,
    width: 500,
    height: 500,
    x: 0,
    y: 0,
    softRemove: true,
  });

  _windows[title].open();
}

function toggleWindow(title) {

  if(_windows[title]) {
    var win = _windows[title];

    if(win.opened) {
      win.close();
    }
    else if(win.closed) {
      wm.windows.push(win);
      console.log(win.content)
      win.open();
    }
  }
}

var WindowStore = assign({}, EventEmitter.prototype, {

  getAll: function() {
      return _windows;
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
