/** @jsx React.DOM */
'use strict';

var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var AvailableUsersStore = require('../stores/AvailableUsersStore');
var AvailableUsersSocketUtils = require('../utils/AvailableUsersSocketUtils');
var SessionApiUtils = require('../utils/SessionApiUtils');

// Start the socker helpe
AvailableUsersSocketUtils.listenOverSocket();

// Single list element
var User = React.createClass({

  handleClick: function() {

    //TODO: This is fake, change it to real data
    SessionApiUtils.authenticateUser({
      name: this.props.name
    });

  },

  render: function() {
    return (
      <div className="user row" onClick={this.handleClick}>
        <div className="col-md-2">
          <img className="userPic img-circle" src={this.props.profilePic}></img>
        </div>
        <div className="col-md-10">
          <h3 className="userName col-md-3">{this.props.name}</h3>
        </div>
      </div>
    )
  }
});

// List of users
var UsersList = React.createClass({

  render: function() {

    // Get all user nodes
    var userNodes = this.props.users.map(function (user, i) {

      // Create single list element
      return (
        <User key={user.name} name={user.name} profilePic={user.profilePic} />
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

// Login box
var UsersBox = React.createClass({

    // Initial state
    getInitialState: function() {
      return {
        available: AvailableUsersStore.getAvailable()
      };
    },

    // After component rendered
    componentDidMount: function() {
      AvailableUsersStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
      AvailableUsersStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
      this.setState({available: AvailableUsersStore.getAvailable()});
    },

    /**
    * return {object}
    */
    render: function() {

      return (
        <div className="container">
          <div className="row">
            <div id="users-box" className="col-md-5 col-md-offset-3">
              <span className="page-header">
                <h1 className="text-center">Welcome to Context</h1>
              </span>
              <UsersList users={this.state.available} />
            </div>
          </div>
        </div>
      );
    }
});


module.exports = UsersBox;
