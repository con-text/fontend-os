/** @jsx React.DOM */
'use strict';

var React = require('react');
var UsersBox = require('./loginScreen');
var TaskBar = require('./taskbar/taskbar');
var SessionStore = require('../stores/SessionStore');

var App = React.createClass({
  getInitialState: function() {
      return {
        session: SessionStore.getCurrentUser()
      }
  },

  render: function() {

    if(this.state.session) {
      return(
        <TaskBar />
      );
    } else {
      return(
        <UsersBox />
      )
    }
  }
});

module.exports = App;
