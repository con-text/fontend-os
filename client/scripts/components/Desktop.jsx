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
  mixins: [DragDropMixin],

  statics: {
    configureDragDrop: function(register, context) {
      register(ItemTypes.WINDOW, {
        dropTarget: {
          acceptDrop: function(component, item) {
            var delta = context.getCurrentOffsetDelta();
            var left = item.x + delta.x;
            var top = item.y + delta.y;

            var currentPos = component.state.pos;
            currentPos[item.app.id] = {
              x: left,
              y: top
            };

            component.setState({pos: currentPos});
          }
        }
      });
    }
  },

  getStateFromStores: function() {
    return {
      showSearch: DesktopStore.isSearchVisible(),
      currentApps: AppsStore.getOpened(),
    };
  },

  getInitialState: function() {
    var stateFromStores = this.getStateFromStores();
    stateFromStores.pos = {};
    stateFromStores.currentApps.forEach(function(app) {
      stateFromStores.pos[app.id] = {x: 0, y: 0};
    }, this);

    return stateFromStores;
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

    var dropState = this.getDropState(ItemTypes.WINDOW);
    var containers = this.state.currentApps.map(function(app) {



      if(!this.state.pos[app.id]) {
        this.state.pos[app.id] = {x: 0, y: 0};
      }

      return <AppContainer key={app.id}
        app={app}

        onClick={this.bringToFront}
        x={this.state.pos[app.id].x}
        y={this.state.pos[app.id].y} />;
    }, this);

    var divStyle = {
      zIndex: 1
    };

    if(dropState.isDragging) {
      divStyle.zIndex = 2222;
    }

    return (
      <div className="container" onClickCapture={this.handleClick}>
        <NotificationArea />
        <Sidebar />
        <div className="desktop" style={divStyle} {...this.dropTargetFor(ItemTypes.WINDOW)}>
          <SearchBox boxVisible={this.state.showSearch} />
          {containers}
        </div>
    </div>
    );
  },

  bringToFront: function(e) {
    console.log('to front', e.target);
  },

  handleClick: function(e) {
    if(e.target.id !== "searchBox" &&
      $(e.target).parents("#searchBox").size() === 0) {
      DesktopActionCreators.closeSearch();
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());

    this.state.currentApps.forEach(function(app) {
      if(!this.state.pos[app.id]) {
        this.state.pos[app.id] = {x: 0, y: 0};
      }
    }, this);
  }
});

module.exports = Desktop;
