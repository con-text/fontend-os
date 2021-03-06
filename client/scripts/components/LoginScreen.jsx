/** @jsx React.DOM */
'use strict';

var React = require('react');

var SessionStore        = require('../stores/SessionStore');
var AvailableUsersStore = require('../stores/AvailableUsersStore');

var UsersList = require('./UsersList');

// Login box
var LoginScreen = React.createClass({

  getStateFromStores: function() {
    return {
      isLoggingIn: SessionStore.isLoggingIn(),
      available: AvailableUsersStore.getAvailable(),
      userLoggingIn: SessionStore.whoLoggingIn()
    };
  },

  // Initial state
  getInitialState: function() {
    return this.getStateFromStores();
  },

  // After component rendered
  componentDidMount: function() {
    SessionStore.addChangeListener(this._onChange);
    AvailableUsersStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    SessionStore.removeChangeListener(this._onChange);
    AvailableUsersStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    if(this.isMounted()) {
      this.setState(this.getStateFromStores());
    }
  },

  /**
  * return {object}
  */
  render: function() {

    return (
      <div className="container">
        <div id="users-box" className='sidebar'>
          <span className="page-header nible-logo">
          </span>
          <UsersList disabled={this.state.isLoggingIn}
            userLoggingIn={this.state.userLoggingIn}
            users={this.state.available} />
        </div>
        <div className="desktop"></div>
      </div>
    );
  }
});

module.exports = LoginScreen;
