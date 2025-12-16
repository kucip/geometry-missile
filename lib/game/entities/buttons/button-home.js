ig.module('game.entities.buttons.button-home')
	.requires(
		'game.entities.buttons.button'
	)
	.defines(function () {
		EntityButtonHome = EntityButton.extend({
            zIndex: 1000,
			image: new ig.Image('media/graphics/game/home-button.png'),

			callback: function() {
				if (ig.game.controller.isPaused) {
					ig.game.director.jumpTo(LevelMenu);
				} else {
					this._parent.hide();
				}
			},
			
		});
	});