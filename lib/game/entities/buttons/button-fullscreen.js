ig.module('game.entities.buttons.button-fullscreen')
.requires(
	'impact.entity',
	'game.entities.buttons.button'
)
.defines(function() {
	EntityButtonFullscreen = EntityButton.extend({

		btnFullscreenImage: new ig.Image("media/graphics/sprites/btn-expand.png"),
        btnFullscreenExitImage: new ig.Image("media/graphics/sprites/btn-shrink.png"),

        setup: function() {
            if (!ig.Fullscreen.isFullscreen()) {
                this.image = this.btnFullscreenImage;
            } else {
                this.image = this.btnFullscreenExitImage;
            }
        },

        update: function() {
            this.parent();
            if (!ig.Fullscreen.isFullscreen()) {
                this.image = this.btnFullscreenImage;
            } else {
                this.image = this.btnFullscreenExitImage;
            }
        },

        callback: function() {
            ig.Fullscreen.toggleFullscreen();
        },

		repos: function() {
            this.pos.x = 20 + ig.game.screen.x;
            this.pos.y = ig.system.height * 0.055 + 20 + ig.game.screen.y;
		}
		
	});
});