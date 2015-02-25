var React = require('react');
var TimeoutTransitionGroup = require('react-components/js/timeout-transition-group');
var AvailableUsersStore = require('../stores/AvailableUsersStore');

var User = require('./User');

// List of users
var UsersList = React.createClass({

  propTypes: {
    disabled: React.PropTypes.bool,
    showNames: React.PropTypes.bool,
    users: React.PropTypes.array.isRequired
  },

  getDefaultProps: function() {
    return {
      showNames: true,
      disabled: false
    };
  },

  render: function() {

    // Get all user nodes
    var userNodes = this.props.users.map(function (user, i) {

      // Create single list element
      return (
        <User key={i}
          user={user}
          disabled={this.props.disabled}
          showNames={this.props.showNames} />
      );

    }, this);

    var isEmpty = userNodes.length === 0;
    var cssClass = this.props.disabled ? 'login-list disabled' : 'login-list';

    if(isEmpty) {
      return (
        <div id="login-list" className={"empty " + cssClass}>
          <p className="text-center grey">Finding devices in the area.</p>
        </div>
      );
    } else {
      return(
        <div id="login-list" className={cssClass}>
          <div className='usersList'>
            <TimeoutTransitionGroup enterTimeout={2000}
              leaveTimeout={2000}
              transitionName='users'>
              {userNodes}
            </TimeoutTransitionGroup>
          </div>
        </div>
      );
    }
  }
});

module.exports = UsersList;
