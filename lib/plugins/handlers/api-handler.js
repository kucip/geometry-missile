/*
* To make handling of api's easier we are going to need a handler
* You have access to all globals and also additional stuff to define
*/
ig.module(
	'plugins.handlers.api-handler'
)
.requires(
)
.defines(function(){
	ig.ApiHandler = ig.Class.extend({
		
		apiAvailable:{
			MJSPreroll:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS 
							&& _SETTINGS['Ad']['Mobile']['Preroll']['Enabled'])
						{
							MobileAdInGamePreroll.Initialize();
						}
					}
				}
			},
			
			MJSHeader:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS['Ad']['Mobile']['Header']['Enabled'])
						{
							MobileAdInGameHeader.Initialize();
						}
					}
				}
			},
			
			MJSFooter:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS['Ad']['Mobile']['Footer']['Enabled'])
						{
							MobileAdInGameFooter.Initialize();
						}
					}
				}
			},
			
			MJSEnd:function()
			{
				if(ig.ua.mobile)
				{
					if(ig.domHandler.JQUERYAVAILABLE)
					{
						if(_SETTINGS['Ad']['Mobile']['End']['Enabled'])
						{
							MobileAdInGameEnd.Initialize();
						}
					}
				}
			}
		},
		
		run:function(apiId,params)
		{
			if(this.apiAvailable[apiId])
			{
				this.apiAvailable[apiId](params);
			}
		}
	});	
});