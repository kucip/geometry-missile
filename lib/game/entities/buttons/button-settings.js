ig.module('game.entities.buttons.button-settings')
.requires(
	'impact.entity',
	'game.entities.buttons.button'
)
.defines(function() {
	EntityButtonSettings = EntityButton.extend({

		image: new ig.Image("media/graphics/game/button-settings.png"),

		callback: function() {
			ig.game.controller.settings();
		},

		repos: function() {
			this.pos.x = ig.game.midX - this.halfSize.x + ig.game.screen.x;
			this.pos.y = ig.game.midY + 500 + ig.game.screen.y;
		}
	});
});