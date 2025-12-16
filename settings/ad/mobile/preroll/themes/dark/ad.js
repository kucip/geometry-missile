var MobileAdInGamePreroll = {
	
	ad_duration:_SETTINGS['Ad']['Mobile']['Preroll']['Duration'],
	ad_width:_SETTINGS['Ad']['Mobile']['Preroll']['Width'],
	ad_height:_SETTINGS['Ad']['Mobile']['Preroll']['Height'],
	
	ready_in:_STRINGS['Ad']['Mobile']['Preroll']['ReadyIn'],
	loading:_STRINGS['Ad']['Mobile']['Preroll']['Loading'],
	close:_STRINGS['Ad']['Mobile']['Preroll']['Close']+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
		
	Initialize:function(){
		if(_SETTINGS['Ad']['Mobile']['Preroll']['Rotation']['Enabled']){
			// Get Rotator
			var rotationSettings = _SETTINGS['Ad']['Mobile']['Preroll']['Rotation']['Weight'];

			// Sort into tiers
			var tier1 = rotationSettings['MobileAdInGamePreroll']; // 40
			var tier2 = tier1 + rotationSettings['MobileAdInGamePreroll2']; // 80
			var tier3 = tier2 + rotationSettings['MobileAdInGamePreroll3']; // 100

			// Sort into 
			var randomSeed = Math.floor(Math.random()*100);
			console.log('seed: ',randomSeed);

			if(randomSeed <= tier1){
				this.selectedOverlayName = 'MobileAdInGamePreroll'
			}else if(randomSeed <= tier2){
				this.selectedOverlayName = 'MobileAdInGamePreroll2'
			}else if(randomSeed <= tier3){
				this.selectedOverlayName = 'MobileAdInGamePreroll3'
			}	
			console.log('Ad rotating preroll enabled')		
		}else{
			this.selectedOverlayName = 'MobileAdInGamePreroll'
			console.log('Ad rotating preroll disabled')
		}
		
		console.log('selected:',this.selectedOverlayName);
		
		// Selected	
		this.overlay = $('#' + this.selectedOverlayName);
		this.box = $('#' + this.selectedOverlayName + '-Box');
		this.game = $('#game');
		
		this.boxContents = {
			footer:$('#' + this.selectedOverlayName + '-Box-Footer'),			
			header:$('#' + this.selectedOverlayName + '-Box-Header'),
			close:$('#' + this.selectedOverlayName + '-Box-Close'),
			body:$('#' + this.selectedOverlayName + '-Box-Body'), // Contains the ad			
		};
		
		// Centralize
		this.box.width(this.ad_width);
		this.box.height(this.ad_height);
	
		this.box.css('left',(this.overlay.width()-this.box.width())/2);
		this.box.css('top',(this.overlay.height()-this.box.height()-this.boxContents.header.height()-this.boxContents.footer.height())/2);	

		// Start
		this.overlay.show(this.Timer(this.ad_duration));		
	},
	
	Timer:function(duration){
		var i=duration;
		var inter = setInterval(function(){
			MobileAdInGamePreroll.boxContents.header.text(MobileAdInGamePreroll.ready_in+i+'...');			
			MobileAdInGamePreroll.boxContents.footer.text(MobileAdInGamePreroll.loading);
			i--;
			if(i<0){
				clearInterval(inter);
				MobileAdInGamePreroll.boxContents.close.css('left',MobileAdInGamePreroll.boxContents.body.width()-23);
				MobileAdInGamePreroll.boxContents.close.show();
				MobileAdInGamePreroll.boxContents.header.html(MobileAdInGamePreroll.close);
				MobileAdInGamePreroll.boxContents.footer.text('');
			}
		},1000);
	},
	
	Close:function(){
		this.boxContents.close.hide();
		this.overlay.hide();
	}

};