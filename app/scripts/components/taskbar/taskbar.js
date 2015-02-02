/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
var React = require('react');

var WindowActions = require('../../actions/WindowActions');

// Get window manager handle
var wm = window.wm;

var Icon = React.createClass({
	handleClick: function() {
		WindowActions.createWindow("New Window");
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
			<div className="taskbar">
				<Icon />
				<Icon />
				<Icon />
			</div>
		)
	}
});

module.exports = Taskbar;
