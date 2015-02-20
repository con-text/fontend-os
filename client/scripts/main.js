/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var App = require('./components/app');
$(document).ready(function() {

    // Hide loading overlay
    $('#loading-screen').hide();

    // Render the app
		React.render(
			<App />,
			document.getElementById('app')
		);

});
