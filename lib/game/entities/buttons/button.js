ig.module("game.entities.buttons.button")
	.requires("impact.entity", "plugins.data.vector")
	.defines(function () {
		EntityButton = ig.Entity.extend({
            collides: ig.Entity.COLLIDES.NEVER,
            visible: true,
            isClickable: true,
            font: 'px mainfont',
            scale: 1,
            alpha: 1,
            scaleDirection: 1, // 1 để phóng to, -1 để thu nhỏ
            scaleSpeed: 0.003, // Tốc độ scale cho giai đoạn khởi đầu
            isPulsing: false, // Xác định xem hiệu ứng pulse đã bắt đầu hay chưa
            zIndex: 1300,
            enabled: true,
            isFlipped: false,

            init: function (x, y, settings) {
                this.parent(x, y, settings);
				this.setup();
                if(this.image) {
                    this.size.x = this.image.width;
                    this.size.y = this.image.height;
                }
                this.halfSize = {
                    x: this.size.x / 2,
                    y: this.size.y / 2
                }
                if (ig.global.wm) return;
                if(this._parent) this.zIndex = this._parent.zIndex + 10;
                this.scaleAnim = this.tween({
                    scale: 0.9
                }, 0.04, {
                    loop: ig.Tween.Loop.Reverse,
                    loopCount: 1,
                    onComplete: this.callback.bind(this)
                });
                this.clickTime = ig.system.clock.delta();
                this.repos();
            },

            clicked: function () {
                if (!this.visible) return;
                // save timer
                var temp = this.clickTime;
                // reset timer
                this.clickTime = ig.system.clock.delta();
                if (this.clickTime - temp < 0.1) {
                    // handle spamming/double click
                    return;
                }
                if (!this.enabled) return;
                this.playSFX();
                this.scaleAnim.start();
            },

            playSFX: function () {
				ig.soundHandler.sfxPlayer.play('click');
            },

            draw: function () {
                if (this.visible) {
                    var c = ig.system.context;
                    c.save();
                    c.globalAlpha = this.alpha;
                    c.translate(
                        ig.system.getDrawPos(this.pos.x - ig.game.screen.x + this.halfSize.x),
                        ig.system.getDrawPos(this.pos.y - ig.game.screen.y + this.halfSize.y)
                    );
                    c.scale(this.scale, this.scale);
                    if(!this.isFlipped) {
                        if(this.image) this.image.draw(-this.halfSize.x, -this.halfSize.y);
                    } 
                    else {
                        if(this.image) this.image.drawTile(-this.halfSize.x, -this.halfSize.y, 0, this.size.x, this.size.y, true);
                    }
                    this.drawText(c);
                    this.extraDraw(c);
                    c.restore();
                }
            },

            update: function () {
                this.visible && this.parent();
            },

            pulseEffect: function() {
				if(this.isPulsing) {
                    // Giai đoạn pulse: Scale từ 1 -> 1.1 và ngược lại
                    if (this.scale >= 1.1) {
                        this.scaleDirection = -1; // Thu nhỏ
                    } else if (this.scale <= 1) {
                        this.scaleDirection = 1; // Phóng to
                    }
                    this.scale += this.scaleSpeed * this.scaleDirection;
                }
			},

			sparkleEffect: function(c) {
				// Hiệu ứng lấp lánh
				var gradient = c.createLinearGradient(-this.halfSize.x, -this.halfSize.y, -this.halfSize.x + this.size.x, -this.halfSize.y);
				var offset = (Date.now() % 2000) / 2000; // Offset lấp lánh
				gradient.addColorStop(Math.max(0, offset - 0.2), 'rgba(255,255,255,0)');
				gradient.addColorStop(Math.min(1, offset), 'rgba(255,255,255,0.5)');
				gradient.addColorStop(Math.min(1, offset + 0.2), 'rgba(255,255,255,0)');

				c.globalCompositeOperation = 'lighter';
				c.fillStyle = gradient;
				c.fillRect(-this.halfSize.x, -this.halfSize.y, this.size.x, this.size.y);
			},

            drawText: function(c) {},
            extraDraw: function(c) {},
            setup: function () {},
            callback: function () {},
            repos: function () {},

        });

        EntityButtonFix = EntityButton.extend({

            underPointer: function () {
                var p = ig.game.io.getClickPos();
                return this.containPoint(p);
            },

            draw: function () {
                if (this.visible) {
                    var c = ig.system.context;
                    c.save();
                    c.setTransform(1, 0, 0, 1, 0, 0);
                    c.translate(
                        ig.system.getDrawPos(this.pos.x + this.halfSize.x),
                        ig.system.getDrawPos(this.pos.y + this.halfSize.y)
                    );
                    c.scale(this.scale.x, this.scale.y);
                    this.image.draw(-this.halfSize.x, -this.halfSize.y);
                    this.drawText(c);
                    c.restore();
                }
            },

            drawText: function(c){}
        });
	});
