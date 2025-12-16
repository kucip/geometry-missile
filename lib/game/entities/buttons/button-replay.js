ig.module('game.entities.buttons.button-replay')
	.requires(
		'game.entities.buttons.button'
	)
	.defines(function () {
		EntityButtonReplay = EntityButton.extend({
            zIndex: 1000,
			image: new ig.Image('media/graphics/game/replay-button.png'),

			callback: function() {
				// ig.game.director.jumpTo(LevelMenu);
				ig.game.controller.replay();
			},
			
		});
	});