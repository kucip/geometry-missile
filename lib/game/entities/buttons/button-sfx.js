ig.module('game.entities.buttons.button-sfx')
.requires(
    'impact.entity',
    'game.entities.buttons.button'
)
.defines(function() {
    EntityButtonSFX = EntityButton.extend({

        isOn: true,
        onImage: new ig.Image("media/graphics/game/btn-on.png"),
        offImage: new ig.Image("media/graphics/game/btn-off.png"),

        setup: function() {
            if (ig.game.sessionData.sound == 0) {
                this.isOn = false;
                this.image = this.offImage;
            } else {
                this.isOn = true;
                this.image = this.onImage;
            }
        },

        callback: function() {
            this.isOn = !this.isOn;
            if (this.isOn) {
                ig.game.save("sound", 1);
            } else {
                ig.game.save("sound", 0);
            }
            ig.game.loadAudio();
            this.image = this.isOn ? this.onImage : this.offImage;
        }
    });
});