ig.module('game.entities.pointer')
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPointer = ig.Entity.extend({
        checkAgainst: ig.Entity.TYPE.BOTH,
        
        size: new Vector2(1,1),

        isFirstPressed: false,
        isPressed: false,
        isReleased: false,
        isHovering: false,

        hoveringItem: null,
        objectArray: [] ,

        clickedObjectList: [],

        ignorePause: true,

        zIndex: 5500,

        check: function( other ) {

            this.objectArray.push(other);
        },

        clickObject: function(targetobject){
            // if first pressed
            if(this.isFirstPressed){
                if(typeof(targetobject.clicked) == 'function'){
                    targetobject.clicked();
                    this.addToClickedObjectList(targetobject);
                }
            }
            // if pressed
            if(this.isPressed && !this.isReleased){
                if(typeof(targetobject.clicking) == 'function'){
                    targetobject.clicking();
                }
            }
            // if released
            if(this.isReleased){
                if(typeof(targetobject.released) == 'function'){
                    targetobject.released();
                    this.removeFromClickedObjectList(targetobject);
                }
            }
        },

        refreshPos: function() {
            this.pos = ig.game.io.getClickPos();
        },

        update: function() {
            this.parent();
            this.refreshPos();

            var targetObject = null ;
            var highestIndex = -1 ;

            // Find top Entity
            for(var objectIndex = this.objectArray.length -1 ; objectIndex > -1 ; objectIndex --){
                if(this.objectArray[objectIndex].zIndex > highestIndex){
                    highestIndex = this.objectArray[objectIndex].zIndex;
                    targetObject = this.objectArray[objectIndex];
                }
            }

            if(targetObject != null){
                // Entity found within pointer area

                if(this.hoveringItem != null){
                    // If there was a hovering item registered from before:
                    // If hovering over a different Entity from before
                    if(this.hoveringItem != targetObject){
                        // Do leave() for previously hovered over Entity
                        if(typeof(this.hoveringItem.leave) == 'function'){
                            this.hoveringItem.leave();
                        }

                        // Do over() for current hovered over Entity
                        if(typeof(targetObject.over) == 'function'){
                            targetObject.over();
                        }
                    }

                }else{
                    // If no hovering item registered from before:
                    // Do over() for current hovered over Entity
                    if(typeof(targetObject.over) == 'function'){
                        targetObject.over();
                    }
                }

                this.hoveringItem = targetObject;
                this.clickObject(targetObject);

                // Clear array of captured objects
                this.objectArray = [];

            }else{
                // No entities found within pointer area

                // Do leave() for previously hovered over Entity
                if(this.hoveringItem != null && typeof(this.hoveringItem.leave) == 'function'){
                    this.hoveringItem.leave();
                    this.hoveringItem = null;
                }

                if(this.isReleased){
                    // do releasedOutside() function for previous entities where clicked() is executed
                    for(var i=0; i<this.clickedObjectList.length; i++){
                        var targetobject = this.clickedObjectList[i];
                        if(typeof(targetobject.releasedOutside) == 'function'){
                            targetobject.releasedOutside();
                        }
                    }
                    this.clickedObjectList = [];
                }
            }

            // Only check for the click once per frame, instead of
            // for each entity it touches in the 'check' function
            this.isFirstPressed = ig.input.pressed('click');
            this.isReleased = ig.input.released('click');
            this.isPressed = ig.input.state('click');
        },

        addToClickedObjectList: function(targetObject){
            this.clickedObjectList.push(targetObject);
        },

        removeFromClickedObjectList: function(targetObject){
            var temp = [];
            for(var i=0; i<this.clickedObjectList.length; i++){
                var obj = this.clickedObjectList[i];
                if(obj != targetObject){
                    temp.push(obj);
                }
            }
            this.clickedObjectList = temp;
        },
    });
});