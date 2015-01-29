/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
var React = require('react');

// Get window manager handle
var wm = window.wm;

var Icon = React.createClass({
	handleClick: function() {
		console.log(window.wm);
		var newWindow = window.wm.createWindow({
	    title: 'A new window',
	    x: 50,
	    y: 50,
	    width: 400,
	    height: 250
		});

		newWindow.open();
	},
	render: function() {
		return (
			<span className="icon app-icon" onClick={this.handleClick} />
		)
	}
});

// Taskbar for launching apps
var Taskbar = React.createClass({
	render: function() {
		return (
			<div className="taskBar">
				<Icon />
				<Icon />
				<Icon />
			</div>
		)
	}
});

module.exports = Taskbar;
