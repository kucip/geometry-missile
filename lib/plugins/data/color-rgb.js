/**
 *  Vector
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 MarketJS. All rights reserved.
 */
ig.module('plugins.data.color-rgb')
.requires(
)
.defines(function () {
    ColorRGB = function(r,g,b,a){
        this.r=r||0;
        this.g=g||0;
        this.b=b||0;
        this.a=a||0;
    };
    ColorRGB.prototype = {
        setRandomColor:function()
        {
            this.r = Math.round(Math.random()*255);
            this.g = Math.round(Math.random()*255);
            this.b = Math.round(Math.random()*255);
        },
        getStyle:function()
        {
            return "rgba("+this.r+","+
                            this.g+","+
                            this.b+","+
                            this.a+")";
        },
        getHex:function(){
            var r = this.r.toString(16);
            var g = this.g.toString(16);
            var b = this.b.toString(16);
            var padding=2;
            while(r.length<padding){
                r = "0" + r;
            }
            while(g.length<padding){
                g = "0" + g;
            }
            while(b.length<padding){
                b = "0" + b;
            }
            return "#"+r+g+b;
        },
        getInvertedColor: function()
        {         
            return new ColorRGB(255-this.r,255-this.g,255-this.b,255-this.a);
        },
        clone:function(){
            return new ColorRGB(this.r,this.g,this.b,this.a);
        }
    };
});
