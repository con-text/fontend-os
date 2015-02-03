/** @jsx React.DOM */
'use strict';

var $ = require('jquery');
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
		)
	}
});

function getStateFromStores() {
	return {
		apps: WindowStore.getAll()
	}
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

		// Get all icons for windows
		var appIcons = _.map(this.state.apps, function(app, title) {
			return (
				<Icon key={app} name={title} />
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
