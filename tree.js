var path = require('path');

/** Treenode,
 *
 *  Has properties:
 *
 *   - 'leaf': the value at the node, can be anything
 *   - 'label': string
 *   - 'parent': parent of this node (Treenode) or undefined for the root
 *   - 'nodes': this nodes children, Array or Treenode's
 *
 *  Has methods:
 *
 *   - 'find_child(label)': find child node by label
 *
 *   - 'child(label, value)': insert or update 'leaf' property of child
 *                            with matching label
 *
 *   - 'push_path(path, value)': deep update a 'leaf' value, path is an
 *                               array of labels, starting at the root.
 *
 *   - 'depth()': depth of the node (recursive function, so stackoverflows
 *     with deep trees
 *
 *   - 'is_leaf()': true if node has no children
 *
 *   - 'is_last_child()': true if node is the last child of it's parent
 */

var Tree = function (label, leaf, parent, nodes)
{
	if(label === undefined)
		throw new Error('each node must at least have a label attribute');

	this.nodes = nodes || [];
	this.label = label;
	this.leaf = leaf;
	this.parent = parent;
};

Tree.prototype.find_child = function(label)
{
	for(var i in this.nodes)
		if (this.nodes[i].label === label)
			return this.nodes[i];
};

Tree.prototype.child = function(label, leaf)
{
	// can we find child with this label?
	for(var i in this.nodes)
		if (this.nodes[i].label === label)
		{
			// optionally update the leaf
			if(leaf !== undefined)
				this.nodes[i].leaf = leaf;

			return this.nodes[i];
		}

	// nope, create new one
	var newNode = new Tree(label, leaf, this);
	this.nodes.push(newNode);
	return newNode;
};

Tree.prototype.depth = function() {
	if(!this.parent)
		return 0;

	return this.parent.depth() + 1;
};

Tree.prototype.is_leaf = function() {
	return this.nodes.length === 0;
};

Tree.prototype.is_singleton = function() {
	return this.nodes.length === 1;
};

Tree.prototype.is_last_child = function() {
	if(!this.parent)
		return true;

	var c = this.parent.nodes;
	for(var i in c)
		if (c[i].label === this.label)
			return (c.length - 1) == i;

	return false;
};


Tree.prototype.push_path = function (label_path, data) {
	// split strings by path.sep
	if('string' === typeof label_path)
		label_path = label_path
			.split(path.sep);

	var cursor = this;
	var last_path = label_path.pop();

	// step down path, updating cursor
	for(var i in label_path)
		cursor = cursor.child(label_path[i]);

	// create node or update data on the last path
	return cursor.child(last_path, data);
};

Tree.prototype.compact_root = function() {
	if(this.is_singleton())
		return this.nodes[0];
	return this;
};

module.exports = Tree;