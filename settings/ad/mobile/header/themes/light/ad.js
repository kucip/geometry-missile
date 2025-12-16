var MobileAdInGameHeader = {
	
	ad_duration:_SETTINGS['Ad']['Mobile']['Header']['Duration'],
	ad_width:_SETTINGS['Ad']['Mobile']['Header']['Width'],
	ad_height:_SETTINGS['Ad']['Mobile']['Header']['Height'],
	
	Initialize:function(){
		if(_SETTINGS['Ad']['Mobile']['Header']['Rotation']['Enabled']){
			// Get Rotator
			var rotationSettings = _SETTINGS['Ad']['Mobile']['Header']['Rotation']['Weight'];

			// Sort into tiers
			var tier1 = rotationSettings['MobileAdInGameHeader']; // 40
			var tier2 = tier1 + rotationSettings['MobileAdInGameHeader2']; // 80
			var tier3 = tier2 + rotationSettings['MobileAdInGameHeader3']; // 100

			// Sort into 
			var randomSeed = Math.floor(Math.random()*100);
			console.log('seed: ',randomSeed);

			if(randomSeed <= tier1){
				this.selectedOverlayName = 'MobileAdInGameHeader'
			}else if(randomSeed <= tier2){
				this.selectedOverlayName = 'MobileAdInGameHeader2'
			}else if(randomSeed <= tier3){
				this.selectedOverlayName = 'MobileAdInGameHeader3'
			}	
			console.log('Ad rotating header enabled')		
		}else{
			this.selectedOverlayName = 'MobileAdInGameHeader'
			console.log('Ad rotating header disabled')
		}
				
		this.div = $('#' + this.selectedOverlayName);
		this.game = $('#game');
			
		// Centralize
		this.div.width(this.ad_width);
		this.div.height(this.ad_height);

		this.div.css('left',this.game.position().left+(this.game.width()-this.div.width())/2)
		this.div.css('top',0)

		// Show
		this.div.show(this.Timer(this.ad_duration));			
	},

	Timer:function(duration){
		var inter = setInterval(function(){
			duration--;
			if(duration<0){
				MobileAdInGameHeader.div.hide();
				clearInterval(inter);				
			}
		},1000);
	},
};








