/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
var React = require('react');

var Icon = React.createClass({
	render: function() {
		return (
			<span className="icon" />
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