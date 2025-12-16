/**
 *  Opening MarketJS Logo
 *
 *  Created by Nam Le in Feb 2023.
 *  Copyright (c) MarketJS. All rights reserved.
 */

ig.module('game.entities.marketjs-splash').requires('impact.entity')
	.defines(function () {
		EntityMarketJSSplash = ig.Entity.extend({
			logoImage: new ig.Image('media/graphics/splash/marketjs/logo.png'),
			letterImage: new ig.Image('media/graphics/splash/marketjs/letter-m.png'),
			brandingText: new ig.Image('media/graphics/splash/marketjs/branding-text.png'),
			scale: {
				x: 1,
				y: 1
			},

			init: function (x, y, settings) {
				if (!_SETTINGS['DeveloperBranding']['Splash']['Enabled']) {
					this.goToMenu();
					return;
				}
				this.updateScale();
				this.originX = 0;
				/* LOGO */
				this.logo = {
					scale: 0.02,
					alpha: 0,
					x: -this.logoImage.width / 2,
					y: -this.logoImage.height / 2,
				}

				var tween1 = this.tween({
					logo: {
						scale: 1,
						alpha: 1
					}
				}, 0.48, {
					delay: 0.3,
					easing: ig.Tween.Easing.Back.EaseOut,
					onComplete: function () {
						ig.soundHandler.sfxPlayer.play("logosplash1");
						this.tween({}, 0.59, {
							onComplete: function () {
								ig.soundHandler.sfxPlayer.play("logosplash2");
							}
						}).start();
					}.bind(this)
				});

				/* LETTER M */
				this.letterM = {
					scale: 0.02,
					alpha: 0,
					x: -this.letterImage.width / 2,
					y: -this.letterImage.height / 2 - 10
				}

				var tween2 = this.tween({
					letterM: {
						scale: 1,
						alpha: 1
					}
				}, 0.48, {
					easing: ig.Tween.Easing.Back.EaseOut
				});

				/* BRANDING TEXT */
				this.text = {
					alpha: 1,
					x: -this.brandingText.width / 2,
					y: -this.brandingText.height / 2,
					coverW: 2 * this.brandingText.width,
					coverH: 2 * this.brandingText.height
				}
				this.text.originX = -this.brandingText.width / 2 - 270;
				this.text.cx = -this.text.coverW - 260;
				this.text.cy = -this.brandingText.height;

				/* Move Left */
				var tween3 = this.tween({
					originX: -450,
					logo: {
						scale: 0.82
					},
					letterM: {
						scale: 0.82
					},
					text: {
						originX: 150
					}
				}, 0.78, {
					delay: 0.4,
					easing: ig.Tween.Easing.Back.EaseOut
				});

				/* Fade out */
				var tween4 = this.tween({
					logo: {
						alpha: 0
					},
					letterM: {
						alpha: 0
					},
					text: {
						alpha: 0
					}
				}, 0.9, {
					delay: 1.5,
					onComplete: function () {
						this.goToMenu();
					}.bind(this)
				});

				tween1.chain(tween2);
				tween2.chain(tween3);
				tween3.chain(tween4);
				tween1.start();

				this.tween({}, 0.25, {
					onComplete: function () {
						ig.soundHandler.sfxPlayer.play("logosplash1");
					}
				}).start();
			},

			goToMenu: function () {
				ig.soundHandler.sfxPlayer.soundList.logosplash1.mute(true);
				ig.soundHandler.sfxPlayer.soundList.logosplash2.mute(true);
				ig.soundHandler.bgmPlayer.play("background");
				ig.game.director.nextLevel();
				this.kill();
			},

			update: function () {
				/* Default tween update */
				if (this.tweens.length > 0) {
					var currentTweens = [];
					for (var i = 0; i < this.tweens.length; i++) {
						this.tweens[i].update();
						if (!this.tweens[i].complete) currentTweens.push(this.tweens[i]);
					}
					this.tweens = currentTweens;
				}
				/* Update scale */
				this.updateScale();
			},

			draw: function () {
				var c = ig.system.context;
				c.fillStyle = "#FFF";
				c.fillRect(0, 0, ig.system.width, ig.system.height);

				c.save();
				c.translate(ig.system.width / 2, ig.system.height / 2);
				c.scale(this.scale.x, this.scale.y);
				c.imageSmoothingEnabled = true;

				// DRAW TEXT
				c.globalAlpha = this.text.alpha;
				this.brandingText.draw(this.text.originX + this.text.x, this.text.y);
				/* TEXT COVER */
				// c.fillStyle = "#F00";
				c.globalAlpha = 1;
				c.fillRect(this.text.cx, this.text.cy, this.originX - this.text.cx, this.text.coverH);

				// DRAW LOGO
				c.save();
				c.globalAlpha = this.logo.alpha;
				c.scale(this.logo.scale, this.logo.scale);
				this.logoImage.draw(this.originX + this.logo.x, this.logo.y);
				c.restore();

				// DRAW LETTER M
				c.save();
				c.globalAlpha = this.letterM.alpha;
				c.scale(this.letterM.scale, this.letterM.scale);
				this.letterImage.draw(this.originX + this.letterM.x, this.letterM.y);
				c.restore();

				c.restore();
			},

			updateScale: function () {
				if (this.skipUpdateScale) return;
				var r0 = window.innerWidth / window.innerHeight;
				var r1 = ig.system.height / 1280,
					r2 = ig.system.width / 1280;
				if (ig.responsive) {
					this.scale.x = this.scale.y = r0 > 1 ? r1 : r2;
				} else if (ig.ua.mobile && !ig.sizeHandler.disableStretchToFitOnMobileFlag) {
					var r = ig.system.width / ig.system.height;
					if (r0 > 1) {
						this.scale.x = r / r0 * r1;
						this.scale.y = r1;
					} else {
						this.scale.x = r2;
						this.scale.y = r0 / r * r2;
					}
				} else {
					this.skipUpdateScale = true;
					r2 = ig.system.width / 1080;
					this.scale.x = this.scale.y = r1 < r2 ? r1 : r2;
				}

				if (this.scale.x > 1) this.scale.x = 1;
				if (this.scale.y > 1) this.scale.y = 1;
			}

		});
	});