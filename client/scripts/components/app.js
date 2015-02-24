/** @jsx React.DOM */
'use strict';

// External deps
var React = require('react');

// Components
var LoginScreen = require('./LoginScreen');
var UsersList   = require('./UsersList');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');

// Stores
var AvailableUsersStore = require('../stores/AvailableUsersStore');
var SessionStore        = require('../stores/SessionStore');
var WindowStore         = require('../stores/WindowStore');

// Utils
var SocketUtils = require('../utils/SocketUtils');

// Start the socket helper
SocketUtils.listenOverSocket();


var LogOutMenu = React.createClass({
  render: function() {
    return <button className="btn-logout btn btn-primary btn-xs"
      onClick={this.handleClick}>Log out</button>;
  },

  handleClick: function(e) {
    e.preventDefault();
    SessionActionCreators.destroySession();
  }

});

var App = React.createClass({

  getStateFromStores: function() {
    return {
      session: SessionStore.getCurrentUser(),
      available: AvailableUsersStore.getAvailable()
    };
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  componentDidMount: function() {
    SessionStore.addChangeListener(this._onChange);
    WindowStore.addChangeListener(this._onChange);
    AvailableUsersStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    SessionStore.removeChangeListener(this._onChange);
    WindowStore.removeChangeListener(this._onChange);
    AvailableUsersStore.removeChangeListener(this._onChange);
  },

  render: function() {

    if(this.state.session) {
      return(
        <div className="container-fluid">
          <div className="row">
            <div id="users-box" className='sidebar sidebar-small'>
              <UsersList users={this.state.available} showNames={false} />
              <hr />
              <h6>Friends list here</h6>
              <LogOutMenu />
            </div>
            <div className="desktop col-md-11"></div>
          </div>
        </div>
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
