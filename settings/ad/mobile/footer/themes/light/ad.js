var MobileAdInGameFooter = {
	
	ad_duration:_SETTINGS['Ad']['Mobile']['Footer']['Duration'],
	ad_width:_SETTINGS['Ad']['Mobile']['Footer']['Width'],
	ad_height:_SETTINGS['Ad']['Mobile']['Footer']['Height'],
	
	Initialize:function(){
		if(_SETTINGS['Ad']['Mobile']['Footer']['Rotation']['Enabled']){
			// Get Rotator
			var rotationSettings = _SETTINGS['Ad']['Mobile']['Footer']['Rotation']['Weight'];

			// Sort into tiers
			var tier1 = rotationSettings['MobileAdInGameFooter']; // 40
			var tier2 = tier1 + rotationSettings['MobileAdInGameFooter2']; // 80
			var tier3 = tier2 + rotationSettings['MobileAdInGameFooter3']; // 100

			// Sort into 
			var randomSeed = Math.floor(Math.random()*100);
			console.log('seed: ',randomSeed);

			if(randomSeed <= tier1){
				this.selectedOverlayName = 'MobileAdInGameFooter'
			}else if(randomSeed <= tier2){
				this.selectedOverlayName = 'MobileAdInGameFooter2'
			}else if(randomSeed <= tier3){
				this.selectedOverlayName = 'MobileAdInGameFooter3'
			}	
			console.log('Ad rotating footer enabled')		
		}else{
			this.selectedOverlayName = 'MobileAdInGameFooter'
			console.log('Ad rotating footer disabled')
		}
				
		this.div = $('#' + this.selectedOverlayName);
		this.game = $('#game');
			
		// Centralize
		this.div.width(this.ad_width);
		this.div.height(this.ad_height);

		this.div.css('left',this.game.position().left+(this.game.width()-this.div.width())/2)
		this.div.css('top',this.game.height()-this.div.height()-5)

		// Show
		this.div.show(this.Timer(this.ad_duration));			
	},

	Timer:function(duration){
		var inter = setInterval(function(){
			duration--;
			if(duration<0){
				MobileAdInGameFooter.div.hide();
				clearInterval(inter);				
			}
		},1000);
	},
};








