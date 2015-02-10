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
	path = require('path'),
	gulpFilter = require('gulp-filter'),
	fs = require('fs');


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
	return gulp.src(['client/scripts/main.js'])
	.pipe(browserify({
		insertGlobals: true,
		debug: true,
		transform: ['reactify']
	}))
	// Concatinate into one file
	.pipe(concat("bundle.js"))
	// Output to destination directory
	.pipe(gulp.dest("dist/js"));

});

// Copy bower components
gulp.task('copy-bower', function() {
	gulp.src('bower_components/**/*')
	.pipe(gulp.dest('dist/vendor'));

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

gulp.task('browserify-apps', ['lint'], function() {

	var outputDir = "dist/apps";

	// Reactify apps
	gulp.src(['apps/**/*.js'])
		.pipe(react())
		.pipe(gulp.dest(outputDir));

	// Copy manifests
	gulp.src(['apps/**/manifest.json'])
		.pipe(gulp.dest(outputDir));
});

// Tests
gulp.task('test', ['lint-tests', 'browserify', 'browserify-apps'], function() {

	gulp.src('./test/test.js')
		.pipe(mocha());

});

gulp.task('build', ['test', 'copy-bower', 'browserify-apps', 'browserify', 'views', 'styles']);

// Prepare the package
gulp.task('package', ['build'], function(){
	var d = new Date();
	var productionDep = fs.readFileSync( "package.json" );
		productionDep = JSON.parse(productionDep);
		productionDep = productionDep.dependencies;

	var filterFolders = ['dist/**/*', 'server/*', 'server.js', 'bleservice.js', 'config/*'];

	for(var k in productionDep){
		if(productionDep.hasOwnProperty(k)){
			filterFolders.push("node_modules/"+k+"/**/*");
		}
	}

	return gulp.src(['**/*']).
		pipe(gulpFilter(filterFolders)).
		pipe(zip("build.zip")).
		pipe(gulp.dest('build'));

});

// Devlopment server
gulp.task('dev', ['browserify', 'copy-bower', 'views', 'styles'], function() {

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
