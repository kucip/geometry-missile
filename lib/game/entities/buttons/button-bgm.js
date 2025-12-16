ig.module('game.entities.buttons.button-bgm')
.requires(
	'impact.entity',
	'game.entities.buttons.button'
)
.defines(function() {
	EntityButtonBGM = EntityButton.extend({

		isOn: true,
		onImage: new ig.Image("media/graphics/game/btn-on.png"),
		offImage: new ig.Image("media/graphics/game/btn-off.png"),
		setup: function() {
            if (ig.game.sessionData.music == 0) {
                this.isOn = false;
                this.image = this.offImage;
            } else {
                this.isOn = true;
                this.image = this.onImage;
            }
        },

		callback: function() {
			this.isOn = !this.isOn;
            if(ig.game.sessionData.music == 0) {
                ig.game.save("music", 0.5);
                ig.game.loadAudio();
            } else {
                ig.game.save("music", 0);
                ig.game.loadAudio();
            };
            this.image = this.isOn ? this.onImage : this.offImage;
		}
	});
});