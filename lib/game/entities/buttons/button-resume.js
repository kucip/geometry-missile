ig.module('game.entities.buttons.button-resume')
	.requires(
		'game.entities.buttons.button'
	)
	.defines(function () {
		EntityButtonResume = EntityButton.extend({
            zIndex: 1000,
			image: new ig.Image('media/graphics/game/resume-button.png'),

			callback: function() {
				ig.game.controller.resume();
			},
			
		});
	});