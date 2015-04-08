var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var del = require('del');
var exec = require('child_process').exec;
var nodemon = require('gulp-nodemon');

gulp.task('coffeeWatch', function() {
	var coffeeWatcher = gulp.watch('./client/*.coffee', ['cleanjs','coffee']);
	coffeeWatcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});

gulp.task('coffee', function() {
  gulp.src('./client/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./client/'))
});

gulp.task('cleanjs', function(){
	del(['./client/*.js']);
});

gulp.task('browserMe', function(){
	exec('start http://localhost:5000');
});

gulp.task('node-server', function () {
  nodemon({
	    script: 'server.js'
	  , ext: 'js html'
	  , env: { 'NODE_ENV': 'development' }
  })
  .on('start', ['coffeeWatch']) //why doesn't this work?
  .on('change', ['coffeeWatch'])
  .on('restart', function(){
  	console.log('reset server');
  });
});

gulp.task('default', ['cleanjs', 'coffee', 'coffeeWatch', 'node-server', 'browserMe']);