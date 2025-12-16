/*
* Game's gamepad, contains the bindings you wish
*/
ig.module(
	'plugins.io.mouse'
)
.requires(
	'plugins.data.vector'
)
.defines(function(){

	Mouse = ig.Class.extend({
		pos: new Vector2 (0, 0), 
		bindings:{
			click:[ig.KEY.MOUSE1, ig.KEY.SPACE, ig.KEY.ENTER],
			rClick:[ig.KEY.MOUSE2],
		},
		init:function()
		{
			// Mouse
			ig.input.initMouse();
			for(var key in this.bindings)
			{
				this[key] = key;
				for(var i = 0;i<this.bindings[key].length;i++)
				{
					ig.input.bind(this.bindings[key][i],key);
				}
			}
		},
		getLast:function()
		{
			return this.pos;
		},
		getPos:function()
		{
			var internalWidth = ig.system.canvas.offsetWidth || ig.system.realWidth;
			var scale = ig.system.scale * (internalWidth / ig.system.realWidth);

			var currentMousePosX = ig.input.mouse.x * scale; 
			var currentMousePosY = ig.input.mouse.y * scale; 
			
			this.pos.set(
				currentMousePosX/ig.sizeHandler.sizeRatio.x/ig.sizeHandler.scaleRatioMultiplier.x, 
				currentMousePosY/ig.sizeHandler.sizeRatio.y/ig.sizeHandler.scaleRatioMultiplier.y 
			);
			
			return this.pos.clone();
		}
	});
});