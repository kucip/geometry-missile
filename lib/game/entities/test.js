ig.module('game.entities.test')
.requires(
	'game.entities.buttons.button'
	,'plugins.clickable-div-layer'
)
.defines(function() {
    EntityTest = EntityButton.extend({
        zIndex:99999,
        pos:new Vector2(0,0),
        size:new Vector2(20,20),
        color:new ColorRGB(125,255,125,1),
        clickableLayer:null,
        div_layer_name:"test-entity",
		name:"test-entity",
        newWindow:true,
        init:function(x,y,settings){
            this.parent(x,y,settings);
            if(ig.global.wm)
			{
				return;
			}
			
			if(settings.div_layer_name)
			{
				//console.log('settings found ... using that div layer name')
				this.div_layer_name = settings.div_layer_name;
			}
			else
			{
				this.div_layer_name = 'test-entity'
			}
            this.clickableLayer = new ClickableDivLayer(this);
            //console.log(this.color.getStyle());
            //console.log(this.color.getHex());
        },
        show:function()
        {
            var elem = ig.domHandler.getElementById("#"+this.div_layer_name);
            if (elem) { ig.domHandler.show(elem); }
        },
        hide:function()
        {
            var elem = ig.domHandler.getElementById("#"+this.div_layer_name);
            if (elem) { ig.domHandler.hide(elem); }
        },
        update:function(){
            
            this.parent();
            
        },
        draw:function(){
            this.parent();
            var ctx=ig.system.context;
            ctx.fillStyle=this.color.getHex();
            ctx.fillRect(this.pos.x,this.pos.y,this.size.x,this.size.y);
        }
    });
});