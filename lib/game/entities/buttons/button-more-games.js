ig.module('game.entities.buttons.button-more-games')
	.requires(
		'game.entities.buttons.button', 'plugins.clickable-div-layer'
	)
	.defines(function () {
		EntityButtonMoreGames = EntityButton.extend({
			type: ig.Entity.TYPE.A,
			gravityFactor: 0,
			image: new ig.Image('media/graphics/game/button-more-games.png'),
			zIndex: 2000,
			clickableLayer: null,
			link: null,
			newWindow: false,
			div_layer_name: "more-games",
			name: "moregames",
			init: function (x, y, settings) {
				this.parent(x, y, settings);

				if (ig.global.wm) {
					return;
				}

				if (!_SETTINGS.MoreGames.Enabled) {
					this.kill();
					return;
				}

				if (settings.div_layer_name) {
					this.div_layer_name = settings.div_layer_name;
				} else {
					this.div_layer_name = 'more-games'
				}

				if (_SETTINGS.MoreGames.Link) {
					this.link = _SETTINGS.MoreGames.Link;
				}

				if (_SETTINGS.MoreGames.NewWindow) {
					this.newWindow = _SETTINGS.MoreGames.NewWindow;
				}

				this.clickableLayer = new ClickableDivLayer(this);
				this.repos();
			},
			show: function () {
				var elem = ig.domHandler.getElementById("#" + this.div_layer_name);
				if (elem) {
					ig.domHandler.show(elem);
				}
			},
			hide: function () {
				var elem = ig.domHandler.getElementById("#" + this.div_layer_name);
				if (elem) {
					ig.domHandler.hide(elem);
				}
			},
			onDisable:function(){
				if(!this.enabled)this.hide();
				else this.show();
			},
			repos: function () {
				var x = 180, y = ig.system.height * 0.055 + 20;
				this.pos.x = x + ig.game.screen.x;
				this.pos.y = y + ig.game.screen.y;;
				this.clickableLayer && this.clickableLayer.updatePos(x, y);
			}
		});
	});