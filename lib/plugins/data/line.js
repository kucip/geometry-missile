/**
 *  Line
 *
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 __MyCompanyName__. All rights reserved.
 */
ig.module('plugins.data.line')
.requires(
	'plugins.data.vector'
)
.defines(function () {
    Line = ig.Class.extend({
		v1:new Vector2(0,0),
		v2:new Vector2(0,0),
		init: function (v1,v2)
		{
			if(typeof(v1) === "object"
				&& !isNaN(v1.y)
				&& !isNaN(v1.y))
			{
				//Make a new copy rather then refer by reference 
				//so we can keep the original vectors
				this.v1=new Vector2(v1.x,v1.y);
			}
			if(typeof(v2) === "object"
				&& !isNaN(v2.x)
				&& !isNaN(v2.y))
			{

				this.v2=new Vector2(v2.x,v2.y);
			}
        },
    });
});