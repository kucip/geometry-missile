ig.module('game.entities.buttons.button-pause')
.requires(
	'impact.entity',
	'game.entities.buttons.button'
)
.defines(function() {
	EntityButtonPause = EntityButtonFix.extend({

		image: new ig.Image("media/graphics/game/button-settings.png"),

		callback: function() {
			ig.game.controller.pause();
		},

		repos: function() {
			this.pos.x = ig.system.width - this.size.x - 20;

			this.pos.y = ig.game.controller.mapArea.top < this.size.y + 40 ? ig.game.controller.mapArea.top + 20 : 20;
		}
	});
});