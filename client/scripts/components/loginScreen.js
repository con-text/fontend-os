/** @jsx React.DOM */
'use strict';

var React = require('react');
var AvailableUsersStore = require('../stores/AvailableUsersStore');
var UsersList = require('./UsersList');


// Login box
var LoginScreen = React.createClass({

    // Initial state
    getInitialState: function() {
      return {
        available: AvailableUsersStore.getAvailable()
      };
    },

    // After component rendered
    componentDidMount: function() {
      AvailableUsersStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
      AvailableUsersStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
      this.setState({available: AvailableUsersStore.getAvailable()});
    },

    /**
    * return {object}
    */
    render: function() {

      return (
        <div className="container-fluid">
          <div className="row">
            <div id="users-box" className='col-md-2 sidebar'>
              <span className="page-header">
                <h1 className="text-center">Welcome to Context</h1>
              </span>
              <UsersList users={this.state.available} />
            </div>
          </div>
        </div>
      );
    }
});

module.exports = LoginScreen;
