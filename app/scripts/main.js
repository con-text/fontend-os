'use strict';

var $ = require('jquery');
var Ventus = require('ventus');

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
});