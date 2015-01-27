'use strict';

var $ = require('jquery');
var Ventus = require('ventus');

$(document).ready(function() {
    
    console.log('Ready!');

    var wm = new Ventus.WindowManager();

    var window = wm.createWindow({
        title: 'A new window',
        x: 50,
        y: 50,
        width: 400,
        height: 250
    });

    window.open();
});