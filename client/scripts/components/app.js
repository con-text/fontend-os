/** @jsx React.DOM */
'use strict';

var React = require('react');
var UsersBox = require('./loginScreen');
var TaskBar = require('./taskbar/taskbar');
var SessionStore = require('../stores/SessionStore');
var WindowStore = require('../stores/WindowStore');

var App = React.createClass({

  getInitialState: function() {
      return {
        session: SessionStore.getCurrentUser()
      };
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
        <div className="desktop">
          <TaskBar />
        </div>
      );
    } else {
      return(
        <UsersBox />
      );
    }
  },

  _onChange: function() {
      this.setState({session: SessionStore.getCurrentUser()});
  }


});

module.exports = App;
