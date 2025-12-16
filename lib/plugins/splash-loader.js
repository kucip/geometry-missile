ig.module('plugins.splash-loader')
.requires(
    'impact.loader',
    'impact.animation'
)
.defines(function() {
    ig.SplashLoader = ig.Loader.extend({
        tapToStartDivId: "tap-to-start", 
        
        splashDesktop: new ig.Image('media/graphics/splash/desktop/cover.jpg'),
        splashMobile: new ig.Image('media/graphics/splash/mobile/cover.jpg'),

        customAnim: new ig.AnimationSheet('media/graphics/splash/loading/anim.png',256,160),//Use your own file

        bg: new ig.Image( 'media/graphics/game/bg-game.png' ),
        title: new ig.Image( 'media/graphics/game/logo.png' ),
        loadingFill: new ig.Image( 'media/graphics/game/loading.png' ),
        loadingBar: new ig.Image( 'media/graphics/game/bar_loading.png' ),

        init:function(gameClass,resources){

            this.parent(gameClass,resources);
            
            // ENABLE, IF CUSTOM ANIMATION REQUIRED DURING LOADING
            this.setupCustomAnimation();
            // ADS
            ig.apiHandler.run("MJSPreroll");
        },

        end:function(){
            this._endParent = this.parent;
			this._drawStatus = 1;
            
            if (_SETTINGS['TapToStartAudioUnlock']['Enabled']) {
                this.tapToStartDiv(function() {
                    /* play game */
                    this._endParent();
                    if (typeof (ig.game) === 'undefined' || ig.game == null) {
						ig.system.setGame( this.gameClass );
					}
                }.bind(this));
            }
            else {
                /* play game */
                this._endParent();
                if (typeof (ig.game) === 'undefined' || ig.game == null) {
                    ig.system.setGame( this.gameClass );
                }
            }

            // CLEAR CUSTOM ANIMATION TIMER
            // window.clearInterval(ig.loadingScreen.animationTimer);

            this.draw();
        },
        
        tapToStartDiv:function( onClickCallbackFunction ){
            this.desktopCoverDIV = document.getElementById(this.tapToStartDivId);
            
            // singleton pattern
            if ( this.desktopCoverDIV ) {
                return;
            }
            
            /* create DIV */
            this.desktopCoverDIV = document.createElement("div");
            this.desktopCoverDIV.id = this.tapToStartDivId;
            this.desktopCoverDIV.setAttribute("class", "play");
            this.desktopCoverDIV.setAttribute("style", "position: absolute; display: block; z-index: 999999; background-color: rgba(23, 32, 53, 0.7); visibility: visible; font-size: 10vmin; text-align: center; vertical-align: middle; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;");
            this.desktopCoverDIV.innerHTML = "<div style='color:white;background-color: rgba(255, 255, 255, 0.3); border: 2px solid #fff; font-size:20px; border-radius: 5px; position: relative; float: left; top: 50%; left: 50%; transform: translate(-50%, -50%);'><div style='padding:20px 50px; font-family: montserrat;'>" + _STRINGS["Splash"]["TapToStart"] + "</div></div>";
            
            
            /* inject DIV */
            var parentDIV = document.getElementById("play").parentNode || document.getElementById("ajaxbar");
            parentDIV.appendChild(this.desktopCoverDIV);
            
            /* reize DIV */
            try {
                if ( typeof (ig.sizeHandler) !== "undefined" ) {
                    if ( typeof (ig.sizeHandler.coreDivsToResize) !== "undefined" ) {
                        ig.sizeHandler.coreDivsToResize.push( ("#"+this.tapToStartDivId) );
                        if ( typeof (ig.sizeHandler.reorient) === "function" ) {
                            ig.sizeHandler.reorient();
                        }
                    }
                }
                else if ( typeof (coreDivsToResize) !== "undefined" ) {
                    coreDivsToResize.push(this.tapToStartDivId);
                    if ( typeof (sizeHandler) === "function" ) {
                        sizeHandler();
                    }
                }
            } catch (error) {
                console.log(error);
            }
            
            
            /* click DIV */
            this.desktopCoverDIV.addEventListener("click", function(){
                ig.soundHandler.unlockWebAudio();
            
                /* hide DIV */
                this.setAttribute("style", "visibility: hidden;");
            
                /* end function */
                if ( typeof (onClickCallbackFunction) === "function" ) {
                    onClickCallbackFunction();
                }
            });
        },

        setupCustomAnimation:function(){
            this.animHeight = this.customAnim.height;
            this.animWidth = this.customAnim.width;
            this.customAnim = new ig.Animation(this.customAnim, 0.025, [0,1,2,3,4,5,6,7]);
            // this.customAnim.currentFrame = 0;

            // // Assign this class instance an arbitrary name
            // ig.loadingScreen = this;

            // // Create an external timer variable
            // ig.loadingScreen.animationTimer = window.setInterval('ig.loadingScreen.animate()',100);
        },

        animate:function(){
            // Somehow the update() function doesn't work in Loader class. Resort to using external timer to increment
            // current frame in anim object

            // if(this.customAnim.currentFrame<this.customAnim.sequence.length){
            //     this.customAnim.currentFrame++;
            // }else{
            //     this.customAnim.currentFrame=0;
            // }
            // this.customAnim.gotoFrame(this.customAnim.currentFrame);
            ig.Timer.step();
			this.customAnim.update();
        },


        drawCheck: 0,
        draw: function() {
            this._drawStatus += (this.status - this._drawStatus)/5;
            
            //Check the game screen. see if the font are loaded first. Removing the two lines below is safe :)
            if(this.drawCheck === 1) console.log('Font should be loaded before loader draw loop');
            if(this.drawCheck < 2) this.drawCheck ++;
            

            // CLEAR RECTANGLE
            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect( 0, 0, ig.system.width, ig.system.height );

            ig.util.drawImageScaled(this.bg);            

            var s = ig.system.scale;

            // DIMENSIONS OF LOADING BAR
            var w,h,x,y;
            if(ig.ua.mobile){
                // CUSTOM POSITIONS (TRIAL & ERROR)
                w = 180;
                h = 24;
                x = ig.system.width * 0.5-w/2;
                y = ig.system.height * 0.67;
                // this.splashMobile.draw(0,0);
            }else{
                // CUSTOM POSITIONS (TRIAL & ERROR)
                w = 250;
                h = 30;
                x = ig.system.width * 0.5-w/2;
                y = ig.system.height * 0.67;
                // this.splashDesktop.draw(0,0);
            }

            // DRAW LOADING BAR
            this.loadingBar.draw(ig.system.width/2 - this.loadingBar.width/2, ig.system.height*0.7, 0, 0, this.loadingBar.width*s, this.loadingBar.height*s);

            this.loadingFill.draw(ig.system.width/2 - this.loadingFill.width/2, ig.system.height*0.7 + 17, 0, 0, this.loadingFill.width*s*this._drawStatus + 30, this.loadingFill.height*s);

            ig.system.context.fillStyle = '#ffffff';
            ig.system.context.font = "80px mainfont";

            // DRAW LOADING TEXT
            var text = _STRINGS.Splash["Loading"];
            var xpos,ypos;
            if(ig.ua.mobile){    // MOBILE
                xpos = ig.system.width/2 - ig.system.context.measureText(text).width/2;
                ypos = y*s-20;
            }else{                // DESKTOP
                xpos = ig.system.width/2 - ig.system.context.measureText(text).width/2;
                ypos = y*s-20;
            }
            ig.system.context.fillText(text, xpos, ypos );
            ig.system.context.font = "30px mainfont";
            ig.system.context.fillStyle = '#000000';
            //draw title
            this.title.draw(ig.system.width/2 - this.title.width/2, ig.system.height/2 - this.title.height/1.2);
        },

        drawVersion: function() {
			if (typeof(_SETTINGS.Versioning) !== "undefined" && _SETTINGS.Versioning !== null) {
                if (_SETTINGS.Versioning.DrawVersion) {
                    var ctx = ig.system.context;
					fontSize = _SETTINGS.Versioning.FontSize,
					fontFamily = _SETTINGS.Versioning.FontFamily,
					fillStyle = _SETTINGS.Versioning.FillStyle

					ctx.save();
					ctx.textBaseline="bottom";
					ctx.textAlign="left";
					ctx.font = fontSize + " " + fontFamily || "10px Arial";
					ctx.fillStyle = fillStyle || '#ffffff';
					ctx.fillText("v" + _SETTINGS.Versioning.Version + "+build." + _SETTINGS.Versioning.Build, 10, ig.system.height - 10);
					ctx.restore();
                }
			}
		}
    });
});
