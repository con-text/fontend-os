var gulp 				= require('gulp'),
	gutil 				= require('gulp-util'),
	jshint 				= require('gulp-jshint'),
	browserify 		= require('gulp-browserify'),
	concat 				= require('gulp-concat'),
	clean  				= require('gulp-clean'),
	less  				= require('gulp-less'),
	autoprefixer  = require('gulp-autoprefixer'),
	streamqueue  	= require('streamqueue'),
	react  				= require('gulp-react'),
	reactify  		= require('reactify'),
	mocha  				= require('gulp-mocha'),
	zip  					= require('gulp-zip'),
	path  				= require('path'),
	gulpFilter  	= require('gulp-filter'),
	fs  					= require('fs'),
	s3  					= require("gulp-s3"),
	del  					= require('del'),
	imagemin  		= require('gulp-imagemin'),
	browserSync  	= require('browser-sync'),
	reload      	= browserSync.reload;

// Clean
gulp.task('clean', function() {
	del(['dist/', 'build/', 'npm-debug.log']);
});

gulp.task('lint:apps', function() {
	return gulp.src('./apps/**/*.js')
		.pipe(react())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint:client', function() {
	return gulp.src(['./client/scripts/**/*.js', './client/scripts/main.js'])
		.pipe(react())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

// JSHint task - detects errors and problems in JS code
gulp.task('lint:server', function() {
   return gulp.src([
		'server.js',
		'./server/**/*.js'
	 ])
	.pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

// JSHint task for tests
gulp.task('lint:tests', function() {
	return gulp.src(['./tests/**/*.js'])
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint', ['lint:tests', 'lint:server', 'lint:client', 'lint:apps']);

// Browserify task
gulp.task('browserify:client',  function() {
	// Main entry point
	return gulp.src(['client/scripts/main.js'])
	.pipe(browserify({
		insertGlobals: true,
		debug: true,
		transform: ['reactify'],
		extensions: ['.js', '.jsx']
	}))
	// Concatinate into one file
	.pipe(concat("bundle.js"))
	// Output to destination directory
	.pipe(gulp.dest("dist/js"));
});

//copy the state interface api into the dist folder without concatenating it
gulp.task('copy-stateinterface', function(){
	return gulp.src(['client/scripts/utils/StateInterface.js'], { read: false })
		.pipe(browserify({
			insertGlobals: true,
			debug: true,
			standalone: 'AppState'
		}))
		.pipe(concat("StateInterface.js"))
		.pipe(gulp.dest("dist/js"));
});

gulp.task('bundle-stateinterface-helpers', function(){
	return gulp.src([ 'client/scripts/utils/DifMatchPatch.js','client/scripts/utils/OperationalTransformation.js'])
		.pipe(gulp.dest("dist/js"));
});

// Copy bower components
gulp.task('copy-bower', function() {
	return gulp.src('bower_components/**/*')
	.pipe(gulp.dest('dist/vendor'));
});

gulp.task('browserify', ['browserify:client', 'browserify:apps']);

// Watch task
gulp.task('watch', ['build'], function() {

	// Watch scripts folders
	gulp.watch(['client/scripts/*.+(js|jsx)', 'client/scripts/**/*.+(js|jsx)'], [
		'lint',
		'browserify',
		'copy-stateinterface', browserSync.reload]);

	gulp.watch(['apps/**/*.js', 'apps/**/manifest.json', 'apps/**/index.html'], [
		'lint',
		'browserify:apps', browserSync.reload
	]);

	// Watch views
	gulp.watch(['client/index.html', 'client/views/**/*.html'], [
		'views'
	]);

	// Watch for changes in stylesheets
	gulp.watch(['client/styles/*.css','client/styles/*.less', 'client/styles/**/*.less'], [
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
		.pipe(reload({stream: true}));
});

// Views
gulp.task('views', function() {

	// Main view
	gulp.src('./client/index.html')
	.pipe(gulp.dest('dist/'));

	// Sub-views
	gulp.src('./client/views/**/*')
	.pipe(gulp.dest('dist/views/'))
	.pipe(reload({stream: true}));
});

// Default task
gulp.task('default', ['dev'], function() {
});

gulp.task('browserify:apps', ['lint:apps'], function() {

	var outputDir = "dist/apps";

	// Reactify apps
	gulp.src(['apps/**/*.js'])
		.pipe(react())
		.pipe(gulp.dest(outputDir));

	// Copy manifests
	gulp.src(['apps/**/manifest.json'])
		.pipe(gulp.dest(outputDir));

	// Copy assets
	gulp.src(['apps/**/*.png', 'apps/**/*.jpg'])
		.pipe(gulp.dest(outputDir));

	gulp.src(['apps/**/index.html'])
		.pipe(gulp.dest(outputDir));
});

// Tests
gulp.task('test', ['build'], function() {

	return gulp.src('./test/test.js')
		.pipe(mocha());

});

gulp.task('build', ['copy-bower', 'lint', 'browserify', 'views', 'styles',
	'images', 'copy-stateinterface', 'bundle-stateinterface-helpers']);

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

gulp.task('images', function() {
	return gulp.src('client/images/*')
		.pipe(imagemin({
				progressive: true
		}))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('push', ['package'], function(){
	var aws = JSON.parse(fs.readFileSync('./awsconfig.json'));
	gulp.src('./build/build.zip')
	    .pipe(s3({key: aws.AWSAccessKey, secret: aws.AWSSecretAccessKey, bucket: aws.BUCKET, region: aws.AWSRegion}));
});

// Attach Browser Sync to the dev server
gulp.task('serve', ['dev'], function() {
	browserSync({
		proxy: {
			target: "localhost:5000",
			reqHeaders: function(config) {
				return {
					"host":            "localhost:3000",
					"accept-encoding": "identity",
					"agent":           false
				};
			}
		},
		socket: {
			namespace: function (namespace) {
					return "localhost:3002" + namespace;
			}
		}
	});
});

// Devlopment server
gulp.task('dev', ['build'], function() {

	var serverConfig = {
		destDir: "dist",
		serverPort: 5000,
		entryPoint: "index.html"
	};

	// Run server
	require('./server');

  // Run the watch task, to keep taps on changes
	gulp.start('watch');
});
