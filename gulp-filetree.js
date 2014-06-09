var through = require('through2').obj;
var path = require('path');
var _ = require('lodash');
var Q = require('kew');

var File = require('vinyl');

var deep_assign = function(obj, path, value)
{
	if(path.length === 0) {
		return value;
	}

	if(typeof path === 'string')
		path = path.split('.');

	return path.reduce(function(cursor, path_entry, index)
		{
			// if last element, assign value and return original obj
			if(index === path.length - 1) {

				// extend existing object
				if(cursor[path_entry] !== undefined)
				{
					console.log(path_entry + ' exist, extending obj');
					cursor[path_entry] = _(cursor[path_entry])
						.extend(value)
						.value();

					console.log(cursor[path_entry])
				}
				// otherwise just assign
				else
					cursor[path_entry] = value;

				return obj;
			}

			// create objects for non existing path entries
			if(cursor[path_entry] === undefined)
				cursor[path_entry] = {};

			// update the cursor
			return cursor[path_entry]
		}, obj);
};

// create a 'tree' out of vinyl VFS objects
module.exports = function(options) {

    // where we keep our tree
	var state = { tree: new File() };

    if(_.isString(options))
        options = { filetree_property: options };

    options = options || {};

    // indenting for showing the tree
    options.indent = options.indent || 2;
    options.initial_indent = options.initial_indent || 1;

    // if true, it's bound to console.log
    if(options.show_tree === true)
        options.show_tree = console.log.bind(console);

    options.tree_property = options.tree_property || 'tree';

    options.node_property = options.node_property || 'node';
    options.children_property = options.children_property || 'children';

    options.order = options.order || 'bfs';

    options.map = options.map || function(tree, element) {
        // give FS tree property
        element[options.tree_property] = tree;
        return element;
    };

    // default emitter function wa
    options.emitter_fn = options.emitter_fn || function(tree, done) {

        // emit when the element has a value
        var emit = function(e) { e !== undefined && this.push(e); }.bind(this);

        // bind so mappers can `this.push(..)` multiple documents
        var map = options.map && options.map.bind(this);
        var asyncMap = options.asyncMap && options.asyncMap.bind(this);

        // synchronous map
        if(map)
        {
            // traverse the tree, mapping and then emitting each document
            traverse(tree, function(node) { emit(map(tree, node)); });

            // indicate that we are done
            done();
        }
        else
            if(asyncMap)
            {
                // walk the tree BFS, collecting promises
                var ops = traverse(tree, function(el)
                    {
                        // map and then emit function
                        return asyncMap(tree, el).then(emit);
                    });

                // wait until all promises are finished
                Q.all(ops).then(done);
            }
    };

    var traverse = function(tree, each_fn)
    {
        var stack = [[tree, 0]];
        var results = [];

        while(stack.length !== 0)
        {
            var head = stack.shift();
            var cursor = head[0];
            var depth = head[1];

            // store first result
            results.push(each_fn(cursor, depth));

            // see if there is more work to do (_ deals with undefined & dicts)
            _(cursor[options.children_property])
                .each(
                    function(elt){
                        if (options.order === 'BFS')
                            // push it to front of our stack (BFS)
                            stack.unshift([elt, depth + 1]);
                        else
                            // push it to the back
                            stack.push([elt, depth + 1]);
                    }
                );
        }

        return results;
    };

    return through(
		function(vfs, encoding, done){

			var p = vfs.relative.split(path.sep);

            // we are at the root, split gives [''], we want []
			if(p.length === 1 && p[0] === '')
				p = [];

			// [a,b,c] --> ['children',a,'children',b,'children',c]
			var P = _(p)
				.map(function(path_elt){
                    return [options.children_property, path_elt];
                })
				.flatten()
				.value();

            // update the tree
			state.tree = deep_assign(state.tree, P, vfs);

			done();
		},
		function(done){

            if(options.show_tree) {

                // "visualize" the tree
                var s = traverse(state.tree, function (node, depth) {
                    var i = options.initial_indent + (depth * options.indent);
                    var dir = node.isDirectory() ? '/' : '';
                    var basename = path.basename(node.path);
                    return new Array(i).join(' ') + basename + dir;
                });

                // show it
                options.show_tree(s.join('\n'));
            }

            // call handling function
            options.emitter_fn.bind(this)(state.tree, done);
        }
	);
};