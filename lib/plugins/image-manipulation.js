// Jason Low's Image Manipulation Plugin
// jason.low@impact360design.com
// v1.2
// Based on Image Blender, v0.1 - https://github.com/deakster/impact-imageblender

// Notes:
// v1.2 - overwrite impactJS load function
// v1.2 - add detection for tainted canvas scenario
// v1.1 - replaced single quotes with double quotes for strings

// Known Issues:
// - only supports full 6 character hex values (shorthand hex not supported)
// - multiply filter is used if none is specified
// - cross origin tainted canvas DOMException only occurs on Chrome, when opening index.html on local file system.
//   programmer should implement a fallback for this scenario
// - if manipulation fails (e.g. tainted canvas) the image is still drawable but is in its original colours.
//   It will also have a tainted = true flag set

// Usage Examples:
/*
image0: new ig.Image("media/graphics/testImage.png#dd0000"),
image1: new ig.Image("media/graphics/testImage.png#dd0000^grayscale"),
image2: new ig.Image("media/graphics/testImage.png#dd0000^screen"),
image3: new ig.Image("media/graphics/testImage.png#dd0000^overlay"),
image4: new ig.Image("media/graphics/testImage.png#dd0000^softlight"),
*/

ig.module(
    "plugins.image-manipulation"
).requires(
    "impact.image"
).defines(function () {

ig.Image.inject({

    //OVERWRITE IMPACT'S ORIGINAL LOAD FUNCTION
    //add Image.crossOrigin = 'anonymous'
    //validate path filename, remove everything after '#'
    load: function( loadCallback ) {
        if( this.loaded ) {
            if( loadCallback ) {
                loadCallback( this.path, true );
            }
            return;
        }
        else if( !this.loaded && ig.ready ) {
            this.loadCallback = loadCallback || null;

            this.data = new Image();
            this.data.onload = this.onload.bind(this);
            this.data.onerror = this.onerror.bind(this);
            if(window.location.protocol != 'file:'){
                this.data.crossOrigin = 'anonymous';
            }
            this.data.src = ig.prefix + this.path.split("#")[0] + ig.nocache;
        }
        else {
            ig.addResource( this );
        }

        ig.Image.cache[this.path] = this;
    },

    //EXTEND IMPACT'S ORIGINAL ONLOAD FUNCTION
    onload: function( event ) {
        this.parent( event );

        var hashIndex = this.path.indexOf("#");
        var argIndex = this.path.indexOf("^");
        if (hashIndex !== -1 || argIndex !== -1) {
            this.convertToCanvas();

            var ctx = this.data.getContext("2d");
            try{
                var imgData = ctx.getImageData(0, 0, this.data.width, this.data.height);
            }catch(e){
                console.log('canvas is tainted by cross origin data: ' + this.path);
                this.tainted = true;
                return;
            }

            if(argIndex !== -1){
                if(this.path.substr(argIndex + 1, 9) == "grayscale"){
                    imgData = this.filter_grayscale(imgData);
                }else if(this.path.substr(argIndex + 1, 6) == "screen"){
                    imgData = this.filter_screen(imgData);
                }else if(this.path.substr(argIndex + 1, 7) == "overlay"){
                    imgData = this.filter_overlay(imgData);
                }else if(this.path.substr(argIndex + 1, 9) == "softlight"){
                    imgData = this.filter_softlight(imgData);
                }else if(this.path.substr(argIndex + 1, 8) == "multiply"){
                    imgData = this.filter_multiply(imgData);
                }
            }else{
                imgData = this.filter_multiply(imgData);
            }
            ctx.putImageData(imgData, 0, 0);
        }
    },

    convertToCanvas: function () {
        if (this.data.getContext) { // Check if it"s already a canvas
            return;
        }

        var orig = ig.$new("canvas");
        orig.width = this.width;
        orig.height = this.height;
        orig.getContext("2d").drawImage( this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height );
        this.data = orig;
    },

    filter_grayscale: function(pixels) {
        var d = pixels.data;
        for (var i=0; i<d.length; i+=4) {
            var r = d[i];
            var g = d[i+1];
            var b = d[i+2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126*r + 0.7152*g + 0.0722*b;
            d[i] = d[i+1] = d[i+2] = v
        }
        return pixels;
    },

    filter_multiply: function(pixels) {
        // Multiply algorithm based on https://github.com/Phrogz/context-blender
        var hashIndex = this.path.indexOf("#");

        var src = pixels.data;
        var sA, dA = 1;
        var len = src.length;
        var dRA = parseInt(this.path.substr(hashIndex + 1, 2), 16) / 255;
        var dGA = parseInt(this.path.substr(hashIndex + 3, 2), 16) / 255;
        var dBA = parseInt(this.path.substr(hashIndex + 5, 2), 16) / 255;

        for (var px = 0; px < len; px += 4) {
            sA  = src[px+3] / 255;
            var dA2 = (sA + dA - sA * dA);
            var sRA = src[px  ] / 255 * sA;
            var sGA = src[px+1] / 255 * sA;
            var sBA = src[px+2] / 255 * sA;

            var demultiply = 255 / dA2;

            demultiply = 255 / dA2;

            // multiply
            src[px  ] = (sRA*dRA + dRA*(1-sA)) * demultiply;
            src[px+1] = (sGA*dGA + dGA*(1-sA)) * demultiply;
            src[px+2] = (sBA*dBA + dBA*(1-sA)) * demultiply;
        }

        return pixels;
    },

    filter_screen: function(pixels) {
        var hashIndex = this.path.indexOf("#");

        var src = pixels.data;
        var sA, dA = 1;
        var len = src.length;
        var dRA = parseInt(this.path.substr(hashIndex + 1, 2), 16) / 255;
        var dGA = parseInt(this.path.substr(hashIndex + 3, 2), 16) / 255;
        var dBA = parseInt(this.path.substr(hashIndex + 5, 2), 16) / 255;

        for (var px = 0; px < len; px += 4) {
            sA  = src[px+3] / 255;
            var dA2 = (sA + dA - sA * dA);
            var sRA = src[px  ] / 255 * sA;
            var sGA = src[px+1] / 255 * sA;
            var sBA = src[px+2] / 255 * sA;

            var demultiply = 255 / dA2;

            // screen
            src[px  ] = (sRA + dRA - sRA*dRA) * demultiply;
            src[px+1] = (sGA + dGA - sGA*dGA) * demultiply;
            src[px+2] = (sBA + dBA - sBA*dBA) * demultiply;
        }

        return pixels;
    },

    filter_overlay: function(pixels) {
        var hashIndex = this.path.indexOf("#");

        var src = pixels.data;
        var sA, dA = 1;
        var len = src.length;
        var r1 = parseInt(this.path.substr(hashIndex + 1, 2), 16);
        var g1 = parseInt(this.path.substr(hashIndex + 3, 2), 16);
        var b1 = parseInt(this.path.substr(hashIndex + 5, 2), 16);

        for (var px = 0; px < len; px += 4) {
            sA  = src[px+3] / 255;
            var f1=dA*sA, f2=dA-f1, f3=sA-f1;
            var r2=src[px], g2=src[px+1], b2=src[px+2];

            // overlay
            src[px]   = f1*this.Foverlay(r1,r2) + f2*r1 + f3*r2;
            src[px+1] = f1*this.Foverlay(g1,g2) + f2*g1 + f3*g2;
            src[px+2] = f1*this.Foverlay(b1,b2) + f2*b1 + f3*b2;
        }

        return pixels;
    },

    filter_softlight: function(pixels) {
        var hashIndex = this.path.indexOf("#");

        var src = pixels.data;
        var sA, dA = 1;
        var len = src.length;
        var r1 = parseInt(this.path.substr(hashIndex + 1, 2), 16);
        var g1 = parseInt(this.path.substr(hashIndex + 3, 2), 16);
        var b1 = parseInt(this.path.substr(hashIndex + 5, 2), 16);

        for (var px = 0; px < len; px += 4) {
            sA  = src[px+3] / 255;
            var f1=dA*sA, f2=dA-f1, f3=sA-f1;
            var r2=src[px], g2=src[px+1], b2=src[px+2];

            // soft light
            src[px]   = f1*this.Fsoftlight(r1,r2) + f2*r1 + f3*r2;
            src[px+1] = f1*this.Fsoftlight(g1,g2) + f2*g1 + f3*g2;
            src[px+2] = f1*this.Fsoftlight(b1,b2) + f2*b1 + f3*b2;
        }

        return pixels;
    },

    Foverlay: function(a,b) {
        return a<128 ?
            (a*b)>>7 : // (2*a*b)>>8 :
            255 - (( (255 - b) * (255 - a))>>7);
    },

    Fsoftlight: function(a,b) {
        /*
            http://en.wikipedia.org/wiki/Blend_modes#Soft_Light
            2ab+a^2 (1-2b), if b<0.5
            2a(1-b) +sqrt(a)(2b-1), otherwise
        */
        var b2=b<<1;
        if (b<128) return (a*(b2+(a*(255-b2)>>8)))>>8;
        else       return (a*(511-b2)+(Math.sqrt(a<<8)*(b2-255)))>>8;
    },

});

});
