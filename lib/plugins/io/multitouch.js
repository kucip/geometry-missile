ig.module(
	'plugins.io.multitouch'
)
.requires(
)
.defines(function(){

	Multitouch = ig.Class.extend({
		init:function()
		{
			ig.multitouchInput.start()
		},
		
		getTouchesPos:function()
		{
			if(ig.ua.mobile) //a mobile device
			{
				if(ig.multitouchInput.touches.length>0)
				{
					var touchesPos=[];
					for (var ti = 0; ti < ig.multitouchInput.touches.length; ti++) 
					{
						var touch = ig.multitouchInput.touches[ti];

						var touchX=touch.x;
						var touchY=touch.y;

						touchesPos.push({x:touchX,y:touchY});
					}
					return touchesPos;
				}
				else
				{
					return null;
				}
			}
		}
	});

});