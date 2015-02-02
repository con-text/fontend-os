
var WindowDispatcher = require('../dispatchers/WindowDispatcher');
var WindowConstants = require('../constants/WindowConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var Ventus = require('ventus');
var CHANGE_EVENT = 'change';

var wm = new Ventus.WindowManager();

var _windows = {};


function create(title) {
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _windows[id] = {
    id: id,
    title: title
  }

  var newWindow = wm.createWindow({
      title: title,
      x: 50,
      y: 50,
      width: 400,
      height: 550
  });

  newWindow.open();
}

var WindowStore = assign({}, EventEmitter.prototype, {

  getAll: function() {
      return _windows;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  }

});

// Register with the dispatcher
WindowDispatcher.register(function(action) {

  var title;

  switch(action.actionType) {
    case WindowConstants.CREATE_WINDOW:
      title = action.title;
      create(title);
      WindowStore.emitChange();
      break;
    case WindowConstants.DESTROY_WINDOW:
      WindowStore.emitChange();
      break;

    default:
      // No operation
  }

});

module.exports = WindowStore;
