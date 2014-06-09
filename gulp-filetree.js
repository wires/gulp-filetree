/* vim: set tw=78 ts=4: */
var path = require('path');
var through = require('through2').obj;
var Tree = require('./tree');

// create a 'tree' out of vinyl VFS objects
module.exports = function(options) {

	// where we keep our tree
	var state = { tree: new Tree('.') };

	// only set property_name or passed full options object
	if ('string' === typeof options)
		options = { property_name: options };

	// or didn't pass any options
	options =  options || {};

	options.tree_property= options.tree_property || 'tree';
	options.subtree_property = options.subtree_property || 'subtree';
	options.order = options.order || 'BFS';

	var traverse = function(root)
	{
		var stack = [root];
		var results = [];
		while(stack.length !== 0)
		{
			// pop from stack
			var cursor = stack.pop();

			// store first result
			results.push(cursor);

			// see if there is more work to do (_ deals with undefined & dicts)
			cursor.nodes.forEach(function(node)
			{
				if (options.order === 'DFS')
					// push it to the back
					stack.push(node);
				else
					// or push it to front of our stack (BFS)
					stack.unshift(node);
			});
		}
		return results;
	};

	return through(
		function(vfs, encoding, done){

			var vpath = vfs.relative;

			// when gulp.src(['test','test/a']) these files will have
			// relative paths 'test' and 'a', so in that case the
			// wrong tree is constructed => use the cwdRelative option.
			//
			// downside is that you might have to strip of some dirs
			if(options.cwdRelative)
			{
				// only the cwd is stable in a set of files
				// (and maybe not even)
				vpath = path.relative(vfs.cwd, vfs.path);
			}

			// update the tree
			state.tree.push_path(vpath, vfs);

			// done handling the 'data' event, don't emit file.
			done();
		},
		function(done){
			// collapse singleton root node
			var compact = state.tree.compact_root();

			// traverse the tree
			traverse(compact)
				// skip empty nodes
				.filter(function(node){
					return node.leaf;
				})
				// and then
				.forEach(function(node) {
					// otherwise, store the tree in the vinyl object
					node.leaf[options.tree_property] = compact;

					// it's the tree rooted at us
					var subtree = new Tree(
						node.label,
						node.leaf,
						undefined, // remove the parent
						node.nodes
					);

					node.leaf[options.subtree_property] = subtree;

					// and emit the file
					this.push(node.leaf);
				}.bind(this));

			// done handling the 'end' event
			done();
		}
	);
}