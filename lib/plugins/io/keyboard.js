
/*
* Game's gamepad, contains the bindings you wish
*/
ig.module(
	'plugins.io.keyboard'
)
.requires(
)
.defines(function(){

	Keyboard = ig.Class.extend({
		bindings:{
			PREVENT_PAGE_SCROLLING_OVER_IFRAME:[ig.KEY.UP_ARROW,ig.KEY.DOWN_ARROW,ig.KEY.LEFT_ARROW,ig.KEY.RIGHT_ARROW,ig.KEY.PAGE_UP,ig.KEY.PAGE_DOWN],

			up:[ig.KEY.W,ig.KEY.UP_ARROW],
			right:[ig.KEY.D,ig.KEY.RIGHT_ARROW],
			left:[ig.KEY.A,ig.KEY.LEFT_ARROW],
			down:[ig.KEY.S,ig.KEY.DOWN_ARROW],
			delete:[ig.KEY.DELETE,ig.KEY.BACKSPACE],
		},
		init:function()
		{
			// Keyboard	
			for(var key in this.bindings)
			{
				this[key] = key;
				for(var i = 0;i<this.bindings[key].length;i++)
				{
					ig.input.bind(this.bindings[key][i],key);
				}
			}
		},
	});
});