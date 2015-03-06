var React = require('react');

// Actions
var NotificationAction = require('../actions/NotificationActionCreators');

var NotificationItem = React.createClass({
  render: function() {
    return (
      <div className="notification">

        <span className="text">{this.props.notification.text}</span>

        <div className="buttons">
          <span onClick={this.handleAction}>
            <i className="fa fa-check button"></i>
          </span>
          <span onClick={this.handleClose}>
            <i className="fa fa-close button"></i>
          </span>
        </div>
      </div>
    );
  },

  handleAction: function() {
      if(this.props.action) {
        this.props.action();
      }
  },

  handleClose: function() {
    // Invoke dismiss action
    NotificationAction.dismiss(this.props.notification);
  }
});

module.exports = NotificationItem;
