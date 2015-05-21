var React = require('react');
var TimeoutTransitionGroup =
  require('react-components/js/timeout-transition-group');

// Stores
var SessionStore = require('../stores/SessionStore');
var FileShareStore = require('../stores/FileShareStore');

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

  getInitialState: function() {
    return {
      loggingUserId: FileShareStore.getUserRequest(),
      currentUser: SessionStore.getCurrentUser()
    };
  },

  componentDidMount: function() {
    FileShareStore.addChangeListener(this._onChange);
    SessionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    FileShareStore.removeChangeListener(this._onChange);
    SessionStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState({
      loggingUserId: FileShareStore.getUserRequest(),
      currentUser: SessionStore.getCurrentUser()
    });
  },

  render: function() {

    // Sort users by name
    var sortedUsers = _.sortBy(this.props.users, 'name');

    // Make sure that active user is first
    var active = this.state.currentUser;
    if(active)
    {
      var index = _.findIndex(sortedUsers, active);
      var userToOrder = sortedUsers.splice(index, 1);
      sortedUsers.splice(0, 0, userToOrder[0]);
    }

    var userNodes = sortedUsers.map(function (user, i) {

      // Is currently logged in
      var isActive;
      var isLoggingIn;

      if(active) {
          isActive = _.isEqual(user.uuid, active.uuid);
      }

      isLoggingIn = false;
      if(this.props.userLoggingIn &&
        _.isEqual(this.props.userLoggingIn.uuid, user.uuid)) {
          isLoggingIn = true;
      }


      // Create single list element
      return (
        <User key={i}
          user={user}
          disabled={this.props.disabled || user.state === 'stale'}
          showNames={this.props.showNames}
          loggedIn={isActive}
          sessionActive={active}
          isLoggingIn={isLoggingIn}
          isFileSharing={this.state.loggingUserId === user.uuid}
           />
      );

    }, this);

    var isEmpty = userNodes.length === 0;
    var cssClass = 'login-list';
    var userListClass = 'usersList';

    if(this.props.showNames) {
      userListClass += ' wide';
    }

    if(isEmpty) {
      return (
        <div id="login-list" className={'empty ' + cssClass}>
          <p className="text-center grey">Finding devices in the area.</p>
        </div>
      );
    } else {
      return(
        <div id='login-list' className={cssClass}>
          <div className={userListClass}>
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
