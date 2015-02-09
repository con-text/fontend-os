var gulp = require('gulp'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	browserify = require('gulp-browserify'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	streamqueue = require('streamqueue'),
	react = require('gulp-react'),
	reactify = require('reactify'),
	mocha = require('gulp-mocha'),
	zip = require('gulp-zip'),
	path = require('path');

// Live reload server depenencies
var embedlr = require('gulp-embedlr'),
		livereload = require('gulp-livereload'),
    serverport = 5000;

// JSHint task - detects errors and problems in JS code
gulp.task('lint', function() {
  gulp.src(['server.js',
		'./client/scripts/**/*.js',
		'./client/scripts/main.js',
		'./server/**/*.js'
	 ])
	.pipe(react())
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

// JSHint task for tests
gulp.task('lint-tests', function() {
	gulp.src(['./tests/**/*.js'])
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

// Browserify task
gulp.task('browserify', function() {

	// Main entry point
	gulp.src(['client/scripts/main.js'])
	.pipe(browserify({
		insertGlobals: true,
		debug: true,
		transform: ['reactify'],
		shim: {
			jquery: {
				path: 'client/vendor/jquery/jquery-2.1.3.min.js',
				exports: '$'
			},
			ventus: {
				path: 'client/vendor/ventus/ventus.min.js',
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
	gulp.watch(['client/scripts/*.js', 'client/scripts/**/*.js'], [
		'lint',
		'browserify'
	]);

	// Watch views
	gulp.watch(['client/index.html', 'client/views/**/*.html'], [
		'views'
	]);

	// Watch for changes in stylesheets
	gulp.watch(['client/styles/*.css','client/styles/*.scss', 'client/styles/**/*.scss'], [
		'styles'
	]);
});

// Style-sheets task
gulp.task('styles', function() {

  	return streamqueue({ objectMode: true },
            gulp.src('client/styles/*.css'),
            gulp.src(['client/styles/main.less'])
            .pipe(less())
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
	gulp.src('./client/index.html')
	.pipe(gulp.dest('dist/'));

	// Sub-views
	gulp.src('./client/views/**/*')
	.pipe(gulp.dest('dist/views/'))
	.pipe(livereload());
});

// Default task
gulp.task('default', ['browserify', 'views', 'styles'], function() {

});

// Tests
gulp.task('test', ['lint','lint-tests'], function() {

	return gulp.src('./test/test.js')
	.pipe(mocha());

});

gulp.task('build', ['test', 'browserify', 'views', 'styles']);

// Prepare the package
gulp.task('package', ['build'], function(){
	return gulp.src(['apps/**/*', 'dist/**/*', 'server/**/*', 'server.js']).
	pipe(zip('build.zip')).
	pipe(gulp.dest('build'));
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
