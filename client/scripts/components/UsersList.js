var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var AvailableUsersStore = require('../stores/AvailableUsersStore');
var SessionApiUtils = require('../utils/SessionApiUtils');

// Single list element
var User = React.createClass({

  handleClick: function() {

    // Call authenticate API and invoke action
    SessionApiUtils.authenticateUser(this.props.user);
  },

  render: function() {

    return (
      <div className="user row" onClick={this.handleClick}>
        <div className="col-md-2">
          <img className="userPic test img-circle"
            src={this.props.user.profilePicUrl} />
        </div>
        <div className="col-md-10">
          <h3 className="userName col-md-3">{this.props.user.name}</h3>
        </div>
      </div>
    );
  }
});


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
