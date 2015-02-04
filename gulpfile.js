var gulp = require('gulp'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	browserify = require('gulp-browserify'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	streamqueue = require('streamqueue'),
	reactify = require('reactify');

// Live reload server depenencies
var embedlr = require('gulp-embedlr'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
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

// Notify Livereload
function notifyLr(e) {
	var fileName = require('path').relative(__dirname, e.path);
	console.log("File changed", filename)
	lrserver.changed({
		body: {
			files: [fileName]
		}
	});
}

// Watch task
gulp.task('watch', ['lint'], function() {

	// Watch scripts folders
	gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'], [
		'lint',
		'browserify'
	], notifyLr);

	// Watch views
	gulp.watch(['app/index.html', 'app/views/**/*.html'], [
		'views'
	], notifyLr);

	// Watch for changes in stylesheets
	gulp.watch(['app/styles/*.css','app/styles/*.scss', 'app/styles/**/*.scss'], [
		'styles'
	], notifyLr);
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
});

// Views
gulp.task('views', function() {

	// Main view
	gulp.src('./app/index.html')
	.pipe(gulp.dest('dist/'));

	// Sub-views
	gulp.src('./app/views/**/*')
	.pipe(gulp.dest('dist/views/'));
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

	server.startServer(serverConfig, function(express, startServer) {

		// Extra config
		// Add live reload
		express.use(livereload({port: livereloadport}));

		// Start the server
		startServer();

	}, onServerStarted);

    // Run the watch task, to keep taps on changes
    gulp.start('watch');
});

function onServerStarted () {
	console.log("Starting live reload server at port " + livereloadport);
	lrserver.listen(livereloadport);
}
