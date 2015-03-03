var React = require('react');
var TimeoutTransitionGroup = require('react-components/js/timeout-transition-group');

// Stores
var AvailableUsersStore = require('../stores/AvailableUsersStore');
var SessionStore        = require('../stores/SessionStore');

// Components
var User = require('./User');

var _ = require('lodash');

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

    // Sort users by name
    var sortedUsers = _.sortBy(this.props.users, 'name');

    // Make sure that active user is first
    var active = SessionStore.getCurrentUser();
    if(active)
    {
      var index = _.findIndex(sortedUsers, active);
      var userToOrder = sortedUsers.splice(index, 1);
      sortedUsers.splice(0, 0, userToOrder[0]);
    }

    var userNodes = sortedUsers.map(function (user, i) {

      // Is currently logged in
      var isActive;

      if(active) {
          isActive = _.isEqual(user.uuid, active.uuid);
      }

      // Create single list element
      return (
        <User key={i}
          user={user}
          disabled={this.props.disabled}
          showNames={this.props.showNames}
          loggedIn={isActive}
           />
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
