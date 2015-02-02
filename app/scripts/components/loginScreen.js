/** @jsx React.DOM */
'use strict';

// Initialize socket.io
var socket = io();

var React = require('react');
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


var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var UsersList = React.createClass({

  getInitialState: function() {
      return {
        users: [{name: 'Benji', profilePic: 'http://placehold.it/50'},
          {name: 'Nobody', profilePic: 'http://placehold.it/50'}]
      }
  },

  render: function() {
    var userNodes = this.state.users.map(function (user) {
      return (
        <User key={user.name} name={user.name} profilePic={user.profilePic} />
      );
    });

    return(
      <div id="login-list">
      <ReactCSSTransitionGroup transitionName='example'>
        <div className='usersList'>
          {userNodes}
        </div>
      </ReactCSSTransitionGroup >

      </div>
    );
  }
});

var UsersBox = React.createClass({
  getInitialState: function() {
      return {data: []};
    },
    componentDidMount: function() {
      var self = this;
      // Listen to users event
    socket.on('users', function (data) {
      self.setState({data: data});
    });
    },
    render: function() {
      return (
        <div id="users-box">
          <UsersList users={this.state.data} />
        </div>
      );
    }
});


module.exports = UsersBox;
