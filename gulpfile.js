// demo gulpfile

var gulp = require('gulp');
var tree = require('./gulp-filetree');
var $ = require('gulp-load-plugins')();
var archy = require('archy');

/*

 So suppose we have the following `test/` dir

 test
 ├── a.txt
 ├── b.txt
 └── c
     ├── d.txt
     └── e.txt

 Or quickly create it

 $ mkdir -p test/c; touch test/a.txt test/b.txt test/c/d.txt test/c/e.txt

 */

gulp.task('test-cwd-relative', function(){
	return gulp.src(['test/', 'test/a.txt'])
		.pipe(tree({cwdRelative: true}))
		.pipe($.debug())
		.pipe($.map(function(file){
			console.log('tree:\n' + archy(file.tree));
			console.log('subtree:\n' + archy(file.subtree));
			return file;
		}));

	/*
	 $ gulp test-cwd-relative
	 [21:17:14] Using gulpfile ~/r/Gulp/gulp-filetree/gulpfile.js
	 [21:17:14] Starting 'test-cwd-relative'...
	 [21:17:14] gulp-debug: (2014-06-09 19:17:14 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/
	 path:     ~/r/Gulp/gulp-filetree/test
	 tree:
	 test
	 └── a.txt

	 subtree:
	 test
	 └── a.txt

	 [21:17:14] gulp-debug: (2014-06-09 19:17:14 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/a.txt
	 contents: ...

	 tree:
	 test
	 └── a.txt

	 subtree:
	 a.txt

	 [21:17:14] gulp-debug: end event fired (2014-06-09 19:17:14 UTC)
	 [21:17:14] Finished 'test-cwd-relative' after 108 ms

	 */
});

gulp.task('test-show-need-for-relative', function(){
	return gulp.src(['test/', 'test/a.txt'])
		.pipe(tree())
		.pipe($.debug())
		.pipe($.map(function(file){
			console.log('tree:\n' + archy(file.tree));
			console.log('subtree:\n' + archy(file.subtree));
			return file;
		}));
	/*

	 $ gulp test-show-need-for-relative
	 [21:18:07] Using gulpfile ~/r/Gulp/gulp-filetree/gulpfile.js
	 [21:18:07] Starting 'test-show-need-for-relative'...
	 [21:18:08] gulp-debug: (2014-06-09 19:18:08 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/
	 path:     ~/r/Gulp/gulp-filetree/test
	 tree:
	 .
	 ├── test
	 └── a.txt

	 subtree:
	 test

	 [21:18:08] gulp-debug: (2014-06-09 19:18:08 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/a.txt
	 contents: ...

	 tree:
	 .
	 ├── test
	 └── a.txt

	 subtree:
	 a.txt

	 [21:18:08] gulp-debug: end event fired (2014-06-09 19:18:08 UTC)
	 [21:18:08] Finished 'test-show-need-for-relative' after 107 ms

	 */
});

gulp.task('test-with-directories', function(){
	return gulp.src(['test/**'])
		.pipe(tree())
		.pipe($.debug())
		.pipe($.map(function(file){
			console.log('tree:\n' + archy(file.tree));
			console.log('subtree:\n' + archy(file.subtree));
			return file;
		}));

	/*

	 $ gulp test-with-directories
	 [21:22:49] Using gulpfile ~/r/Gulp/gulp-filetree/gulpfile.js
	 [21:22:49] Starting 'test-with-directories'...
	 [21:22:49] gulp-debug: (2014-06-09 19:22:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test
	 tree:
	 .
	 ├──
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:


	 [21:22:49] gulp-debug: (2014-06-09 19:22:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/a.txt
	 contents: ...

	 tree:
	 .
	 ├──
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 a.txt

	 [21:22:49] gulp-debug: (2014-06-09 19:22:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/b.txt
	 contents: ...

	 tree:
	 .
	 ├──
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 b.txt

	 [21:22:49] gulp-debug: (2014-06-09 19:22:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/c
	 tree:
	 .
	 ├──
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 c
	 ├── d.txt
	 └── e.txt

	 [21:22:49] gulp-debug: (2014-06-09 19:22:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/c/d.txt
	 contents: ...

	 tree:
	 .
	 ├──
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 d.txt

	 [21:22:49] gulp-debug: (2014-06-09 19:22:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/c/e.txt
	 contents: ...

	 tree:
	 .
	 ├──
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 e.txt

	 [21:22:49] gulp-debug: end event fired (2014-06-09 19:22:49 UTC)
	 [21:22:49] Finished 'test-with-directories' after 107 ms

	 */
});

gulp.task('test-files-only', function(){
	return gulp.src(['test/**/*.txt'])
		.pipe(tree())
		.pipe($.debug())
		.pipe($.map(function(file){
			console.log('tree:\n' + archy(file.tree));
			console.log('subtree:\n' + archy(file.subtree));
			return file;
		}));

	/*

	 gulp test-files-only
	 [21:25:49] Using gulpfile ~/r/Gulp/gulp-filetree/gulpfile.js
	 [21:25:49] Starting 'test-files-only'...
	 [21:25:49] gulp-debug: (2014-06-09 19:25:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/a.txt
	 contents: ...

	 tree:
	 .
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 a.txt

	 [21:25:49] gulp-debug: (2014-06-09 19:25:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/b.txt
	 contents: ...

	 tree:
	 .
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 b.txt

	 [21:25:49] gulp-debug: (2014-06-09 19:25:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/c/d.txt
	 contents: ...

	 tree:
	 .
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 d.txt

	 [21:25:49] gulp-debug: (2014-06-09 19:25:49 UTC)

	 File
	 cwd:      ~/r/Gulp/gulp-filetree
	 base:     ~/r/Gulp/gulp-filetree/test/
	 path:     ~/r/Gulp/gulp-filetree/test/c/e.txt
	 contents: ...

	 tree:
	 .
	 ├── a.txt
	 ├── b.txt
	 └─┬ c
	   ├── d.txt
	   └── e.txt

	 subtree:
	 e.txt

	 [21:25:49] gulp-debug: end event fired (2014-06-09 19:25:49 UTC)
	 [21:25:49] Finished 'test-files-only' after 106 ms

	 */
});

gulp.task('default', [
	'test-cwd-relative',
	'test-show-need-for-relative',
	'test-with-directories',
	'test-files-only'
]);