/*
* Game's gamepad, contains the bindings you wish
*/
ig.module(
	'plugins.io.gamepad'
)
.requires(
    'plugins.io.gamepad-input'
)
.defines(function(){

	Gamepad = ig.Class.extend({
		
		bindings:{
			padJump:[ig.PADKEY.BUTTON_0],
		},
		
		init:function()
		{
			ig.gamepadInput.start();
			for(var key in this.bindings)
			{
				for(var i = 0;i<this.bindings[key].length;i++)
				{
					ig.gamepadInput.bind(this.bindings[key][i],key);
				}
			}
		},
		press:function(key)
		{
		},
		held:function(key)
		{
		},
		release:function(key)
		{
		},
	});
});