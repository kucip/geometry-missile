ig.module('plugins.font.font-info')
.requires('impact.impact')
.defines(function(){
    ig.FontInfo = ig.Class.extend({
        //Include font infos here
        fonts: [
            {name: 'mainfont', source: 'media/fonts/cuyabra'},
            {name: 'bold mainfont', source: 'media/fonts/cuyabra-bold'}
        ],

        init: function(){
            this.registerCssFont();
        },

        /**Register font using css */
        registerCssFont: function(){
            if(this.fonts.length > 0){
                var newStyle = document.createElement('style');
                newStyle.type = "text/css"; 
                var textNode = '';
                for (var i = 0; i < this.fonts.length; i++) {
                    var font = this.fonts[i];
                    textNode += "@font-face {font-family: '" + font.name + "';src: url('" + font.source + ".eot');src: url('" + font.source + ".eot?#iefix') format('embedded-opentype'),url('" + font.source + ".woff2') format('woff2'),url('" + font.source + ".woff') format('woff'),url('" + font.source + ".ttf') format('truetype'),url('" + font.source + ".svg#svgFontName') format('svg')}";
                }
                
                newStyle.appendChild(document.createTextNode(textNode));
                document.head.appendChild(newStyle);
            }
        },

        isValid: function(){
            for (var i = 0; i < this.fonts.length; i++) {
                var font = this.fonts[i];
                if(!this._isValidName(font.source))
                    return false;
            }
            return true;
        },
        
        _isValidName: function(name){
            var regexp = /^[a-z0-9-\/]+$/;
            var check = name;
            if (check.search(regexp) == -1)
                return false;
            else
                return true;
        },
    });
});