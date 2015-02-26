/** @jsx React.DOM */
'use strict';

// External deps
var React = require('react');

// Components
var LoginScreen = require('./LoginScreen');
var Desktop = require('./Desktop');

// Stores
var SessionStore        = require('../stores/SessionStore');
var WindowStore         = require('../stores/WindowStore');
var DesktopStore        = require('../stores/DesktopStore');

// Utils
var SocketUtils = require('../utils/SocketUtils');

// Start the socket helper
SocketUtils.listenOverSocket();

// Initialize stores
DesktopStore.init();

var App = React.createClass({

  getStateFromStores: function() {
    return {
      session: SessionStore.getCurrentUser()
    };
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  componentDidMount: function() {
    SessionStore.addChangeListener(this._onChange);
    WindowStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    SessionStore.removeChangeListener(this._onChange);
    WindowStore.removeChangeListener(this._onChange);
  },

  render: function() {

    if(this.state.session) {
      return(
        <Desktop />
      );
    } else {
      return(
        <LoginScreen />
      );
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());
  }


});

module.exports = App;
