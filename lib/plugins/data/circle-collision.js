/**
 *  Circle-Collision
 *
 *  Created by Fedy Yapary on 2016-10-21.
 */
ig.module('plugins.data.circle-collision')
.requires(
	'plugins.data.vector'
)
.defines(function () {
    CircleCollision = ig.Class.extend({
		velA: 0,
		velB: 0,

		init: function (circle1, circle2){
			this.collisionResult(circle1, circle2);
        },
        /**
        * Collision Result
        * @PARAMS
        * a, first circle
        * b, second circle
        * @RETURNS
        * A Circle Collision object with mutated velA and velB which
        * gives the result of the collision of the circle
        */
		collisionResult: function(a, b){
			var n = b.center.subtract(a.center);
			var un = n.unitVector();
			var ut = new Vector2(-un.y, un.x);

			var v1n = un.dotProduct(a.velocity);
			var v2n = un.dotProduct(b.velocity);
			var v1t = ut.dotProduct(a.velocity);
			var v2t = ut.dotProduct(b.velocity);

			var v1nPrime = (v1n * (a.mass - b.mass) + 2 * b.mass * v2n) / (a.mass + b.mass);
			var v2nPrime = (v2n * (b.mass - a.mass) + 2 * a.mass * v1n) / (a.mass + b.mass);
			var v1tPrime = v1t;
			var v2tPrime = v2t;

			var v_v1n = un.multiplyByScalar(v1nPrime);
			var v_v1t = ut.multiplyByScalar(v1tPrime);
			var v_v2n = un.multiplyByScalar(v2nPrime);
			var v_v2t = ut.multiplyByScalar(v2tPrime);

			this.velA = v_v1n.add(v_v1t);
			this.velB = v_v2n.add(v_v2t);
            return this;
		}
    });
});
