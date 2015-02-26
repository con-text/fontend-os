/** @jsx React.DOM */
'use strict';

var React = require('react');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');

// Components
var Sidebar   = require('./Sidebar');
var SearchBox = require('./SearchBox');

// Stores
var DesktopStore = require('../stores/DesktopStore');

var Desktop = React.createClass({

  getStateFromStores: function() {
    return {
      showSearch: DesktopStore.isSearchVisible()
    };
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  componentDidMount: function() {
    DesktopStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    DesktopStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div className="container">
        <Sidebar />
        <div className="desktop">
          <SearchBox boxVisible={this.state.showSearch} />
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());
  }
});

module.exports = Desktop;
