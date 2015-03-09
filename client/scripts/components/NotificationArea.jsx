/** @jsx React.DOM */
'use strict';

var React = require('react');
var TimeoutTransitionGroup = require('react-components/js/timeout-transition-group');

// Components
var NotificationItem = require('./NotificationItem');

// Stores
var NotificationStore   = require('../stores/NotificationStore');

// Initialize the store
NotificationStore.init();

// Login box
var NotificationArea = React.createClass({

  getStateFromStores: function() {
    return {
      notifications: NotificationStore.getAll()
    };
  },

  // Initial state
  getInitialState: function() {
    return this.getStateFromStores();
  },

  // After component rendered
  componentDidMount: function() {
    NotificationStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    NotificationStore.removeChangeListener(this._onChange);
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
    var notifications = this.state.notifications.map(function(notification) {
      return <NotificationItem key={notification.id}
        notification={notification}
        action={notification.action} />;
    });

    return (
      <div id="notification-area">
        <TimeoutTransitionGroup enterTimeout={2000}
          leaveTimeout={2000}
          transitionName='users'>
          {notifications}
        </TimeoutTransitionGroup>
      </div>
    );
  }
});

module.exports = NotificationArea;
