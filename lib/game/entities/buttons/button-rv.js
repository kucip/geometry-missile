ig.module('game.entities.buttons.button-rv')
.requires(
	'impact.entity',
	'game.entities.buttons.button'
)
.defines(function() {
	EntityButtonRV = EntityButton.extend({

		image: new ig.Image("media/graphics/game/btn-revive.png"),
		init:function(x,y,settings){
			settings = settings || {};

			// Image			
			this.parent(x,y,settings);
		},

		callback: function() {
			this.showOverlay = true;
			this._parent.disableButtons(true);
            this.overlayMessage = "Showing ad...";
			this.enabled = false;

            setTimeout(function() {
                var adSuccess = Math.random() > 0.2;

                if (adSuccess) {
                    this.successCallback();
                } else {
                    this.failureCallback();
                }
            }.bind(this), 1000);
		},

		successCallback: function() {
            this.overlayMessage = "Successful reward!";
            setTimeout(function() {
                this.hideOverlay();
				// success logic here
				ig.game.controller.revive();
            }.bind(this), 2000);
        },

		failureCallback: function() {
            this.overlayMessage = "RV ad failed, please try again!";
            setTimeout(function() {
                this.hideOverlay();
				// failure logic here
            }.bind(this), 2000);

        },

		hideOverlay: function() {
            this.showOverlay = false;
			this._parent.disableButtons(false);
            this.overlayMessage = "";
			this.enabled = true;
        },

		draw: function() {
            this.parent();

			if (this.showOverlay) {
				var ctx = ig.system.context;
				var strLength;
				ctx.save();
				ctx.fillStyle = '#000000';
				ctx.globalAlpha = 0.8;
                ctx.fillRect(0, 0, ig.system.width, ig.system.height);

                ctx.font = "80px mainfont";
				ctx.fillStyle = "#FFFFFF";
				ctx.textAlign = "center";
				ctx.baseline = "middle";

                ig.system.context.fillText(this.overlayMessage, ig.system.width/2, ig.system.height/2);

				ctx.restore();
            }

            
        },
		
	});
});