/** @jsx React.DOM */
'use strict';

// Initialize socket.io
var socket = io();
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// Single list element
var User = React.createClass({

  render: function() {
    return (
      <div className="user row">
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
    var userNodes = this.props.users.map(function (user) {
      return (
        <User key={user.name} name={user.name} profilePic={user.profilePic} />
      );
    });

    var isEmpty = userNodes.length === 0;
    console.log(isEmpty, userNodes);

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
      return {data: []};
    },

    // After component rendered
    componentDidMount: function() {
      var self = this;
      // Listen to users event
      socket.on('users', function (data) {
        self.setState({data: data});
      });
    },

    // Render the element
    render: function() {

      return (
        <div className="container">
          <div className="row">
            <div id="users-box" className="col-md-5 col-md-offset-3">
              <span className="page-header">
                <h1 className="text-center">Welcome to Context</h1>
              </span>
              <UsersList users={this.state.data} />
            </div>
          </div>
        </div>
      );
    }
});


module.exports = UsersBox;
