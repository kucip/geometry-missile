// Jason Low's Webkit Image Smoothing Flag Patch
// Prevent usage of deprecated "CanvasRenderingContext2D.webkitImageSmoothingEnabled"
// ver 1.1.1

// notes:
// v1.1.1 - removed deprecated mozImageSmoothingEnabled

// v1.1 - replaced single quotes with double quotes for strings

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
    "plugins.webkit-image-smoothing-patch",
)
*/

ig.module(
    "plugins.patches.webkit-image-smoothing-patch"
).requires(
).defines(function () {
    if(ig.System)
    {
        ig.System.SCALE = {
            CRISP: function( canvas, context ) {
                //ig.setVendorAttribute( context, "imageSmoothingEnabled", false );
                var el = context;
                var attr = "imageSmoothingEnabled";
                var val = false;
                var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
                el[attr] = el["ms"+uc] = el["moz"+uc] = el["o"+uc] = val;
                canvas.style.imageRendering = "-moz-crisp-edges";
                canvas.style.imageRendering = "-o-crisp-edges";
                canvas.style.imageRendering = "-webkit-optimize-contrast";
                canvas.style.imageRendering = "crisp-edges";
                canvas.style.msInterpolationMode = "nearest-neighbor"; // No effect on Canvas :/
            },
            SMOOTH: function( canvas, context ) {
                //ig.setVendorAttribute( context, "imageSmoothingEnabled", true );
                var el = context;
                var attr = "imageSmoothingEnabled";
                var val = true;
                var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
                el[attr] = el["ms"+uc] = el["o"+uc] = val;
                canvas.style.imageRendering = "";
                canvas.style.msInterpolationMode = "";
            }
        };
        ig.System.scaleMode = ig.System.SCALE.SMOOTH;
    }
    
});
