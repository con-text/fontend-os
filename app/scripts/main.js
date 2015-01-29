/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
var Ventus = require('ventus');
var React = require('react');

// Initialize socket.io
var socket = io();

// Other components
var TaskBar = require('./taskbar/taskbar');

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
	
	render: function() {
		var userNodes = this.props.users.map(function (user) {
			return (
				<User key={user.name} name={user.name} profilePic={user.profilePic} />
			);
		});

		return(
			<ReactCSSTransitionGroup transitionName='example'>
				<div className='usersList'>
					{userNodes}
				</div>
			</ReactCSSTransitionGroup >
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

$(document).ready(function() {
    
    var wm = new Ventus.WindowManager();
    wm.mode = "fullscreen";

    var loginWindow = wm.createWindow.fromQuery('#users',{
        title: 'List of Users',
        x: 50,
        y: 50,
        width: 400,
        height: 550
    });

    // Hide loading overlay
    $('#loading-screen').hide();

    loginWindow.open();

    // Render react element in 
    React.render(
	   <UsersBox />,
	   document.getElementById('users')
	);

    // Render Taskbar
    React.render(
        <TaskBar />,
        document.getElementById('taskbar')
    );

});