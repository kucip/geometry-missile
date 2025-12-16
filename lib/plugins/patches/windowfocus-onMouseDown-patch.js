// Jason Low's Window Focus onMouseDown Patch
// adds window.focus() on mouseDown event
// ver 1.0

/**
* Edited by Justin Ng to be fixed with ig.Input.inject and IFRAME detection
* ver 1.1
*
* Edited by Leong Yew Meng to include impact.input module
* ver 1.2
*/

// How To Use:
// 1- Copy plugin to plugin directory
// 2- include plugin in impact.main

// Usage Examples:
/*
ig.module(
    "game.main"
)
.requires(
    //IMPACT
    "impact.game",
    "plugins.windowfocus-onMouseDown-patch",
)
*/

ig.module(
    "plugins.patches.windowfocus-onMouseDown-patch"
).requires(
    "impact.input"
).defines(function () {

    var iframetest=false;
    (function inIframeTest(){
        
        try 
        {
            iframetest = (window.self !== window.top);
            if(iframetest===false)
            {
                var frames = window.frames; // or // var frames = window.parent.frames;
                iframetest=(frames.length>0);    
            }
            //In cross domain situations window.parent.frames will throw an exception if 
            //the domains are different so I chose not to use it.
            
        } 
        catch (e) 
        {
            iframetest= true;
        }
    })();
    
    //inject
    ig.Input.inject({
        keydown:function(event)
        {
            var tag = event.target.tagName;
            if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }

            var code = event.type == 'keydown'
                ? event.keyCode
                : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);

            if(iframetest&& code < 0 ) {
                window.focus();
            }
            
            if( event.type == 'touchstart' || event.type == 'mousedown' ) {
                this.mousemove( event );
            }

            var action = this.bindings[code];
            if( action ) {
                this.actions[action] = true;
                if( !this.locks[action] ) {
                    this.presses[action] = true;
                    this.locks[action] = true;
                }
                event.stopPropagation();
                event.preventDefault();
            }
        }
    })
});
