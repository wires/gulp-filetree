# Gulp VFS Tree

Not everything in this documentation works yet. Have a look at the source, Luke.
It's readable and documented! :-)

## Quickstart

Quick! Start!

	var gulp = require('gulp');
	var tree = require('gulp-filetree');

	gulp.task('default', function(){
		return gulp.src('test/**')
			.pipe(tree({show_tree: true}));
			// every file emitted from this pipe will have a 'tree' property
	});

Output

    ~/r/G/gulp-filetree » gulp
	[gulp] Using gulpfile /Users/wires/r/Gulp/gulp-filetree/gulpfile.js
	[gulp] Starting 'default'...
	test/
	  a.txt
	  b.txt
	  c/
	    d.txt
	    e.txt
	[gulp] Finished 'default' after 15 ms

### What happened?

Suppose you have this tree in a subdirectory `test`.

	.
	├── a.txt
	├── b.txt
	└── c
	    ├── d.txt
	    └── e.txt

This plugin will then compute a tree like this:

	{ children: {
	    'a.txt': <File ..>,
	    'b.txt': <File ..>,
	    'c': { // extends <File ..>,
	      children: {
	        'd.txt': <File ..>,
	        'e.txt': <File ..>
	      }
	    }
	  }
	}

You can change the shape (well, labeling) of this tree with the options
`node_property` and `children_property`. When set to 'leaf' and 'branches',
for instance, one would get:

	{ branches: {
	    'a.txt': { node: <File ..> },
	    'b.txt': { node: <File ..> },
	    'c': {
	      node: <File ..>,
	      branches: {
	      'd.txt': { node: <File ..> },
	      'e.txt': { node: <File ..> }
	      }
	    }
	  }
	}

Because we passed the option `show_tree: true`, our tree was rendered to the
console.

### Okay, then what?

Once all files are collected and a tree of them has been constructed, that
tree is traversed in the given order (`options.order`, default is BFS).

Each visited file then gets a property `tree` (option `tree_property`)
pointing to the tree and it is emitted again.

ps. This doesn't work with watch streams, yet, see issue #1.

## Options

You can set some basic options.

	 var options = {
		// (deep) property name where tree is injected
		tree_property: "meta.tree",

		// name of 'children' property used in the tree
		children_property: "_children",

		// name of 'node' property used in the tree, may be empty
		node_property: '',

	   // file emitting order: breath-first / depth-first ("DFS")
		order: "DFS"
	 };

### Showing the tree

There is a very primitive tree renderer whose output you can
pass to a function of your choice. For example

	options.show_tree = console.log.bind(console);

There is a shortcut for this

	options.show_tree = true;

### Tapping the tree, transforming the tree

Or instead you might want to dump part of the tree to a JSON file?

	var path = require('path');
	var t = require('t');

	options.intercept_tree = function(tree, tree_map) {
		var siteIndex = {}

		// this should be a persistent datastructure
		t.map(tree, function(node){ return path.basename(node.path) });

		// write to a file and pass through untouched on success.
		return Q
			.nfcall(fs.writeFile, 'siteIndex.json', JSON.stringify(siteIndex))
			.then(function(){
				return tree;
			});
	}

### Mapping function (`options.map`)

The 'assign tree property and emit' behaviour can be overwritten by
passing a custom mapping function. Here is a silly example demonstrating
the function type.

	options.map = function(node, children, tree) {
		node.meta.pipeline.tree = tree;
		return node;
	}

If `undefined` is returned, no file is emitted.

To emit more than one file, simply invocate `this.push(vinyl_object)` for
each file (and don't return anything).

### Asynchronous mapping (`options.asyncMap`)

You can map asynchronously using Promises.
Just assign a function that returns a Promise to `options.asyncMap`.

	options.asyncMap = function(tree, node){
	   return Q.delay(100)
	      .then(function(){
	         return node;
	      });
	});

Behaviour based on return value is similar to `options.map` and `this.push`
is also available.

### Getting funky with the mapping function.

To work with trees you can use [`t`](https://github.com/aaronj1335/t-js). It is
a library that does tree traversals.

To restrict the tree to a subtree rooted at that file, we can do this

	options.map = function(node, children, tree) {
		var subtree = t.find(tree, function(n, parent){
			return node.path === n.path;
		});
		node[options.tree_property] = subtree;
		return node;
	}

Etc.