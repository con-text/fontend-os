var React = require('react');

// Actions
var NotificationAction = require('../actions/NotificationActionCreators');

var NotificationItem = React.createClass({
  propTypes: {
    notification: React.PropTypes.object.isRequired,
    action: React.PropTypes.func
  },

  render: function() {
    var actionButton = this.props.action ?
      <span onClick={this.handleAction}>
        <i className="fa fa-check button"></i>
      </span> :
      '';

    return (
      <div className="notification">

        <span className="text">{this.props.notification.text}</span>

        <div className="buttons">
          {actionButton}
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

    NotificationAction.dismiss(this.props.notification);
  },

  handleClose: function() {
    // Invoke dismiss action
    NotificationAction.dismiss(this.props.notification);
  }
});

module.exports = NotificationItem;
