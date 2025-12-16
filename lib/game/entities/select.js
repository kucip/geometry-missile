ig.module('game.entities.select')
.requires(
	'impact.entity'
)
.defines(function() {
	EntitySelect = ig.Entity.extend({
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,	
				
		canSelect:false,
		canSelectTimerDuration:0.35,
		
		zIndex:99999,
		isHovering:false,		
		isSelected:false,
		
		init:function(x,y,settings){
			this.parent(x,y,settings);
			this.canSelectTimer = new ig.Timer(this.canSelectTimerDuration);
		},

		doesClickableLayerExist:function(id){
			for(k in dynamicClickableEntityDivs){
				if(k==id) return true;
			}			
			return false;	
		},

		checkClickableLayer:function(divID,outboundLink,open_new_window){
			if(typeof(wm)=='undefined'){				
				// IF LAYER ALREADY EXISTS, SHOW OVERLAY. ELSE, CREATE CLICKABLE LAYER
				if(this.doesClickableLayerExist(divID)){
					// SHOW OVERLAY
					ig.game.showOverlay([divID]);
					
					// REINJECT NEW LINK
					$('#'+divID).find('[href]').attr('href',outboundLink);
					
				}else{
					this.createClickableOutboundLayer(divID,outboundLink,'media/graphics/misc/invisible.png',open_new_window);
				}							
			}			
		},
								
		// WORKAROUND BECAUSE CANVAS CANNOT BE CLICKED TO AN OUTBOUND LINK. TOLERATES RESIZING
		createClickableOutboundLayer:function(id,outbound_link,image_path,open_new_window){			
			// CREATE LAYER
		    var div = ig.$new('div');
		    div.id = id;
		    document.body.appendChild(div);
    		
			// ADJUST LAYER
			$('#'+div.id).css('float','left');
			$('#'+div.id).css('width',this.size.x*multiplier);
			$('#'+div.id).css('height',this.size.y*multiplier);
			$('#'+div.id).css('position','absolute');
						
			// PEG LAYER TO ENTITY
			var reference = {
				x:(w / 2) - (destW / 2),
				y:(h / 2) - (destH / 2),
			} 
			
			if(w == mobileWidth){
				$('#'+div.id).css('left',this.pos.x);
				$('#'+div.id).css('top',this.pos.y);				
			}else{
				$('#'+div.id).css('left',reference.x + this.pos.x*multiplier);
				$('#'+div.id).css('top',reference.y + this.pos.y*multiplier);				
			}
			
			// INJECT LINK AND IMAGE
			if(open_new_window){
				$('#'+div.id).html('<a target=\'_blank\' href=\'' + outbound_link + '\'><img style=\'width:100%;height:100%\' src=\'' + image_path + '\'></a>');
			}else{
				$('#'+div.id).html('<a href=\'' + outbound_link + '\'><img style=\'width:100%;height:100%\' src=\'' + image_path + '\'></a>');				
			}

			// ADD TO HANDLER FOR RESIZING
			dynamicClickableEntityDivs[id] = {};
			dynamicClickableEntityDivs[id]['width'] = $('#'+div.id).width();
			dynamicClickableEntityDivs[id]['height'] = $('#'+div.id).height();
			dynamicClickableEntityDivs[id]['entity_pos_x'] = this.pos.x; 
			dynamicClickableEntityDivs[id]['entity_pos_y'] = this.pos.y; 
		},

		hovered:function(){
			this.isHovering=true;
			this.dehoverOthers();			
		},
				
		dehoverOthers:function(){
			var selectors = ig.game.getEntitiesByType(EntitySelect);
			for(i=0;i<selectors.length;i++){
				if(selectors[i]!=this){
					selectors[i].isHovering = false;
				}				
			}
		},
				
		deselectOthers:function(){
			var selectors = ig.game.getEntitiesByType(EntitySelect);
			for(i=0;i<selectors.length;i++){
				if(selectors[i]!=this){
					selectors[i].isSelected = false;
				}
			}
		},
			
		update:function(){
			this.parent();		
			
			// CAN SELECT				
			if(this.canSelectTimer && this.canSelectTimer.delta() > 0){ //finished ticking
				this.canSelect=true;
				this.canSelectTimer = null;
			}
			
		},
	});
});