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

      var divStyle = {
        opacity: 1,
        zIndex: 1
      };

      if(dropState.isDragging) {
        divStyle.opacity = 0.2;
      }

      return <AppContainer key={app.id}
        app={app}
        style={divStyle}
        onClick={this.bringToFront}
        x={this.state.pos[app.id].x}
        y={this.state.pos[app.id].y}
        dragStarted={this.windowDragStarted}
        dragOver={this.windowDragOver}
        dragFinished={this.windowDragFinished}
        bringToFront={this.bringToFront} />;
    }, this);




    return (
      <div className="container" onClickCapture={this.handleClick}>
        <NotificationArea />
        <Sidebar />
        <div className="desktop" >
          <SearchBox boxVisible={this.state.showSearch} />
          <div id="dragOverlay"
            {...this.dropTargetFor(ItemTypes.WINDOW)}/>
          {containers}
        </div>
    </div>
    );
  },

  windowDragStarted: function(appContainer) {
    $('#dragOverlay').css('z-index', 2);

    // Bring up currently dragged element
    $(appContainer.getDOMNode()).css('z-index', 2);
  },

  windowDragOver: function(appContainer) {
    //$(appContainer.getDOMNode()).css('z-index', -1);

  },

  windowDragFinished: function(appContainer) {
    $('#dragOverlay').css('z-index', -1);
    $(".appContainer").css('z-index', 1);
    $(appContainer.getDOMNode()).css('z-index', 2);
  },

  bringToFront: function(e) {
    // Put other windows at level 1
    $(".appContainer").css('z-index', 1);

    // Find app container clicked on, bring it up
    $(e.target).closest('.appContainer').css('z-index', 2);
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
