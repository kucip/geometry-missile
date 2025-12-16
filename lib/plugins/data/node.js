/**
 *  Node
 *
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 __MyCompanyName__. All rights reserved.
 */
ig.module('plugins.data.node')
.requires(
)
.defines(function () {
    Node = ig.Class.extend({
		data:null,
		/*
		* Thinking of links to other nodes
		* there can be 0 or more links to other nodes
		*/
		links:[],//the links to other nodes
		
		init: function (data,ancestor)
		{
			this.data = data;
        },
    });
	
});