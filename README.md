# Gulp VFS Tree

Not everything in this documentation works yet. Have a look at the source, Luke.
It's readable and documented! :-)

## Quickstart

Quick! Start!

	$ npm i --save-dev gulp-load-plugins gulp-map gulp-filetree archy

Quick, edit `gulpfile.js`!

```js
var gulp = require('gulp');
var archy = require('archy');
var $ = require('gulp-load-plugins')();

gulp.task('default', function(){
	var once = true; // lalz0r
	return gulp.src('node_modules/gulp-map/**')
		.pipe($.map(function(file){
			if(file.path.match(/package\.json/))
				return file
		}))
		.pipe($.filetree({cwdRelative: true}))
		.pipe($.map(function(file){
			// file.tree: tree of files passed into $.filetree
			// file.subtree: subtree rooted at this file

			if(once) {
				console.log(archy(file.tree));
				once = !once;
			}

			return file;
		}))
});
```

Output

    [22:01:01] Using gulpfile /tmp/test/gulpfile.js
    [22:01:01] Starting 'default'...
    node_modules
    └─┬ gulp-map
      ├── package.json
      └─┬ node_modules
        ├─┬ is-promise
        │ └── package.json
        ├─┬ kew
        │ └── package.json
        └─┬ through2
          ├── package.json
          └─┬ node_modules
            ├─┬ readable-stream
            │ ├── package.json
            │ └─┬ node_modules
            │   ├─┬ core-util-is
            │   │ └── package.json
            │   ├─┬ inherits
            │   │ └── package.json
            │   ├─┬ isarray
            │   │ └── package.json
            │   └─┬ string_decoder
            │     └── package.json
            └─┬ xtend
              └── package.json

    [22:01:01] Finished 'default' after 81 ms

### What happened?

Suppose you have this tree in a subdirectory `test`.

	.
	├── a.txt
	├── b.txt
	└── c
	    ├── d.txt
	    └── e.txt

This plugin will then compute a tree like this:

```js
	{ label: '.',
	  leaf: undefined,
	  parent: undefined,
	  nodes: [
		  { label: 'a.txt',
		    leaf: <File ..>,
		    parent: <Tree ..>, // reference
		    nodes: []
		  },
		  { label: 'b.txt',
		    leaf: <File ..>,
		    parent: <Tree ..>, // reference
		    nodes: [ { label: 'd.txt', ... } ,
		             { label: 'e.txt', ... } ]
	      }
	  ]
	}
```

This tree is then used to add properties 'tree' and 'subtree' to the files
passing though this filter.

### Okay, then what?

Once all files are collected and a tree of them has been constructed, that
tree is traversed in the given order (`options.order`, default is BFS).

Each visited file then gets a property `tree` (option `tree_property`)
pointing to the complete tree.

The is also a property `subtree` (option `subtree_property`),
which has the tree restricted to the subtree rooted at that file.

## Options

You can set some basic options.

```js
var options = {
	// name of the 'tree' property
	tree_property: "tree",

	// name of 'subtree' property
	subtree_property: "subtree",

	// file emitting order: breath-first / depth-first ("DFS")
	order: "DFS",

	// compute filepath path relative to current working directory
	cwdRelative: true // relative to file.base path if false
};
```

### Showing the tree

Archy can render it fine. Pretty-tree doesn't like the circular structure
of the `parent` and `leaf.tree`/`leaf.subtree` properties.

### Tapping the tree, transforming the tree

I've had limited succes with [`t`](https://github.com/aaronj1335/t-js).
Traversals work, mapping doesn't. Be sure to pass the option
`{childName:'nodes'}`.


```js
var path = require('path');
var t = require('t');

.pipe($.map(function(file){
	// this should be a persistent datastructure
	t.bfs(file.subtree, function(node){
		var basename = path.basename(node.leaf.path);
		console.log('\t' + basename);
	});
});

// this below fo sho doesn't work, but I want to be able to do this
.pipe($.map(function(file){
	// write to a file and pass through untouched on success.
	return Q
		.nfcall(fs.writeFile,
			'siteIndex.json',
			JSON.stringify(file.tree)
		))
		.then(function(){
			return tree;
		});
}
```
