/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
var Ventus = require('ventus');
var React = require('react');

// Initialize socket.io
var socket = io();


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

var UsersList = React.createClass({
	
	render: function() {
		console.log("Props", this.props);
		var userNodes = this.props.users.map(function (user) {
			return (
				<User name={user.name} profilePic={user.profilePic} />
			);
		});

		return(
			<div className='usersList'>
				{userNodes}
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
			console.log(data)
			self.setState({data: data});
		});
  	},
  	render: function() {
    	return (
    		<div id="users-box">
    			<h1>Users</h1>
    			<UsersList users={this.state.data} />
    		</div>
    	);
  	}
});





$(document).ready(function() {
    
    var wm = new Ventus.WindowManager();

    var loginWindow = wm.createWindow.fromQuery('#loginWindow',{
        title: 'Log in',
        x: 50,
        y: 50,
        width: 400,
        height: 250
    });

    // Hide loading overlay
    $('#loading-screen').hide();

    loginWindow.open();

    // Render react element in 
    React.render(
	  <UsersBox />,
	  document.getElementById('users')
	);

});