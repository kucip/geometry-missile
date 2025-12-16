ig.module('game.entities.menu.menu-controller')
.requires(
	'impact.entity',

    'game.entities.buttons.button-play',
    'game.entities.buttons.button-settings',
    'game.entities.buttons.button-fullscreen',
    'game.entities.buttons.button-more-games',

    'game.entities.popups.popup-settings'
)
.defines(function() {
    EntityMenuController = ig.Entity.extend({
        zIndex: 0,
        pos:new Vector2(0,0),
        size:new Vector2(0,0),

        bg: new ig.Image( 'media/graphics/game/bg-game.png' ),
        title: new ig.Image( 'media/graphics/game/logo.png' ),

        init:function(x,y,settings){
            this.parent(x,y,settings);
            ig.game.controller = this;
            ig.game.score = 0;
            ig.game.bestScore = ig.game.load('bestScore') || 0;
            // Buttons
            this.buttons = {};
            this.buttons.btnPlay = ig.game.spawnEntity(EntityButtonPlay, 0, -999, {_parent: this});
            this.buttons.btnSettings = ig.game.spawnEntity(EntityButtonSettings, 0, -999, {_parent: this});
            this.buttons.btnMoreGames = ig.game.spawnEntity(EntityButtonMoreGames, 0, -999, {_parent: this});
            this.buttons.btnFullscreen = ig.game.spawnEntity(EntityButtonFullscreen, 0, -999, {_parent: this});

          
            ig.game.sortEntitiesDeferred();
        },

        update: function() {
            // Update all entities and backgroundMaps
            this.parent();
            // Add your own, additional update code here
        },
        
        draw: function() {
            this.parent();
            // Draw all entities and backgroundMaps
            var ctx = ig.system.context;
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.globalAlpha = this.alpha;
            // BACKGROUND
            // ctx.fillStyle = "#C2CBF0";
            // ctx.fillRect(0, 0, ig.system.width, ig.system.height);
            ig.util.drawImageScaled(this.bg);

            this.title.draw(ig.system.width/2 - this.title.width/2, ig.system.height/2 - this.title.height*1.5);
            
            ctx.restore();
        },

        settings: function() {
            ig.game.spawnEntity(EntityPopupSettings, 0, -999, {_parent: this});
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