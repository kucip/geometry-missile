ig.module('game.entities.test-control')
.requires(
	'impact.entity',
    'game.entities.test'
)
.defines(function() {
    EntityTestControl = ig.Entity.extend({
        zIndex:99999,
        size:new Vector2(20,20),
        testEnt:null,
        tween:null,
        init:function(x,y,settings){
            this.parent(x,y,settings);
            if(!ig.global.wm){
                
                // alias 
                ig.game.testControl = this;
                
                // test cases
                // this.initTestCase1();   // basic tween and chaining test
                // this.initTestCase2();   // callback functions test
                 this.initTestCase3();   // tween control test - start, pause, resume, stop, end
                // this.initTestCase4();   // vector issue
                
                ig.game.spawnEntity(ig.FullscreenButton, 5, 5, { 
                    enterImage: new ig.Image("media/graphics/misc/enter-fullscreen-transparent.png"), 
                    exitImage: new ig.Image("media/graphics/misc/exit-fullscreen-transparent.png") 
                });
            }    
            
        },
        
        ready: function() {
            this.parent();
            
            console.log('ready');
        },
        
        initTestCase1: function() {
            // flag
            this.initTestCase1Initialized = true;
            
            /* Test Case 1 */
            this.testEnt = ig.game.spawnEntity(EntityTest,200,200);
            
            // chaining test
            this.tweenSlow = new ig.TweenDef(this.testEnt.pos).
                                to({x:100,y:100},2000).
                                //onComplete(function(){console.log("end slow tween", this)}).
                                easing(ig.Tween.Easing.Bounce.EaseOut).
                                interpolation(ig.Tween.Interpolation.Bezier).
                                // delay(500).
                                repeat(2).
                                // repeatDelay(1000).
                                yoyo(true);
            this.tweenFast = new ig.TweenDef(this.testEnt.pos).
                                to({x:300,y:300},500).
                                //onComplete(function(){console.log("end fast tween", this)}).
                                //easing(ig.Tween.Easing.Bounce.EaseIn).
                                //interpolation(ig.Tween.Interpolation.Linear).
                                repeat(4).
                                // chain(this.tweenSlow).
                                yoyo(true);
            // loop test
            this.tweenSlow.chain(this.tweenFast);
            this.tweenFast.chain(this.tweenSlow);
            
            // start
            this.tweenFast.start();
            // this.tweenSlow.start();
        },
        
        initTestCase2: function() {
            // flag
            this.initTestCase2Initialized = true;
            
            /* Test Case 2 */
            var coords = { x: 0, y: 0 };
            this.coordsTween = new ig.TweenDef(coords)
            	.to({ x: 100, y: 100 }, 1000)
                .easing(ig.Tween.Easing.Bounce.EaseInOut)
                .onStart(
                    function( objectValue ) {
                        /* On Start CallBack */
                        console.log("Start", objectValue);
                        
                        /* Do something here */
                        this.coordsTween.pause();
                        
                    }.bind(this)
                )
            	.onUpdate(
                    function( objectValue, easeValue ) {
                        /* On Update CallBack */
                        // console.log("Update", objectValue, this.coordsTween._currentElapsed, easeValue); 
                        // Please note that easeValue may differ due to easing, which is fine.
                        
                        // 'this' here refer to this entity, with binding
                        // without binding, this refer to the object 'coords'
                        // console.log(this, easeValue);
                
                        /* Do something here */
                        
                        /* Conditional stop */
                        if( this.coordsTween._currentElapsed >= 0.5 ) { // check if 50% done
                            this.coordsTween.stop();    // stop it
                        }
                        
                    }.bind(this) /* binding this entity */ 
                )
                .onStop(
                    function(objectValue) {
                        /* On Stop CallBack */
                        console.log("Stop", objectValue);
                        
                        /* Do something here */
                        
                        
                    }.bind(this)
                )
                .onComplete(
                    function(objectValue) {
                        /* On Complete CallBack */
                        console.log("Complete", objectValue);
                        
                        /* Do something here */
                        
                        
                    }.bind(this)
                )
                .onPause(
                    function(objectValue) {
                        /* On Pause CallBack */
                        console.log("Pause", objectValue);
                        
                        /* Do something here */
                        this.coordsTween.resume();
                        
                    }.bind(this)
                )
                .onResume(
                    function(objectValue) {
                        /* On Resume CallBack */
                        console.log("Resume", objectValue);
                        
                        /* Do something here */
                        
                        
                    }.bind(this)
                )
            	.start();
        },
        
        initTestCase3: function() {
            // flag
            this.initTestCase3Initialized = true;
            
            /* Test Case 3 */
            this.spawnTweenEntity();
            this.spawnTweenControlButtons();
        },
        
        initTestCase4: function() {
            // flag
            this.initTestCase4Initialized = true;
            
            this.testEntityA = ig.game.spawnEntity(EntityTest,450,200, { control: this, /* pos: new Vector2(450,200), */ size: new Vector2(20,40), /* color: new ColorRGB(255,125,125,1) */ });
            this.testEntityB = ig.game.spawnEntity(EntityTest,475,200, { control: this, /* pos: new Vector2(470,200), */ size: new Vector2(40,20), /* color: new ColorRGB(125,125,255,1) */ });
        
            /* colorRGB value change test */
            
            // only color of entity B should change to pure RED
            this.testEntityB.color.r = 255;
            this.testEntityB.color.g = 0;
            this.testEntityB.color.b = 0;
            
            
        },
        
        spawnTweenEntity: function() {
            this.tweenEntity = ig.game.spawnEntity(EntityTest,895,49, { control: this, color: new ColorRGB(255,125,125,1) });
            
            this.tweenControl = new ig.TweenDef(this.tweenEntity.pos).to({ y: 330 }, 5000);
        },
        
        spawnTweenControlButtons: function() {
            this.tweenControlButtons = {
                start   : ig.game.spawnEntity( EntityButton, 750, 50, { control: this, size: new Vector2(128,48), color: new ColorRGB(255,125,125,1) }),
                stop    : ig.game.spawnEntity( EntityButton, 750, 100, { control: this, size: new Vector2(128,48), color: new ColorRGB(255,125,125,1) }),
                pause   : ig.game.spawnEntity( EntityButton, 750, 150, { control: this, size: new Vector2(128,48), color: new ColorRGB(255,125,125,1) }),
                resume  : ig.game.spawnEntity( EntityButton, 750, 200, { control: this, size: new Vector2(128,48), color: new ColorRGB(255,125,125,1) }),
                end     : ig.game.spawnEntity( EntityButton, 750, 250, { control: this, size: new Vector2(128,48), color: new ColorRGB(255,125,125,1) }),               
                systemPause : ig.game.spawnEntity( EntityButton, 750, 300, { control: this, size: new Vector2(128,48), color: new ColorRGB(255,125,125,1) })
            };
            
            this.setupTweenControlButtons();
        },
        
        setupTweenControlButtons: function() {
            var buttonEntity = null;
            
            /* General */
            for(buttonKey in this.tweenControlButtons) {
                buttonEntity = this.tweenControlButtons[buttonKey];
                buttonEntity.name = buttonKey;
                buttonEntity.backgroundColor = buttonEntity.color.getStyle();
                buttonEntity.foregroundColor = buttonEntity.color.getInvertedColor().getStyle();
                buttonEntity.draw = function() {
                    // background color
                    // this.color.setRandomColor(); // fun!
                    // this.backgroundColor = this.color.getStyle();
                    // this.foregroundColor = this.color.getInvertedColor().getStyle();
                     
                    ig.system.context.fillStyle = this.backgroundColor;
                    ig.system.context.fillRect( this.pos.x, this.pos.y, this.size.x, this.size.y );
                    
                    // text
                    ig.system.context.fillStyle = this.foregroundColor;
                    ig.system.context.font = "18px Arial";
                    ig.system.context.textBaseline = "middle";
                    ig.system.context.textAlign = "center";
                    ig.system.context.fillText( this.name, this.pos.x+0.5*this.size.x, this.pos.y+0.5*this.size.y );
                };
            }
            
            /* Custom */
            this.tweenControlButtons["start"].clicked = function() {
                ig.soundHandler.sfxPlayer.play("logosplash1");
                console.log("start");
                
                this.control.tweenControl.start();
            };
            this.tweenControlButtons["start"].clicking = function() {
                // console.log("start");
            };
            this.tweenControlButtons["start"].released = function() {
                // console.log("start");
            };
            
            this.tweenControlButtons["stop"].clicked = function() {
                ig.soundHandler.sfxPlayer.play("logosplash1");
                console.log("stop");
                
                this.control.tweenControl.stop();
            };
            this.tweenControlButtons["stop"].clicking = function() {
                // console.log("stop");
            };
            this.tweenControlButtons["stop"].released = function() {
                // console.log("stop");
            };
            
            this.tweenControlButtons["pause"].clicked = function() {
                ig.soundHandler.sfxPlayer.play("logosplash1");
                console.log("pause");
                
                this.control.tweenControl.pause();
            };
            this.tweenControlButtons["pause"].clicking = function() {
                // console.log("pause");
            };
            this.tweenControlButtons["pause"].released = function() {
                // console.log("pause");
            };
            
            this.tweenControlButtons["resume"].clicked = function() {
                ig.soundHandler.sfxPlayer.play("logosplash1");
                console.log("resume");
                
                this.control.tweenControl.resume();
            };
            this.tweenControlButtons["resume"].clicking = function() {
                // console.log("resume");
            };
            this.tweenControlButtons["resume"].released = function() {
                // console.log("resume");
            };
            
            this.tweenControlButtons["end"].clicked = function() {
                ig.soundHandler.sfxPlayer.play("logosplash1");
                console.log("end");
                
                this.control.tweenControl.end();
            };
            this.tweenControlButtons["end"].clicking = function() {
                // console.log("end");
            };
            this.tweenControlButtons["end"].released = function() {
                // console.log("end");
            };
            this.tweenControlButtons["systemPause"].clicked = function() {
                ig.soundHandler.sfxPlayer.play("logosplash1");
                ig.game.pauseGame();
            };
            this.tweenControlButtons["systemPause"].clicking = function() {};
            this.tweenControlButtons["systemPause"].released = function() {};
            
        },
        
        
        update:function(){
            this.parent();
            
            // console.log(this.tween._currentElapsed);
            
            // console.log(this.testEnt.pos);
        },
        draw:function(){
            this.parent();

            if (this.drawTestCase3Info !== null && typeof(this.drawTestCase3Info) === "function") {
                this.drawTestCase3Info();
            }
        },
        
        drawTestCase3Info: function() {
            ig.system.context.save();
            ig.system.context.fillStyle = this.foregroundColor;
            ig.system.context.font = "18px Arial";
            ig.system.context.textBaseline = "middle";
            ig.system.context.textAlign = "center";
            ig.system.context.fillText( "Tween control test", 800, 25);
            ig.system.context.restore();
        }
    });
});