/** @jsx React.DOM */
'use strict';

var React = require('react');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');
var DesktopActionCreators = require('../actions/DesktopActionCreators');
var AppsActionCreators    = require('../actions/AppsActionCreators');

// Components
var Sidebar   = require('./Sidebar');
var SearchBox = require('./SearchBox');

// Stores
var DesktopStore  = require('../stores/DesktopStore');
var AppsStore     = require('../stores/AppsStore');

// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');

// App container
var AppContainer = React.createClass({
  mixins: [DragDropMixin],

  statics: {
    configureDragDrop: function(register) {
      register(ItemTypes.USER, {
        dropTarget: function(component, user) {
          console.log("DROP!", component, user);
        }
      });
    }
  },

  render: function() {
    var divStyle = {
      display: this.props.app ? 'block' : 'block'
    };

    return <div className="appContainer" style={divStyle}
      {...this.dropTargetFor(ItemTypes.USER)} >
      <div className="appToolbar">
        <div role="button" onClick={this.handleCloseClick}>Close</div>
      </div>
      <div className="appInnerContainer">
        {this.props.app}
      </div>
    </div>;
  },

  handleCloseClick: function(e) {
    e.preventDefault();
    AppsActionCreators.close();
  }
});

var Desktop = React.createClass({

  getStateFromStores: function() {
    return {
      showSearch: DesktopStore.isSearchVisible(),
      currentApp: AppsStore.getOpened()
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
        <Sidebar />
        <div className="desktop">
          <SearchBox boxVisible={this.state.showSearch} />
          <AppContainer app={this.state.currentApp} />
        </div>
      </div>
    );
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
