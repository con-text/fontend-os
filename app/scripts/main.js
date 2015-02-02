/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
var Ventus = require('ventus');
var React = require('react/addons');

// Initialize socket.io
var socket = io();

// Other components
var WindowStore = require('./stores/WindowStore');

var TaskBar = require('./components/taskbar/taskbar');
var UsersBox = require('./components/loginScreen');

$(document).ready(function() {

    var wm = new Ventus.WindowManager();

		// Make it global
		window.wm = wm;

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
