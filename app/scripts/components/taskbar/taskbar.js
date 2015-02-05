/** @jsx React.DOM */
'use strict';

var React = require('react');
var WindowStore = require('../../stores/WindowStore');
var WindowActions = require('../../actions/WindowActions');

// Single icon
var Icon = React.createClass({
	handleClick: function() {
		WindowActions.toggleWindow(this.props.name);
	},
	render: function() {
		return (
			<span className="app-icon" data-icon={this.props.name}
				onClick={this.handleClick} />
		);
	}
});

function getStateFromStores() {
	return {
		apps: WindowStore.getAll()
	};
}

// Taskbar for launching apps
var Taskbar = React.createClass({

	getInitialState: function() {
		return getStateFromStores();
	},

	componentDidMound: function() {
		WindowStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function() {
		WindowStore.removeChangeListener(this._onChange);
	},

	render: function() {

		this.state.apps.push({title: "browser"});
		// Get all icons for windows
		var appIcons = this.state.apps.map(function(app, index) {

			return (
				<Icon key={index} name="App" />
			);

		}, this);

		return (
			<div className="taskbar">
				{appIcons}
			</div>
		);
	},

	_onChange: function() {
		this.setState(getStateFromStores());
	}
});

module.exports = Taskbar;
