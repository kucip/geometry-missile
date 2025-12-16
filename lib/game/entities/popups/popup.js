ig.module('game.entities.popups.popup')
    .requires(
        'impact.entity'
    )
    .defines(function () {
        EntityPopup = ig.Entity.extend({
            collides: ig.Entity.COLLIDES.NEVER,
            // image: new ig.Image('media/graphics/game/notes.png'),
            scale: 0.01,
            delayShown: 0,
            overlayAlpha: 0,
            zIndex: 1400,
            titleColor: '#ffffff',
            titleFontSize: 150,
            contentFontSize: 30,
            font: 'px mainfont',
            entities: [],
            buttons: [],
            showDt: 0.55,
			title: '',
            titleY: 180,

            init: function (x, y, settings) {
                this.parent(x, y, settings);
                if (ig.global.wm) return;
                this.setup();
                this.addEntities();
                this.pos.x = ig.game.midX - this.halfSize.x + ig.game.screen.x;
                this.pos.y = -this.size.y - 1000 + ig.game.screen.y;
                this.titleY -= this.halfSize.y;
                this.show();
                ig.game.sortEntitiesDeferred();
                // this.repos();
            },

            setup: function() {
                this.setZindex();
                this.setSize();
                this.additional();
            },

            setZindex: function() {
                if(this._parent)
                    this.zIndex = this._parent.zIndex + 10;
            },

            setSize: function() {
                this.size = {
                    x: this.image.width,
                    y: this.image.height
                }
                this.halfSize = {
                    x: this.size.x/2,
                    y: this.size.y/2
                }
            },

            additional: function() {},
            addEntities: function () {},

            show: function () {
                ig.game.controller.disableButtons(true);
                var targetY = ig.game.midY - this.halfSize.y + ig.game.screen.y;
                this.isShown = true;
                this.tween({
                    pos: {
                        y: targetY
                    },
                    overlayAlpha: 0.6,
                    scale: 1
                }, this.showDt, {
                    delay: this.delayShown,
                    easing: ig.Tween.Easing.Back.EaseOut,
                    onComplete: function () {
                        this.callbackIn();
                    }.bind(this)
                }).start();
            },

            hide: function () {
                this.disableButtons(true);
                var targetY = -this.size.y - 1000 + ig.game.screen.y;
                this.isShown = false;
                this.tween({
                    pos: {
                        y: targetY
                    },
                    scale: 0.3,
                    overlayAlpha: 0
                }, 0.4, {
                    easing: ig.Tween.Easing.Back.EaseIn,
                    onComplete: function () {
                        this.callback();
                        this.kill();
                    }.bind(this)
                }).start();
            },

            callback: function() {
                ig.game.controller.disableButtons(false);
                if (typeof this.callback2 === 'function' && this.callback2()) {
                    this.callback2();
                }
            },

            draw: function () {
                var c = ig.system.context;
                c.save();
                c.setTransform(1, 0, 0, 1, 0, 0);
                c.fillStyle = "rgba(0,0,0," + this.overlayAlpha + ")";
                c.fillRect(0, 0, ig.system.width, ig.system.height);
                c.translate(
                    ig.system.getDrawPos(this.pos.x + this.halfSize.x - ig.game.screen.x),
                    ig.system.getDrawPos(this.pos.y + this.halfSize.y - ig.game.screen.y)
                );
                c.scale(this.scale, this.scale);
                if(this.image) this.image.draw(-this.halfSize.x, -this.halfSize.y);
                this.extraDraw2(c);
                this.drawText(c);
                this.drawEntities(c);
                this.extraDraw(c);
                c.restore();
            },
            callbackIn: function () {}, // once complete showing
            extraDraw: function (c) {},
            extraDraw2: function (c) {},
            drawText: function (c) {
                c.save();
                c.font = this.titleFontSize + this.font;
                c.textAlign = 'center';
                c.textBaseline = 'middle';
				c.fillStyle = this.titleColor;
				// c.lineJoin = "round";
                c.lineJoin = 'miter';
                c.miterLimit = 2;
                c.fillText(this.title, 10, this.titleY);
                c.restore();
            },
            drawEntities: function (c) {
                for (var i = 0; i < this.entities.length; i++) {
                    this.entities[i].drawImage(c);
                }
            },
            kill: function () {
                for (var i = 0; i < this.entities.length; i++) {
                    this.entities[i].kill();
                }
                this.parent();
            },
            repos: function () {
                this.pos.x = ig.game.midX - this.halfSize.x + ig.game.screen.x;
                this.pos.y = ig.game.midY - this.halfSize.y + ig.game.screen.y;
            },
            midX: function(){
                return this.pos.x + this.halfSize.x;
            },
            midY: function(){
                return this.pos.y + this.halfSize.y;
            },
            disableButtons: function(type) {
                type = type || false;

                for(var idx in this.buttons) {
                    this.buttons[idx].enabled = !type;
                    if(this.buttons[idx].onDisable instanceof Function)this.buttons[idx].onDisable()
                }
            },
        });
    });