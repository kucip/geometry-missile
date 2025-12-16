ig.module('game.entities.buttons.button-play')
	.requires(
		'game.entities.buttons.button'
	)
	.defines(function () {
		EntityButtonPlay = EntityButton.extend({
            zIndex: 1000,
			image: new ig.Image('media/graphics/game/button-play.png'),

			callback: function() {
				if(ig.game.editorMode) {
					ig.game.director.jumpTo(LevelEditor);
				} else {
		            ig.game.level = 1;
					ig.game.director.jumpTo(LevelIngame);
				}
			},

			drawText: function(c) {
                // c.save();
                // c.font = '100px mainfont';
                // c.fillStyle = '#000000';
                // c.textAlign = 'center';
                // c.textBaseline = 'middle';
                // c.globalAlpha = this.alpha;
                // c.fillText('PLAY', 0, 0);
                // c.restore();
            },

			repos: function() {
				this.pos.x = ig.game.midX - this.halfSize.x + ig.game.screen.x;
				this.pos.y = ig.game.midY + ig.game.screen.y;
			},
			
		});
	});