ig.module( 'plugins.url-parameters' )
.defines(function(){
	ig.UrlParameters = ig.Class.extend({		
		init: function(){
			var iphone = getQueryVariable("iphone");
			switch(iphone){
				case 'true':				
					ig.ua.iPhone=true;	
					console.log('iPhone mode')				
					break;
			}

			var webview = getQueryVariable("webview");
			if(webview){
				switch(webview){
					case 'true':
						ig.ua.is_uiwebview=true;
						console.log('webview mode')
						break;
				}					
			}
			
			var debug = getQueryVariable("debug");
			if(debug){
				switch(debug){
					case 'true':
						ig.game.showDebugMenu();
						console.log('debug mode')
						break;
				}					
			}
						
			var view = getQueryVariable("view");
			switch(view){
				case 'stats':
					ig.game.resetPlayerStats();
					ig.game.endGame();
					break;
				case 'menu':
					if(ig.ua.mobile){
						// load mobile stuff
					}else{
						// load desktop stuff
					}					
					break;
			}
			
			var ad = getQueryVariable("ad");
			switch(ad){
				case 'true':				
					// Do something				
					break;
			}
		},
		
	});	
});