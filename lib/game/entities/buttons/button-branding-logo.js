ig.module('game.entities.buttons.button-branding-logo')
.requires(
	'game.entities.buttons.button'
	,'plugins.clickable-div-layer'
)
.defines(function() {
	EntityButtonBrandingLogo = EntityButton.extend({
		type:ig.Entity.TYPE.A,
		gravityFactor:0,
		logo: new ig.AnimationSheet('branding/logo.png',_SETTINGS['Branding']['Logo']['Width'],_SETTINGS['Branding']['Logo']['Height']),
		zIndex:10001,
		size:{x:64,
			y:66,
		},
		clickableLayer:null,
		link:null,
		newWindow:false,
		div_layer_name:"branding-logo",
		name:"brandinglogo",
		init:function(x,y,settings){
			this.parent(x,y,settings);
			if(ig.global.wm)
			{
    			
                
				return;
			}
            
			if(typeof(wm)=='undefined'){
				if(!_SETTINGS['Branding']['Logo']['Enabled']){
					this.kill();
                    return;
				}else{
					// Start resizing intelligently
					this.size.x = _SETTINGS['Branding']['Logo']['Width'];
					this.size.y = _SETTINGS['Branding']['Logo']['Height'];
				
					// Must centralize
    				this.anims.idle = new ig.Animation(this.logo,0,[0], true);
    				this.currentAnim = this.anims.idle;
				
    				// Must centralize
    				if(settings){
    					if(settings.centralize){
    						this.pos.x = ig.system.width/2 - this.size.x/2;	
    						console.log('centralize true ... centering branded logo ...')
    					}
    				}
        			// BUILD CLICKABLE LAYER
        			if(_SETTINGS['Branding']['Logo']['LinkEnabled']){
        				this.link=_SETTINGS['Branding']['Logo']['Link'];
        				this.newWindow = _SETTINGS['Branding']['Logo']['NewWindow'];
				
        				this.clickableLayer = new ClickableDivLayer(this);	
                    }											
				}			
			}
            
			if(settings.div_layer_name)
			{
				//console.log('settings found ... using that div layer name')
				this.div_layer_name = settings.div_layer_name;
			}
			else
			{
				this.div_layer_name = 'branding-logo'
			}
		},
        show:function()
        {
            var elem = ig.domHandler.getElementById("#"+this.div_layer_name);
            ig.domHandler.show(elem);
        },
        hide:function()
        {
            var elem = ig.domHandler.getElementById("#"+this.div_layer_name);
            ig.domHandler.hide(elem);
        },
		clicked:function()
		{
			
		},
		clicking:function()
		{
			
		},
		released:function()
		{
			
		}
	});
});