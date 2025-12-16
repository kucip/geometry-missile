ig.module('game.entities.popups.popup-pause')
    .requires(
        'impact.entity',
        'game.entities.popups.popup',
        'game.entities.buttons.button-bgm',
        'game.entities.buttons.button-sfx',
        'game.entities.buttons.button-home',
        'game.entities.buttons.button-replay',
        'game.entities.buttons.button-resume'
    )
    .defines(function () {
        EntityPopupPause = EntityPopup.extend({
            image: new ig.Image('media/graphics/game/popup.png'),
            iconMusic: new ig.Image('media/graphics/game/music-icon.png'),
            iconSfx: new ig.Image('media/graphics/game/sfx-icon.png'),
            title: _STRINGS.Game.Pause,

            addEntities: function () {
                this.btnMusic = ig.game.spawnEntity(EntityButtonBGM, 0, 0, {_parent: this});
                this.btnSfx = ig.game.spawnEntity(EntityButtonSFX, 0, 0, {_parent: this});
                this.btnHome = ig.game.spawnEntity(EntityButtonHome, 0, 0, {_parent: this});
                this.btnReplay = ig.game.spawnEntity(EntityButtonReplay, 0, 0, {_parent: this});
                this.btnResume = ig.game.spawnEntity(EntityButtonResume, 0, 0, {_parent: this});

                this.buttons.push(this.btnMusic, this.btnSfx, this.btnHome, this.btnReplay, this.btnResume);

                ig.game.sortEntitiesDeferred();
            },

            update: function () {
                this.parent();
                this.btnMusic.pos = {
                    x: this.pos.x + this.halfSize.x,
                    y: this.pos.y + this.halfSize.y + 70
                };
                this.btnSfx.pos = {
                    x: this.pos.x + this.halfSize.x,
                    y: this.pos.y + this.halfSize.y - 110
                };
                this.btnHome.pos = {
                    x: this.pos.x + this.halfSize.x - this.btnHome.halfSize.x - 250,
                    y: this.pos.y + this.halfSize.y + 240
                };
                this.btnReplay.pos = {
                    x: this.pos.x + this.halfSize.x - this.btnReplay.halfSize.x,
                    y: this.pos.y + this.halfSize.y + 240
                };
                this.btnResume.pos = {
                    x: this.pos.x + this.halfSize.x - this.btnResume.halfSize.x + 250,
                    y: this.pos.y + this.halfSize.y + 240
                };
            },

            extraDraw: function(c) {
                this.iconSfx.draw(-200, -110);
                this.iconMusic.draw(-200, 70);
            },
            callback2: function() {
                ig.game.controller.isPaused = false;
            }
        });
    });