ig.module( 'plugins.jukebox' )
.defines(function(){
	ig.Jukebox = ig.Class.extend({		
		init: function(){
			this.player = new jukebox.Player({
			    resources: [
			      'media/audio/background.mp3',
			      'media/audio/background.ogg',
			    ],

				autoplay: false, //'music',
				
			    spritemap: {
									
					music: {
						start: 0.000,
						end: 84.689,	
						loop:true	
					}
										
					// add more audio bytes here		
			    },
				
				timeout: 1000,	// timeout (in milliseconds) to loop bgm, default: 1000 (1 sec)
		   });	
		}
	});	
});