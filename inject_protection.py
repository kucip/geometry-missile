import sys
import jjencode

print ("Injecting anti-tampering protection codes ...")
print ("Destination file: " + sys.argv[1])

file1 = (sys.argv[1])

# Suppress console functions and freeze window.console and ig.system.context
# (function(){ 
#     console = window.console;
#     if( typeof(console) !== "undefined" ) {
#         console.trace = function() {};
#         console.error = function() {};
#         console.warn = function() {};
#     }
#     Object.freeze(console);
#     var renderers = ig.$("canvas");
#     for ( var canvasIndex = 0, context; canvasIndex < renderers.length; canvasIndex++ ) {
#         context = renderers[canvasIndex].getContext("2d");
#         Object.freeze(context);
#     }
# })();

uglifiedFunction = '!function(){console=window.console,"undefined"!=typeof console&&(console.trace=function(){},console.error=function(){},console.warn=function(){}),Object.freeze(console);for(var e,o=ig.$("canvas"),n=0;n<o.length;n++)e=o[n].getContext("2d"),Object.freeze(e)}();'
jjencodedText = jjencode.JJEncoder(uglifiedFunction, '_').encoded_text

with open(file1, "a") as myfile:
    myfile.write(jjencodedText)
