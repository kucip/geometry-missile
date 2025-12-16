/**
 *  Circle2
 *
 *  Created by Fedy Yapary on 2016-10-21.
 */
ig.module('plugins.data.circle')
.requires(
	'plugins.data.vector'
)
.defines(function () {
    Circle = ig.Class.extend({
		center:new Vector2(0,0),
		velocity:new Vector2(0,0),
		mass: 0,
		radius:0,
		diameter:0,
		init: function (center,radius, velocity, mass){
            if(!isNaN(center))
            {
                this.center = center;
            }
            if(!isNaN(radius))
            {
    			this.radius=radius;
    			this.diameter= 2*this.radius;
            }
            if(!isNaN(velocity))
            {

    			this.velocity = velocity;
            }
            if(!isNaN(mass))
            {
    			this.mass = mass;
            }
        },
    });
});
