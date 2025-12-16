/**
* Entity patch to ignore the res position update in entity
*/

ig.module(
    "plugins.patches.entity-patch"
).requires(
	'impact.entity'
).defines(function () {
    //inject
    ig.Entity.inject({
    	handleMovementTrace: function( res ) {
    		this.standing = false;

    		if( res.collision.y ) {
    			if( this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity ) {
    				this.vel.y *= -this.bounciness;				
    			}
    			else {
    				if( this.vel.y > 0 ) {
    					this.standing = true;
    				}
    				this.vel.y = 0;
    			}
    		}
    		if( res.collision.x ) {
    			if( this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity ) {
    				this.vel.x *= -this.bounciness;				
    			}
    			else {
    				this.vel.x = 0;
    			}
    		}
    		if( res.collision.slope ) {
    			var s = res.collision.slope;
			
    			if( this.bounciness > 0 ) {
    				var proj = this.vel.x * s.nx + this.vel.y * s.ny;
				
    				this.vel.x = (this.vel.x - s.nx * proj * 2) * this.bounciness;
    				this.vel.y = (this.vel.y - s.ny * proj * 2) * this.bounciness;
    			}
    			else {
    				var lengthSquared = s.x * s.x + s.y * s.y;
    				var dot = (this.vel.x * s.x + this.vel.y * s.y)/lengthSquared;
				
    				this.vel.x = s.x * dot;
    				this.vel.y = s.y * dot;
				
    				var angle = Math.atan2( s.x, s.y );
    				if( angle > this.slopeStanding.min && angle < this.slopeStanding.max ) {
    					this.standing = true;
    				}
    			}
    		}
		    this.pos.x = res.pos.x;
            this.pos.y = res.pos.y;
    	},

		update:function(){
			this.parent();

			if (this.clickableLayer !== null && typeof(this.clickableLayer) !== 'undefined') {
				if (this.clickableLayer.update !== null && typeof(this.clickableLayer.update) === 'function') {
					this.clickableLayer.update(this.pos.x, this.pos.y, this.size.x, this.size.y);
				}
			}
		}
    })
});
