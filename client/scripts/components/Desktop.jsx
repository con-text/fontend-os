/** @jsx React.DOM */
'use strict';

var React = require('react');
var reactDnd = require('react-dnd');

var DragDropMixin = reactDnd.DragDropMixin;
var DragLayerMixin = reactDnd.DragLayerMixin;
var ItemTypes = require('./DragItemTypes');

// Actions
var DesktopActionCreators = require('../actions/DesktopActionCreators');
var NotificationActions   = require('../actions/NotificationActionCreators');
var AppsActions           = require('../actions/AppsActionCreators');

// Components
var Sidebar   = require('./Sidebar');
var SearchBox = require('./SearchBox');
var AppContainer = require('./AppContainer');
var NotificationArea = require('./NotificationArea');

// Stores
var DesktopStore  = require('../stores/DesktopStore');
var AppsStore     = require('../stores/AppsStore');

var Desktop = React.createClass({
  mixins: [DragDropMixin, DragLayerMixin],

  statics: {
    configureDragDrop: function(register, context) {
      register(ItemTypes.WINDOW, {
        dropTarget: {
          acceptDrop: function(component, item) {
            var delta = context.getCurrentOffsetDelta();
            var left = item.x + delta.x;
            var top = item.y + delta.y;
            component.setState({
              x: left,
              y: top
            });
          }
        }
      });
    }
  },

  getStateFromStores: function() {
    return {
      showSearch: DesktopStore.isSearchVisible(),
      currentApp: AppsStore.getOpened(),
      x: 0,
      y: 0
    };
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  componentDidMount: function() {
    DesktopStore.addChangeListener(this._onChange);
    AppsStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    DesktopStore.removeChangeListener(this._onChange);
    AppsStore.removeChangeListener(this._onChange);
  },

  render: function() {


    return (
      <div className="container" onClickCapture={this.handleClick}>
        <NotificationArea />
        <Sidebar />
        <span className="button" onClick={this.notify}>CLICK ME</span>
        <div className="desktop" {...this.dropTargetFor(ItemTypes.WINDOW)}>
          <SearchBox boxVisible={this.state.showSearch} />
          <AppContainer app={this.state.currentApp}
            x={this.state.x}
            y={this.state.x} />
        </div>
    </div>
    );
  },

  notify: function(e) {
    // Request should specify who is sharing what app
    var app = {
      id: "89447cef-0ee6-4805-942b-bc790e89dce1"
    };

    // Create notification about sharing
    NotificationActions.createTextNotification("You will share this app.",
      AppsActions.open.bind(
        AppsActions,
        app));
  },

  handleClick: function(e) {
    if(e.target.id !== "searchBox" &&
      $(e.target).parents("#searchBox").size() === 0) {
      DesktopActionCreators.closeSearch();
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());
  }
});

module.exports = Desktop;
