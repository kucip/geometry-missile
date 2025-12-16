var MobileAdInGameEnd = {
	
	ad_duration:_SETTINGS['Ad']['Mobile']['End']['Duration'],
	ad_width:_SETTINGS['Ad']['Mobile']['End']['Width'],
	ad_height:_SETTINGS['Ad']['Mobile']['End']['Height'],
	
	ready_in:_STRINGS['Ad']['Mobile']['End']['ReadyIn'],
	loading:_STRINGS['Ad']['Mobile']['End']['Loading'],
	close:_STRINGS['Ad']['Mobile']['End']['Close']+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
		
	Initialize:function(){
		if(_SETTINGS['Ad']['Mobile']['End']['Rotation']['Enabled']){
			// Get Rotator
			var rotationSettings = _SETTINGS['Ad']['Mobile']['End']['Rotation']['Weight'];

			// Sort into tiers
			var tier1 = rotationSettings['MobileAdInGameEnd']; // 40
			var tier2 = tier1 + rotationSettings['MobileAdInGameEnd2']; // 80
			var tier3 = tier2 + rotationSettings['MobileAdInGameEnd3']; // 100

			// Sort into 
			var randomSeed = Math.floor(Math.random()*100);
			console.log('seed: ',randomSeed);

			if(randomSeed <= tier1){
				this.selectedOverlayName = 'MobileAdInGameEnd'
			}else if(randomSeed <= tier2){
				this.selectedOverlayName = 'MobileAdInGameEnd2'
			}else if(randomSeed <= tier3){
				this.selectedOverlayName = 'MobileAdInGameEnd3'
			}	
			console.log('Ad rotating end enabled')		
		}else{
			this.selectedOverlayName = 'MobileAdInGameEnd'
			console.log('Ad rotating end disabled')
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
			MobileAdInGameEnd.boxContents.header.text(MobileAdInGameEnd.ready_in+i+'...');			
			MobileAdInGameEnd.boxContents.footer.text(MobileAdInGameEnd.loading);
			i--;
			if(i<0){
				clearInterval(inter);
				MobileAdInGameEnd.boxContents.close.css('left',MobileAdInGameEnd.boxContents.body.width()-23);
				MobileAdInGameEnd.boxContents.close.show();
				MobileAdInGameEnd.boxContents.header.html(MobileAdInGameEnd.close);
				MobileAdInGameEnd.boxContents.footer.text('');
			}
		},1000);
	},
	
	Close:function(){
		this.boxContents.close.hide();
		this.overlay.hide();
	}

};