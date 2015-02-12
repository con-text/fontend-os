/** @jsx React.DOM */
'use strict';

var React = require('react');
var WindowStore = require('../../stores/WindowStore');
var WindowActions = require('../../actions/WindowActions');

// Single icon
var Icon = React.createClass({
	handleClick: function() {
		WindowActions.toggleWindow(this.props.appId);
	},
	render: function() {
		return (
			<span className="app-icon" data-icon={this.props.name}
				onClick={this.handleClick} />
		);
	}
});

// Taskbar for launching apps
var Taskbar = React.createClass({

	getInitialState: function() {
		return {
			apps: []
		};
	},

	componentDidMount: function() {

		WindowStore.getAll(function(apps) {
			this.setState({
				apps: apps
			});
		}.bind(this));

		WindowStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function() {
		WindowStore.removeChangeListener(this._onChange);
	},

	render: function() {

		// Get all icons for windows
		var appIcons = this.state.apps.map(function(app, index) {
			return (
				<Icon key={app.id} name={app.name} appId={app.id} />
			);

		}, this);

		return (
			<div className="taskbar">
				{appIcons}
			</div>
		);
	},

	_onChange: function() {
		//this.setState(getStateFromStores());
	}
});

module.exports = Taskbar;
