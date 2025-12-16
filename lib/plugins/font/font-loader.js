/**
 * This plugin requires fontface observer and promise polyfill.
 * Please include the library on load.js and push.sh
 */

ig.module('plugins.font.font-loader')
.requires(
    'impact.impact',//Need ig.class
    'plugins.font.font-info',
    'impact.loader'
)
.defines(function(){
    ig.FontLoader = ig.Class.extend({
        fontInfo: new ig.FontInfo(),
        onload: false,
        onerror: false,

        init: function(onload, onerror){
            this.onload = onload;
            this.onerror = onerror;
        },
        load: function(){
            if(this.fontInfo.isValid()){
                this._loadByLib();
            }else{
                console.error('Only lowercased alphanumeric and dash are allowed for font file name!. Please check the font path');
            }
        },

        _loadByLib: function(){
            //This is using FontFaceObserver 3rd party library. Please change method if using other 3rd party library
            var observers = [];
            for (var i = 0; i < this.fontInfo.fonts.length; i++) {
                var observer = new FontFaceObserver(this.fontInfo.fonts[i].name);
                observers.push(observer.load()); // Default timeout is 3000ms. For setting timeout --> observers.push(observer.load(null, theTimeoutMs));
            }
            Promise.all(observers)
            .then(this.onload)
            .catch(this.onerror);
        },
    });

    //This is example of using font-loader on ig.Loader (inject) to make sure the font are loaded first
    ig.Loader.inject({
        parentLoad: false,
        load: function(){
            //We will lost this.parent function after async call, thus we need to save the parent load function to another variable
            this.parentLoad = this.parent;
            new ig.FontLoader(
                this.onFontLoad.bind(this), 
                this.onFontError.bind(this)
            ).load();
        },
        onFontLoad: function(fonts){
            this.parentLoad();
        },
        onFontError: function(err){
            console.error('Font is not loaded');
            this.parentLoad(); // Run the game if the font is not retrieved.
        },
    });
});