ig.module('game.entities.ingame.ingame-controller')
.requires(
    'impact.entity',
    'game.entities.buttons.button-pause',
    'game.entities.popups.popup-pause',
    'game.entities.popups.popup-gameover',
    'game.entities.ingame.obstacle',
    'game.entities.ingame.gate',
    'game.entities.ingame.player',
    'game.polygon-collider'
)
.defines(function() {
    EntityIngameController = ig.Entity.extend({
        zIndex: 0,
        pos:new Vector2(0,0),
        size:new Vector2(0,0),

        bg: null,
        isPaused: false,
        gameStarted: false,
        player: null,

        init:function(x,y,settings){
            this.parent(x,y,settings);
            ig.game.controller = this;
            this.repos();

            var centerY = ig.system.height/2 - 24;
            this.player = ig.game.spawnEntity(EntityPlayer, 100, centerY, {active:false});
            // Buttons
            this.buttons = {};
            this.buttons.btnPause = ig.game.spawnEntity(EntityButtonPause, 0, -999, {_parent: this});
       

            this.levelObstacles = _MAP_SETTINGS['level'+ig.game.level].obstacles.slice();
            this.spawnedIndex = 0;
            this.offPosX = _MAP_SETTINGS['level'+ig.game.level].offX;

            ig.soundHandler.startBGM();
        },

        spawnObstacles: function() {            
            var screenEndX = ig.game.screen.x + ig.system.width + 1400;

            while (
                this.spawnedIndex < this.levelObstacles.length &&
                this.levelObstacles[this.spawnedIndex].pos.x <= screenEndX
            ) {
                var obs = this.levelObstacles[this.spawnedIndex];
                if (obs.obstacle == 'gate') {
                    this.gate = ig.game.spawnEntity(EntityGate, obs.pos.x + this.offPosX, ig.system.height / 2 - obs.pos.y + ig.game.screen.y, {
                        size: obs.size,
                    });
                } else {
                    ig.game.spawnEntity(EntityObstacle, obs.pos.x + this.offPosX, ig.system.height / 2 - obs.pos.y + ig.game.screen.y, {
                        shapeType: obs.obstacle,
                        scale: obs.scale || { x: 1, y: 1 },
                        flip: obs.flip || { x: 1, y: 1 }
                    });
                }
                this.spawnedIndex++;
            }
        },

        pause: function() {
            this.isPaused = true;
            this.pausePanel = ig.game.spawnEntity(EntityPopupPause, 0, -999, {_parent: this});
        },

        resume: function() {
            this.pausePanel.hide();
            this.pausePanel = null;
        },

        gameOver: function() {
            if (this.isGameOver) return;
            this.isPaused = true;
            this.isGameOver = true;
            
            ig.game.score = Math.round(ig.game.score);
            // API_END_GAME
            if(ig.game.score > ig.game.bestScore) {
                ig.game.bestScore = ig.game.score;
                ig.game.save('bestScore', ig.game.bestScore);
            }
            this.tween({}, 1, {
                onComplete: function () {
                    this.gameoverPanel = ig.game.spawnEntity(EntityPopupGameOver, 0, -999, {_parent: this});

                }.bind(this)
            }).start();
        },

        replay: function() {
            ig.game.score = 0;
            ig.game.level = 1;
            ig.game.director.jumpTo(LevelIngame);
        },

        revive: function() {
            ig.game.director.jumpTo(LevelIngame);
        },

        update: function() {
            this.parent();

            this.spawnObstacles();
            
            if (!this.gameStarted) {
                if (ig.input.pressed('click') && !this.buttons.btnPause.underPointer() && !this.pausePanel) {
                    this.buttons.btnPause.visible = false;
                    this.gameStarted = true;
                    if (this.player) {
                        this.player.active = true;
                    }
                }
            } else {
                if(!this.isPaused) {
                    // update score
                    ig.game.score += ig.system.tick * ig.game.level;                           
                }
            }
        },
        
        draw: function() {
            this.parent();
            var ctx = ig.system.context;
            ctx.save();
            ctx.fillStyle = '#181A20';
            ctx.fillRect(0, 0, ig.system.width, ig.system.height);
            ctx.restore();

            if (this.mapArea) {
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, ig.system.width, this.mapArea.top);
                ctx.fillRect(0, this.mapArea.bottom, ig.system.width, ig.system.height - this.mapArea.bottom);
                
                // Add white border lines at ceiling edges
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 7;
                ctx.beginPath();
                // Top ceiling border
                ctx.moveTo(0, this.mapArea.top);
                ctx.lineTo(ig.system.width, this.mapArea.top);
                // Bottom ceiling border
                ctx.moveTo(0, this.mapArea.bottom);
                ctx.lineTo(ig.system.width, this.mapArea.bottom);
                ctx.stroke();

                ctx.save();
                var fontSize = Math.min(120, this.mapArea.top - 10);
                ctx.font = fontSize + 'px bold mainfont';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(_STRINGS.Game["Score"] + Math.round(ig.game.score), ig.system.width / 2, this.mapArea.top / 2);
                
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(_STRINGS.Game["Level"] + ig.game.level, 20, this.mapArea.top / 2);
                ctx.restore();
                
                ctx.restore();
            }

            if (!this.gameStarted) {
                ctx.save();
                ctx.font = '50px bold mainfont';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(_STRINGS.Game["Click-to-play"], ig.system.width/2, ig.system.height/2 - 100);
                ctx.restore();
            }
        },

        repos: function() {
            this.mapArea = {
                top: (ig.system.height - _MAP_SETTINGS['level'+ig.game.level].size.height) / 2,
                bottom: (ig.system.height + _MAP_SETTINGS['level'+ig.game.level].size.height) / 2,
            };    
        },

        disableButtons: function(type) {
            type = type || false;

            for(var idx in this.buttons) {
                this.buttons[idx].enabled = !type;
                if(this.buttons[idx].onDisable instanceof Function)this.buttons[idx].onDisable()
            }
        }   
    });
});