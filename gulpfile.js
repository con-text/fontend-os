var gulp = require('gulp'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	browserify = require('gulp-browserify'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	streamqueue = require('streamqueue'),
	react = require('gulp-react'),
	reactify = require('reactify');

// Live reload server depenencies
var embedlr = require('gulp-embedlr'),
		livereload = require('gulp-livereload'),
    serverport = 5000;

// JSHint task - detects errors and problems in JS code
gulp.task('lint', function() {
  gulp.src('./app/scripts/**/*.js')
	.pipe(react())
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

// Browserify task
gulp.task('browserify', function() {

	// Main entry point
	gulp.src(['app/scripts/main.js'])
	.pipe(browserify({
		insertGlobals: true,
		debug: true,
		transform: ['reactify'],
		shim: {
			jquery: {
				path: 'app/vendor/jquery/jquery-2.1.3.min.js',
				exports: '$'
			},
			ventus: {
				path: 'app/vendor/ventus/ventus.min.js',
				exports: 'Ventus',
				depends: {
					jquery: '$'
				}
			}
		}
	}))
	// Concatinate into one file
	.pipe(concat("bundle.js"))
	// Output to destination directory
	.pipe(gulp.dest("dist/js"));

});

// Watch task
gulp.task('watch', ['lint'], function() {

	livereload.listen();

	// Watch scripts folders
	gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'], [
		'lint',
		'browserify'
	]);

	// Watch views
	gulp.watch(['app/index.html', 'app/views/**/*.html'], [
		'views'
	]);

	// Watch for changes in stylesheets
	gulp.watch(['app/styles/*.css','app/styles/*.scss', 'app/styles/**/*.scss'], [
		'styles'
	]);
});

// Style-sheets task
gulp.task('styles', function() {

  	return streamqueue({ objectMode: true },
            gulp.src('app/styles/*.css'),
            gulp.src('app/styles/*.scss')
            .pipe(sass({onError: function(e) {console.log(e);} }))
        )
    .pipe(concat('style.css'))
	// Add autoprefixer
	.pipe(autoprefixer())
	.pipe(gulp.dest('dist/css/'))
	.pipe(livereload());

});

// Views
gulp.task('views', function() {

	// Main view
	gulp.src('./app/index.html')
	.pipe(gulp.dest('dist/'));

	// Sub-views
	gulp.src('./app/views/**/*')
	.pipe(gulp.dest('dist/views/'))
	.pipe(livereload());
});

// Default task
gulp.task('default', ['browserify', 'views', 'styles'], function() {

});

// Devlopment server
gulp.task('dev', ['browserify', 'views', 'styles'], function() {

	var serverConfig = {
		destDir: "dist",
		serverPort: serverport,
		entryPoint: "index.html"
	};

	// Run server
	var server = require('./server');

	server.startServer(serverConfig);

  // Run the watch task, to keep taps on changes
	gulp.start('watch');
});
