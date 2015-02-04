/** @jsx React.DOM */
'use strict';

var React = require('react');
var UsersBox = require('./loginScreen');
var TaskBar = require('./taskbar/taskbar');
var SessionStore = require('../stores/SessionStore');
var WindowStore = require('../stores/WindowStore');

var Window = require('./window/window');
var Browser = require('./browser/browser');

var App = React.createClass({
  getInitialState: function() {
      return {
        session: SessionStore.getCurrentUser(),
        windows: WindowStore.getAll()
      }
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

          <Window title="calculator">
            <div id="calc-app">
              <h1>Calculator</h1>
              <p>Lorem ipsum</p>
              <input placeholder="Calculate..." />
            </div>
          </Window>

          <TaskBar />
        </div>
      );
    } else {
      return(
        <UsersBox />
      )
    }
  },

  _onChange: function() {
      this.setState({session: SessionStore.getCurrentUser()});
  }


});

module.exports = App;
