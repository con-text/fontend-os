var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var AvailableUsersStore = require('../stores/AvailableUsersStore');

var User = require('./User');

// List of users
var UsersList = React.createClass({

  render: function() {

    // Get all user nodes
    var userNodes = this.props.users.map(function (user, i) {

      // Create single list element
      return (
        <User key={i} user={user} />
      );

    }, this);

    var isEmpty = userNodes.length === 0;

    if(isEmpty) {
      return (
        <div id="login-list" className="empty">
          <p className="text-center">Turn on your auth device.</p>
        </div>
      );
    } else {
      return(
        <div id="login-list">
          <ReactCSSTransitionGroup transitionName='userList'>
            <div className='usersList'>
              {userNodes}
            </div>
          </ReactCSSTransitionGroup >
        </div>
      );
    }
  }
});

module.exports = UsersList;
