/* MarketJS Facebook-ImpactJS Plugin
 -----------------------------------------------------------------------
 Copyright (c) 2012 MarketJS Limited. Certain portions may come from 3rd parties and
 carry their own licensing terms and are referenced where applicable. 
 -----------------------------------------------------------------------
*/

ig.module(
    'plugins.facebook'
)
.defines(function(){
	ig.Facebook = ig.Class.extend({
		
		/* EXAMPLE SETUP: 
		
			LOCAL SETTINGS
			1.	copy this file into lib/plugins folder
			2.	in main.js, require plugins.facebook
			3.	in init() of main.js, call this.facebook = new ig.Facebook('APP_ID'); - get APP_ID from Facebook Developer Dashboard
			4.	start calling the APIs! Eg: ig.game.facebook.sendMultiInvite('Hey play this game',ig.game.FBCallbackSendMultiInvite)
		
			FACEBOOK DEVELOPER DASHBOARD
			1.	create new app
			2.	change app URL to production URL
			3.	get APP_ID, insert into game
			
			Note: Facebook API only works on live servers, not localhost. Push code to server for each update.
			
		*/
	    appId: null,
	    callback: null,
	    session: null,
	    me: null,
	    cache: {},

		getGameDirectory:function(url){
			// BEFORE:'http://s3-ap-northeast-1.amazonaws.com/marketjs-test/CNY-SNAKE-GAME/index.html?nocache'
			// AFTER: 'http://s3-ap-northeast-1.amazonaws.com/marketjs-test/CNY-SNAKE-GAME'
			return url.substr(0,url.lastIndexOf('/'))
		},
		
		init:function(appId,callback){
    		this.appId = appId;
			this.gameDirectory = this.getGameDirectory(document.URL);
			
		    // This function will be called as soon as the FB API is loaded
			window.fbAsyncInit = function() {
				//console.log(gameDirectory)
				//console.log(ig.game.facebook.gameDirectory);
				
				FB.init({
					appId      : appId, // App ID
					channelUrl : ig.game.facebook.gameDirectory + '/channel.html', // Channel File
					status     : true, // check login status
					cookie     : true, // enable cookies to allow the server to access the session
					xfbml      : true  // parse XFBML
				});

				// IMMEDIATELY GET STATUS. WORKS WELL WHEN USER IS NOT LOGGED INTO FB TO START WITH (TOTALLY NEW)
				ig.game.facebook.getLoginStatus(callback);	
			};
	    
		    // Load the FB API
		    var div = ig.$new('div');
		    div.id = 'fb-root';
		    document.body.appendChild(div);
    
		    var script = ig.$new('script');
		    script.type = 'text/javascript';

			// Localization
			switch(ig.game.language.selectedCode){
				case 'tw':
		    		script.src = '//connect.facebook.net/zh_tw/all.js'; // 'http://connect.facebook.net/en_US/all.js';
					break;
				case 'hk':
				    script.src = '//connect.facebook.net/zh_hk/all.js'; // 'http://connect.facebook.net/en_US/all.js';
					break;
				default:
				    script.src = '//connect.facebook.net/en_US/all.js'; // 'http://connect.facebook.net/en_US/all.js';
					break;
			}
			
		    script.async = true;

		    ig.$('#fb-root').appendChild(script);			
		},

		subscribeEvent:function(callback){
			FB.Event.subscribe('auth.statusChange',callback);			
		},

		getLoginStatus:function(callback){
			FB.getLoginStatus(callback);			
		},
				
		logout:function(){
			FB.logout();
		},
		
		loginUser:function(){
			FB.login(function(response) { }, {scope:'email'});  
		},
		
		getUserInfo:function(user_id,callback){
			if(user_id=='me'){
				FB.api('/me',callback);	
			}else{
				FB.api('/'+user_id,callback);	
			}					
		},
		
		/* eg usage:
				ig.game.facebook.sendMultiInvite(
					'Hello friends, please try out this CNY Snake Game!',
					ig.game.callBackSendMultiInvite	// checks if user has published/not published the request
				)

			  then define the callback function in main.js as such ..
			
			  FBCallbackSendMultiInvite:function(response) {
					console.log('response:',response);	
			  }				
				
		*/
		sendMultiInvite:function(message,callback){
	        FB.ui({method: 'apprequests',
	          message: message
	        }, callback);			
		},
		
		/* eg usage: 	
				ig.game.facebook.postToFeed(
						'I scored 34599 points in the CNY Snake Game,
						'2013 CNY Snake game sponsored by Nokia',
						'Invite your friends to play the game. Let's celebrate 2013 CNY in style!',
						'http://landing_page_url',
						'media/splash/cover.jpg,
						ig.game.callBackPostToFeed
				);		
			
			  then define the callback function in main.js as such ..
			
			  FBCallbackPostToFeed:function(response) {
		    	if (response && response.post_id) {
			      console.log('Post was published.');
			    } else {
			      console.log('Post was not published.');
			    }		
			  }				
		*/
		postToFeed:function(name,caption,description,link,picture,callback){
			//console.log(ig.game.facebook.gameDirectory + '/' + picture);
			
			FB.ui(
			  {
			   method: 'feed',
			   name: name,
			   caption: caption,
			   description: description,
			   link: link,
			   picture: ig.game.facebook.gameDirectory + '/' + picture,
			  },
			  
			  callback
			);				
		}
		
		/* old
		CachedAPI:function(req,callback){
		    if( ig.Facebook.cache[req] ) {
		        callback( ig.Facebook.cache[req] );
		    }
		    else {
		        FB.api( req, function( response ) {
		            ig.Facebook.cache[req] = response;
		            callback( response );
		        });
		    }			
		}
		*/
	});
});
