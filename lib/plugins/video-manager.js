ig.module('plugins.video-manager')
.defines(function() {
	ig.Video = ig.Class.extend({
		/* 
			HOW TO USE 
			- PREPARE INDEX.HTML WITH VIDEOS		
			- ADD CUSTOM ACTIONS IN endVideo(), skipVideo() functions
			
			- MODS DONE IN VIDEO-JS.CSS FOR RESIZING
			  removed height: 2.6em; /* Including any margin you want above or below control items

		*/
		
		playerIDs:null, // array of IDs
		players:[],		// array of players
		currentID:null, // current ID of playing video
		
		muted:false,

		playOnce:true,	// only play each video once
		playedPlayerIDs:[], // already played
		
    	init: function(){			
			console.log('video plugin initialized ...');
		},
		
		load:function(cutscene_ids_array){
			var local_players = []; // USED AS A LOCAL VARIABLE, TO BE TRANFERED TO this.players at the end of this function

			_V_.options.flash.swf = "glue/videojs/video-js.swf";	
			
			for(i=0;i<cutscene_ids_array.length;i++){
				console.log('setting up cutsceneID:',cutscene_ids_array[i]);
	
				_V_(cutscene_ids_array[i], {}, function(){
						local_players[i] = this;
						console.log('ready: ',cutscene_ids_array[i]);	
						local_players[i].addEvent("ended", ig.game.video.endVideo);
				});	
			}			

			this.players = local_players;
			this.playerIDs = cutscene_ids_array;
			
		},

		// OPTIONAL FUNCTION, TO LOAD LOWER-RES VIDEO SOURCES
		lowerVideoResolution:function(){
			for(i=0;i<this.playerIDs.length;i++){
				var div = $('#'+this.playerIDs[i]+'_html5_api');
				var filenameMinusExtension = this.extractfilenameMinusExtension(div.attr('src'));
				var extensionUsed = this.extractFileType(div.attr('src'));
				div.attr('src',filenameMinusExtension + '-small'+'.'+extensionUsed);
			}					
		},

		extractfilenameMinusExtension:function(path){
			return path.split('.').shift();
		},
		
		extractFileType:function(path){		
			return path.split('.').pop();
		},
						
		endVideo:function(){
			var video = ig.game.video;
			
			video.stopVideo(video.getPlayerByID(video.currentID));
			console.log('ended: ',video.currentID);
						
			switch(video.currentID){
				case 'cutscene1':
					// CUSTOM ACTIONS

					break;
				case 'cutscene2':
					// CUSTOM ACTIONS
			
					break;
			}		
		},
				
		getPlayerByID: function(id){
			for(i=0;i<this.players.length;i++){
				if(this.players[i].id==id){
					return this.players[i];
				}		
			}
			
			return false;
		},

		skipVideo:function(){
			this.endVideo();	
		},		

		isPlayedBefore:function(id,array){
			for(i=0;i<array.length;i++){
				if(array[i]==id) return true;
			}
			return false;
		},
		
		// IMPORTANT: PLEASE CALL ONLY WHEN USER INITIATES ACTION ON THE CANVAS
		// EG: ON CLICKED() FUNCTION OF ENTITIES
		// DOESN'T WORK ON IOS IF THERE'S NO USER INTERACTION ON CANVAS
		// USE CASE EXAMPLE: ig.game.playVideoById('cutscene1')
		playVideoByID: function(id){			
			this.playVideo(this.getPlayerByID(id));
		},

		// IMPORTANT: PLEASE CALL ONLY WHEN USER INITIATES ACTION ON THE CANVAS
		// EG: ON CLICKED() FUNCTION OF ENTITIES
		// DOESN'T WORK ON IOS IF THERE'S NO USER INTERACTION ON CANVAS		
		// USE CASE EXAMPLE: ig.game.playVideoById(ig.game.video.players[0])
		playVideo: function(player){
			// SKIP LAYER
			ig.game.showOverlay(['skip']);

			this.currentID = player.id;
			
			// CHECK IF ALLOWED TO PLAY ONLY ONCE
			if(this.isPlayedBefore(player.id,this.playedPlayerIDs)){
				console.log('previously played. Skipping');
				this.skipVideo();
				return;
			}else{
				console.log('first time play.');
				this.playedPlayerIDs.push(player.id);
			}
			
			this.expandDiv(player.id);
			this.showDiv(player.id);
				
			player.play();
	
			// IMPACTJS AUDIO - BUGGY CAUSES DOM 11 EXCEPTION
			ig.game.stopAllSounds();
			ig.game.stopBackgroundMusic();
		
			// RESIZE
			sizeHandler();
			
			console.log('playing ', player.id);
		},

		muteVideo: function(player){
		    player.volume(0);
			this.muted=true;
		},

		muteAllPlayers: function(){
			if(this.muted){
				for(i=0;i<this.players.length;i++){
					this.unmuteVideo(this.players[i]);
				}
			}else{
				for(i=0;i<this.players.length;i++){
					this.muteVideo(this.players[i]);
				}
			}
		},
		
		unmuteVideo: function(player){
		    player.volume(1);
			this.muted=false;
		},

		stopVideo: function(player){
			// SKIP LAYER
			ig.game.hideOverlay(['skip']);
			
			this.shrinkDiv(player.id);
			this.hideDiv(player.id);
			player.pause().currentTime(0);
	
			// IMPACTJS
			// BUGGY IN TEST SERVER: SEE IF IT'S STILL BUGGY, OR FIGURE OUT BETTER WAY 
			ig.game.stopAllSounds();
			ig.game.playBackgroundMusic();

			// RESIZE
			sizeHandler();
					
			console.log('playing ', player.id);
		},

		expandDiv: function(id){
			if(ig.ua.iPhone){ // TO FIX iPhone native player overlapping the Skip button, we reduce it to 1x1 pixels
				$('#' + id).width(1);
				$('#' + id).height(1);				
			}else{
				$('#' + id).width('100%');
				$('#' + id).height('100%');				
			}
			
			var divWidth = $('#' + id).width();
			var divHeight = $('#' + id).height();
			
			console.log('video div layer width:',divWidth);
			console.log('video div layer height:',divHeight);
			
			// CENTRALIZE VIDEO		
			$('#' + id).css('left',w/2-divWidth/2);
			$('#' + id).css('top',h/2-divHeight/2);

			console.log('expanding div id', id);			
		},

		shrinkDiv: function(id){
			$('#' + id).width(1);
			$('#' + id).height(1);	
			console.log('shrinking div id', id);
		},

		showDiv:function(id){
			document.getElementById(id).style.visibility="visible";			
		},

		hideDiv:function(id){
			document.getElementById(id).style.visibility="hidden";
		},

		/* DOESN'T WORK. ATTEMPT TO TRY TO GENERATE VIDEO DIVS WITHOUT USE OF INDEX.HTML 
			THE LAYER DOESN"T SHOW!		
		createDivs:function(){
			jQuery('<div/>', {
    			id: 'video'
			}).appendTo('body');	    
 			
			// CUTSCENE 1
			jQuery('<video/>', {
    			id: 'cutscene1',
				class: 'video-js video-modded vjs-default-skin',
				preload:'auto',
				width:'1',
				height:'1',
			}).appendTo('#video');   

			jQuery('<source/>', {
    			src: 'media/cutscenes/opening.mp4',
				type: 'video/mp4',
			}).appendTo('#cutscene1');   

			jQuery('<source/>', {
    			src: 'media/cutscenes/opening.webm',
				type: 'video/webm',
			}).appendTo('#cutscene1');   

			jQuery('<source/>', {
    			src: 'media/cutscenes/opening.ogv',
				type: 'video/ogv',
			}).appendTo('#cutscene1');   
										
			jQuery('<video/>', {
    			id: 'cutscene2',
				class: 'video-js video-modded vjs-default-skin',
				preload:'auto',
				width:'1',
				height:'1',
			}).appendTo('#video');   

			jQuery('<source/>', {
    			src: 'media/cutscenes/opening.mp4',
				type: 'video/mp4',
			}).appendTo('#cutscene2');   

			jQuery('<source/>', {
    			src: 'media/cutscenes/opening.webm',
				type: 'video/webm',
			}).appendTo('#cutscene2');   

			jQuery('<source/>', {
    			src: 'media/cutscenes/opening.ogv',
				type: 'video/ogv',
			}).appendTo('#cutscene2');  			
		},
		*/
						
						
	});
});