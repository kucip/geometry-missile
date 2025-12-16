/**
 * Input patch to correctly calculate mouse position
 * Attempt to unlock WebAudio
 */
ig.module(
    "plugins.patches.input-patch"
).requires(
    'impact.input'
).defines(function() {
    //inject
    ig.Input.inject({
        initMouse: function() {
            this.parent(); 

            ig.system.canvas.addEventListener('mouseleave', this.mouseleave.bind(this), false );
        },
        
        mousemove: function(event) {
            this.parent(event);

            /* attempt to unlock WebAudio */
            try {
                ig.soundHandler.unlockWebAudio();
            } catch (error) {}
        },

        mouseleave: function(event) {
            this.clearState("click");
        },

        keyup: function(event) {
            this.parent(event);

            if (ig.visibilityHandler) {
                ig.visibilityHandler.onChange("focus");
            }

            /* attempt to unlock WebAudio */
            try {
                ig.soundHandler.unlockWebAudio();
            } catch (error) {}
        },

        clearState: function(action) {
            this.delayedKeyup[action] = true;
            this.actions[action] = false;
        },

        clearAllState: function() {
            for (var action in this.actions) {
                this.clearState(action);
            }
        }
    })
});