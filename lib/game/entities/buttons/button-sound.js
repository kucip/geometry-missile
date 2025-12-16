ig.module('game.entities.buttons.button-sound')
.requires(
	'game.entities.buttons.button'
)
.defines(function() {
	EntityButtonSound = EntityButton.extend({
		type:ig.Entity.TYPE.A,
		gravityFactor:0,
		logo: new ig.AnimationSheet('branding/logo.png',_SETTINGS['Branding']['Logo']['Width'],_SETTINGS['Branding']['Logo']['Height']),
		zIndex:10001,
		size:{x:50,
			y:50,
		},
        volume: 0.5,
        mutedFlag:false,
        
		name:"soundtest",
		init:function(x,y,settings){
			this.parent(x,y,settings);

			this.mutedFlag = !!(ig.game.sessionData.music === 0 || ig.game.sessionData.sound === 0);

			if(ig.global.wm)
			{
				return;
			}
		},
        draw:function()
        {
            this.parent();
            ig.system.context.fillRect(this.pos.x,this.pos.y,50,50);
        },
        clicked:function()
		{
            console.log("pressed");
			if(this.mutedFlag)
            {
                console.log("unmute")

				/** volume */
				ig.soundHandler.bgmPlayer.volume(this.volume);
				ig.soundHandler.sfxPlayer.volume(this.volume);

				/** save session data */
				ig.game.save("music", 0.5);
				ig.game.save("sound", 0.5);
                
				/** unmute */
                ig.soundHandler.unmuteAll();

                this.mutedFlag=false;
            }
            else
            {
                console.log("mute")

				/** mute */
                ig.soundHandler.muteAll();

				/** volume */
				ig.soundHandler.bgmPlayer.volume(0);
				ig.soundHandler.sfxPlayer.volume(0);

				/** save session data */
				ig.game.save("music", 0);
				ig.game.save("sound", 0);

                this.mutedFlag=true;
            }
			
		},
		clicking:function()
		{
			
		},
		released:function()
		{
			
		}
	});
});