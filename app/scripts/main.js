/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

// Other components
var WindowStore = require('./stores/WindowStore');

var App = require('./components/app');
var SessionStore = require('./stores/SessionStore');

$(document).ready(function() {

    // Hide loading overlay
    $('#loading-screen').hide();

    // Render the app
		React.render(
			<App />,
			document.getElementById('app')
		)

});
