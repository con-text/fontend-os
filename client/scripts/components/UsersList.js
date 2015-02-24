var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

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
        <User key={user.uuid}
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
          <p className="text-center">Turn on your auth device.</p>
        </div>
      );
    } else {
      return(
        <div id="login-list" className={cssClass}>
          <div className='usersList'>
            <ReactCSSTransitionGroup transitionName='users'>
              {userNodes}
            </ReactCSSTransitionGroup>
          </div>
        </div>
      );
    }
  }
});

module.exports = UsersList;
