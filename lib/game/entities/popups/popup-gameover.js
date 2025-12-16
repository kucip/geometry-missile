ig.module('game.entities.popups.popup-gameover')
    .requires(
        'impact.entity',
        'game.entities.popups.popup',
        'game.entities.buttons.button-home',
        'game.entities.buttons.button-replay',
        'game.entities.buttons.button-rv'
    )
    .defines(function () {
        EntityPopupGameOver = EntityPopup.extend({
            image: new ig.Image('media/graphics/game/popup.png'),
            iconMusic: new ig.Image('media/graphics/game/music-icon.png'),
            iconSfx: new ig.Image('media/graphics/game/sfx-icon.png'),
            title: _STRINGS.Game.GameOver.toUpperCase(),
            titleFontSize: 130,
            score: 0,
            best: 0,
            scoreText: _STRINGS.Game.Score.toUpperCase(),
            bestText: _STRINGS.Game.Best,

            addEntities: function () {
                this.score = ig.game.score;
                this.best = ig.game.bestScore;
                
                this.btnHome = ig.game.spawnEntity(EntityButtonHome, 0, 0, {_parent: this});
                this.btnReplay = ig.game.spawnEntity(EntityButtonReplay, 0, 0, {_parent: this});
                if(_SETTINGS.RewardedVideo.Enabled) {
                    this.btnRV = ig.game.spawnEntity(EntityButtonRV, 0, 0, {_parent: this});
                    this.buttons.push(this.btnRV);
                }

                this.buttons.push(this.btnHome, this.btnReplay);

                ig.game.sortEntitiesDeferred();
            },

            update: function () {
                this.parent();
                this.btnHome.pos = {
                    x: this.pos.x + this.halfSize.x - this.btnHome.halfSize.x - 120,
                    y: this.pos.y + this.halfSize.y + 240
                };
                this.btnReplay.pos = {
                    x: this.pos.x + this.halfSize.x - this.btnReplay.halfSize.x + 120,
                    y: this.pos.y + this.halfSize.y + 240
                };
                if(this.btnRV) {
                    this.btnRV.pos = {
                        x: this.pos.x + this.halfSize.x - this.btnRV.halfSize.x,
                        y: this.pos.y + this.halfSize.y + 540
                    };
                }
            },

            extraDraw: function(c) {
                c.save();
                c.font = "100px bold mainfont";
                c.textAlign = 'right';
                c.textBaseline = 'middle';
				c.fillStyle = this.titleColor;
                c.lineJoin = 'miter';
                c.miterLimit = 2;
                c.fillText(this.scoreText, 70, -80);
                c.fillText(this.bestText, 70, 80);

                c.font = "100px mainfont";
                c.textAlign = 'left';
                c.fillText(this.score, 70, -80);
                c.fillText(this.best, 70, 80);
                c.restore();
            },
        });
    });