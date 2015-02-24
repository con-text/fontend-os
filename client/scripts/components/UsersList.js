var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var AvailableUsersStore = require('../stores/AvailableUsersStore');

var User = require('./User');

// List of users
var UsersList = React.createClass({

  propTypes: {
    disabled: React.PropTypes.bool,
    users: React.PropTypes.array.isRequired
  },

  getDefaultProps: function() {
    return {
      disabled: false
    };
  },

  render: function() {

    // Get all user nodes
    var userNodes = this.props.users.map(function (user, i) {

      // Create single list element
      return (
        <User key={i} user={user} disabled={this.props.disabled} />
      );

    }, this);

    var isEmpty = userNodes.length === 0;
    var cssClass = this.props.disabled ? 'login-list disabled' : 'login-list';

    if(isEmpty) {
      return (
        <div id="login-list" className={"empty " + cssClass}>
          <p className="text-center">Turn on your auth device.</p>
        </div>
      );
    } else {
      return(
        <div id="login-list" className={cssClass}>
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
