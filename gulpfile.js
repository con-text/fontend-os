var gulp = require('gulp'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	browserify = require('gulp-browserify'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean');

// Live reload server depenencies
var embedlr = require('gulp-embedlr'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    livereload = require('connect-livereload'),
    livereloadport = 35729,
    serverport = 5000;

// JSHint task - detects errors and problems in JS code
gulp.task('lint', function() {
  gulp.src('.app/scripts/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
});

// Browserify task
gulp.task('browserify', function() {

	// Main entry point
	gulp.src(['app/scripts/main.js'])
	.pipe(browserify({
		insertGlobals: true,
		debug: true	
	}))
	// Concatinate into one file
	.pipe(concat("bundle.js"))
	// Output to destination directory
	.pipe(gulp.dest("dist/js"));
});

// Watch task
gulp.task('watch', ['lint'], function() {

	// Watch scripts folders
	gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'], [
		'lint',
		'browserify'
	]);

	// Watch views
	gulp.watch(['app/index.html', 'app/views/**/*.html'], [
	  'views'
	]);
});



gulp.task('views', function() {
	
	// Main view
	gulp.src('./app/index.html')
	.pipe(gulp.dest('dist/'));

	// Sub-views
	gulp.src('./app/views/**/*')
	.pipe(gulp.dest('dist/views/'))
	// Refresh live server
  	.pipe(refresh(lrserver));
});

gulp.task('server', function() {

	// Set up an express server (but not starting it yet)
	var server = express();
	
	// Add live reload
	server.use(livereload({port: livereloadport}));
	
	// Use our 'dist' folder as rootfolder
	server.use(express.static('./dist'));
	
	// Because I like HTML5 pushstate .. this redirects everything back to our index.html
	server.all('/*', function(req, res) {
	    res.sendfile('index.html', { root: 'dist' });
	});

	// Start webserver
    server.listen(serverport);
    // Start live reload
    lrserver.listen(livereloadport);
    // Run the watch task, to keep taps on changes
    gulp.run('watch');
});