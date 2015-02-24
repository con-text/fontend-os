/** @jsx React.DOM */
'use strict';

var React = require('react');
var LoginScreen = require('./loginScreen');
var TaskBar = require('./taskbar/taskbar');
var SessionStore = require('../stores/SessionStore');
var WindowStore = require('../stores/WindowStore');
var AvailableUsersStore = require('../stores/AvailableUsersStore');
var SocketUtils = require('../utils/SocketUtils');
var UsersList = require('./UsersList');
var SessionActionCreators = require('../actions/SessionActionCreators');

// Start the socket helpe
SocketUtils.listenOverSocket();

var LogOutMenu = React.createClass({
  render: function() {
    return <button onClick={this.handleClick}>Log out</button>;
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
            <div id="users-box" className='col-md-2 sidebar'>
              <UsersList users={this.state.available} />
              <hr />
              <h3>Friends list here</h3>
              <LogOutMenu />
            </div>
            <div className="desktop col-md-8">
              <TaskBar />
            </div>
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
